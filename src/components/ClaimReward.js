import React, { useState, useContext, useEffect } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { parseBool } from '../utils';
import MEDToken from '../abis/MEDToken.json';


const ClaimReward = props => {
  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasToken = parseBool(window.localStorage.getItem('hasToken'));
    if (!hasToken) loadMEDToken();
  }, [])

  const loadMEDToken = async () => {
    window.localStorage.setItem('hasToken', false);

    const networkId = await web3jsState.web3.eth.net.getId();
    const { networks } = MEDToken;
    const address = networks[networkId] ? networks[networkId].address : null;
    const tokenSymbol = 'MED';
    const tokenDecimals = 0;
    const tokenImage = null;

    let wasAdded = false;
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      wasAdded = await window.ethereum.request({
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
    window.localStorage.setItem('hasToken', wasAdded);
  }

  const handleClaimReward = async () => {
    try {
      await web3jsState.study.methods.claimReward().send();
      addToast('Success', 'Reward successfully received!');
    } catch (e) {
      console.error(e.message);
      addToast('Error', e.message);
    }
    setShow(false);
  }

  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Claim reward</Card.Title>
          <Card.Text>
            The study is concluded and you are entitled to your reward
          </Card.Text>
        </Card.Body>
        <Card.Body>
          {/* 
            TODO:: Persist web3jsState.isPatientRewarded state in localStorage or pull from contract by adding a function for that 
          */}
          <Button variant="success" onClick={() => setShow(true)} disabled={web3jsState.isPatientRewarded}>Claim reward!</Button>
        </Card.Body>
      </Card>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm action</Modal.Title>
        </Modal.Header>
        <Modal.Body>This action cannot be undone! Are you sure you want to proceed?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleClaimReward()}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClaimReward;