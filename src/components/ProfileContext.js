import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';

export const ProfileContext = createContext();

export const ProfileProvider = props => {
  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [patientData, setPatientData] = useState({});

  useEffect(() => {
    if (web3jsState.isPatientEnrolled) {
      (async () => {
        const patientData = await getPatientData();
        setPatientData(patientData);
      })();
    }
  }, [web3jsState.isPatientEnrolled]);

  const getPatientData = async () => {
    const patientData = {};

    // Fast fail if patient not yet enrolled
    if (!web3jsState.isPatientEnrolled) {
      return patientData;
    }

    try {
      const result = await web3jsState.study.methods.getPatientData(web3jsState.account).call();

      if (typeof result[2] !== 'undefined' && result[2] !== '') {
        patientData.mappingId = result[2];
      } else {
        throw new Error('Invalid result received.');
      }

      if (typeof result[3] !== 'undefined' && result[3] !== '') {
        const data = JSON.parse(result[3]);
        const props = Object.keys(data);
        for (let prop of props) {
          patientData[prop] = data[prop];
        }
      } else {
        throw new Error('Invalid result received.');
      }

      if (typeof result[4] !== 'undefined' && result[4] !== '') {
        let ts = 0;
        ts = parseInt(result[4]);
        if (isNaN(ts)) {
          ts = 0;
        }
        ts = ts * 1000; // s to ms
        patientData.date = new Date(ts);
      } else {
        throw new Error('Invalid result received, no enrollment timestamp present.');
      }
    } catch (e) {
      addToast('Error', e.message);
      console.error('Error: ' + e.message);
    }
    return patientData;
  }

  return (<ProfileContext.Provider value={{ patientData }}>{props.children}</ProfileContext.Provider>);
}