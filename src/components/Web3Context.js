import React, { createContext, useState, useEffect } from 'react';
import DoubleBlindStudy from '../abis/DoubleBlindStudy.json';
import { Bytes32_NULL } from '../constants';
import Web3 from 'web3';
import './App.css';

export const Web3Context = createContext();

export const Web3Provider = props => {
  const [state, setState] = useState({
    hasMetamask: false,
    isMetamaskConnected: false,
    web3: null,
    account: null,
    isStudyActive: null,
    studyBeginDate: null,
    study: null,
    address: null,
    isOwner: false,
    isPatientEnrolled: false,
    isStudyConcluded: false
  });

  useEffect(() => {
    (async () => loadBlockchainData())();
  }, [state.hasMetamask, state.isMetamaskConnected]);

  const loadBlockchainData = async () => {

    // Check for object exposed by Metamask 
    if (typeof window.ethereum !== 'undefined') {

      let account = null;
      let isMetamaskConnected = false;
      
      // Try to connect first, if not already connected
      try {
        if (!state.isMetamaskConnected) {
          await window.ethereum.enable();
        }

        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const accounts = await web3.eth.getAccounts();

        const { abi, networks } = DoubleBlindStudy;
        const address = networks[networkId] ? networks[networkId].address : null;

        // Make sure we have a main account
        if (typeof accounts[0] !== 'undefined') {
          account = accounts[0];
          isMetamaskConnected = true;
        }

        const study = new web3.eth.Contract(abi, address, {
          from: account
        });
        
        let patientId, isPatientEnrolled;
        const isStudyActive = await study.methods.active().call();

        const isOwner = await study.methods.isOwner().call();

        // Check if we are enrolled
        patientId = await study.methods.isPatientEnrolled(account).call();
        isPatientEnrolled =  Bytes32_NULL !== patientId;

        // Subscribe to events
        study.once('StudyActivated', {}, (error, event) => setState({...state, isStudyActive: true}))
        study.once('StudyConcluded', {}, (error, event) => setState({...state, isStudyActive: false}))

        setState({
          hasMetamask: true,
          web3 : web3,
          address: address,
          study: study,
          isStudyActive: isStudyActive,
          account: account,
          isOwner: isOwner,
          isMetamaskConnected: isMetamaskConnected,
          isPatientEnrolled: isPatientEnrolled,
          patientId: patientId
        });
      } catch (e) {
        setState({
          ...state,
          hasMetamask: true,
          isMetamaskConnected: isMetamaskConnected,
        });
        console.error(e.message);
      }
    } else {
      setState({
        ...state, 
        hasMetamask: false
      });
      console.error('MetaMask is not installed.');
    }
  }

  const connectMetamask = async () => {
    await loadBlockchainData();
  }

  const setWeb3jsState = async _state => {
    setState(_state);
  }

  return (<Web3Context.Provider value={{ 
      web3jsState: state, 
      setWeb3jsState: setWeb3jsState,
      connectMetamask: connectMetamask, 
    }}>{props.children}</Web3Context.Provider>);
}