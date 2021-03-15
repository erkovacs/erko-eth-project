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
    study: null,
    address: null,
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

        // Check if we are enrolled
        const patientId = await study.methods.isPatientEnrolled(account).call();
        const isPatientEnrolled =  Bytes32_NULL !== patientId;

        // TODO:: remove after debug is done
        window.__contract = study.methods;

        setState({
          hasMetamask: true,
          web3 : web3,
          address: address,
          study: study,
          account: account,
          isMetamaskConnected: isMetamaskConnected,
          isPatientEnrolled: isPatientEnrolled,
          patientId: patientId
        });
      } catch (e) {
        setState({
          hasMetamask: true,
          isMetamaskConnected: isMetamaskConnected,
        });
        console.error(e.message);
      }
    } else {
      setState({
        hasMetamask: false
      });
      console.error('MetaMask is not installed.');
    }
  }

  const connectMetamask = async () => {
    await loadBlockchainData();
  }

  const setCtxState = async _state => {
    setState(_state);
  }

  return (<Web3Context.Provider value={{ 
      ctxState: state, 
      setCtxState: setCtxState,
      connectMetamask: connectMetamask, 
    }}>{props.children}</Web3Context.Provider>);
}