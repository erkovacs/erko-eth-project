import React, { Component, useState, useContext } from 'react';
import { Badge, Button, Card, Table, Modal } from 'react-bootstrap';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';

const ClaimReward = props => {
  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [show, setShow] = useState(false);

  const handleClaimReward = async () => {
    try {
      const r = await web3jsState.study.methods.claimReward().send();
      // TODO:: implement post-reward action
      addToast('Success', 'Reward successfully received!');
    } catch (e) {
      addToast('Error', e.message);
    }
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
          <Button variant="success" onClick={() => setShow(true)}>Claim reward!</Button>
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