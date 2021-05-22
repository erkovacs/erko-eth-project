import React, { createContext, useContext, useState, useEffect } from 'react';
import MEDToken from '../abis/MEDToken.json';
import DoubleBlindStudy from '../abis/DoubleBlindStudy.json';
import { ToastContext } from './ToastContext';
import { Bytes32_NULL } from '../constants';
import { parseBool } from '../utils';
import Web3 from 'web3';

const { localStorage, ethereum } = window;

export const Web3Context = createContext();

export const Web3Provider = props => {

  const [toasts, addToast] = useContext(ToastContext);
  const [state, setState] = useState({
    hasMetamask: false,
    isMetamaskConnected: false,
    web3: null,
    account: null,
    isStudyActive: null,
    study: null,
    address: null,
    patientId: null,
    isOwner: false,
    isPatientEnrolled: false,
    isStudyConcluded: false,
    hasToken: false,
    hasBeenRewarded: false
  });

  useEffect(() => {
    if (!state.isMetamaskConnected) {
      loadBlockchainData();
    }
  }, [state.isMetamaskConnected]);

  async function loadBlockchainData() {

    // Check for object exposed by Metamask 
    if (typeof ethereum !== 'undefined') {

      let account = null;
      let isMetamaskConnected = false;

      // Try to connect first, if not already connected
      try {
        if (!state.isMetamaskConnected) {
          await ethereum.enable();
        }

        const web3 = new Web3(ethereum);
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

        let patientId, isPatientEnrolled, hasToken, hasBeenRewarded;
        const isStudyActive = await study.methods.active().call();

        // Check if we are enrolled
        patientId = await study.methods.isPatientEnrolled(account).call();
        isPatientEnrolled = Bytes32_NULL !== patientId;

        const isOwner = await study.methods.isOwner().call();
        const isConcluded = await study.methods.isConcluded().call();

        hasToken = state.hasToken;
        hasBeenRewarded = state.hasBeenRewarded;

        // Grab whether patient was already paid
        const patientData = await study.methods.getPatientData(account).call();
        if (typeof patientData[5] !== 'undefined' && patientData[5] !== '') {
          hasBeenRewarded = patientData[5];
        }

        // Create initial localStorage values
        if (null === localStorage.getItem(`hasToken.${account}`)) {
          localStorage.setItem(`hasToken.${account}`, false);
        } else {
          hasToken = parseBool(localStorage.getItem(`hasToken.${account}`));
        }
        if (null === localStorage.getItem(`hasBeenRewarded.${account}`)) {
          localStorage.setItem(`hasBeenRewarded.${account}`, hasBeenRewarded);
        }

        // Subscribe to events
        study.once('StudyActivated', {}, (error, event) => setState({ ...state, isStudyActive: true }));
        study.once('StudyConcluded', {}, (error, event) => setState({ ...state, isStudyActive: false }));
        study.once('PatientRewarded', { filter: { patientId: patientId } },
          (error, event) => {
            setState({ ...state, hasBeenRewarded: true });
            localStorage.setItem(`hasBeenRewarded.${account}`, true);
          });

        setState({
          ...state,
          hasToken: hasToken,
          hasBeenRewarded: hasBeenRewarded,
          hasMetamask: true,
          web3: web3,
          address: address,
          study: study,
          isStudyActive: isStudyActive,
          account: account,
          isMetamaskConnected: isMetamaskConnected,
          isPatientEnrolled: isPatientEnrolled,
          isOwner: isOwner,
          isStudyConcluded: isConcluded,
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

  const loadMEDToken = async () => {
    const web3 = new Web3(ethereum);
    const networkId = await web3.eth.net.getId();
    const { networks } = MEDToken;
    const address = networks[networkId] ? networks[networkId].address : null;
    const tokenSymbol = 'MED';
    const tokenDecimals = 0;
    const tokenImage = null;

    let wasAdded = false;
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: address, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });
    } catch (e) {
      console.log(e.message);
      addToast('Error', e.message);
    }
    localStorage.setItem(`hasToken.${state.account}`, wasAdded);
    setState({ ...state, hasToken: wasAdded });
  }

  const connectMetamask = async () => await loadBlockchainData();

  const setWeb3jsState = async _state => setState(_state);

  return (<Web3Context.Provider value={{
    web3jsState: state,
    setWeb3jsState: setWeb3jsState,
    connectMetamask: connectMetamask,
    proposeToken: loadMEDToken
  }}>{props.children}</Web3Context.Provider>);
}