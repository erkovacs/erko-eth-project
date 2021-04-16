import React, { useContext, useState } from 'react';
import { Badge, Button, Card, Table, Modal } from 'react-bootstrap';
import { formatDate } from '../utils';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { ProfileContext } from './ProfileContext';

const Admin = props => {

  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [show, setShow] = useState(false);
  const [action, setAction] = useState('nop');

  const handleClose = _action => {
    setShow(false);
    switch (_action) {
      case 'handleActivateStudy':
        handleActivateStudy();
        break;
      case 'handleConcludeStudy':
        handleConcludeStudy();
        break;
      case 'handleStopForEfficiency':
        handleStopForEfficiency();
        break;
      case 'handleStopForSafety':
        handleStopForSafety();
        break;
      default:
        break;
    }
    setAction('nop');
  }

  const handleShow = _action => {
    setShow(true);
    setAction(_action);
  }

  const handleActivateStudy = () => {
    try {
      web3jsState.study.methods.activate().send();
    } catch (e) {
      addToast('Error', e.message);
    }
  }

  const conclude = async reason => {
    const message = JSON.stringify({ reason });
    try {
      await web3jsState.study.methods.conclude(message).send();
    } catch (e) {
      addToast('Error', e.message);
    }
  }

  const handleConcludeStudy = () => {
    conclude('Study concluded successfully');
  }

  const handleStopForEfficiency = () => {
    conclude('Study stopped for efficiency');
  }

  const handleStopForSafety = () => {
    conclude('Study stopped for safety');
  }

  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Administrative dashboard</Card.Title>
          <Card.Text>
            <b>Account</b> <a href="/#">{web3jsState.account}</a>
          </Card.Text>
        </Card.Body>
        <Card.Body>
          <h1>TODO:: Add some graphs</h1>
          <h3>
            Study status <Badge variant={web3jsState.isStudyActive ? 'success' : 'warning'}>{web3jsState.isStudyActive ? 'Active' : 'Inactive'}</Badge>
          </h3>
          <Table bordered responsive>
            <tbody>
              <tr>
                <td>Activate study </td>
                <td><Button variant="success" disabled={web3jsState.isStudyActive} onClick={() => handleShow('handleActivateStudy')}>Activate study</Button></td>
              </tr>
              <tr>
                <td>Conclude study </td>
                <td><Button variant="success" disabled={!web3jsState.isStudyActive} onClick={() => handleShow('handleConcludeStudy')}>Conclude study</Button></td>
              </tr>
            </tbody>
          </Table>
          <h3>
            Exceptional actions
            </h3>
          <Table bordered responsive>
            <tbody>
              <tr>
                <td>Stop for Efficiency </td>
                <td><Button variant="danger" disabled={!web3jsState.isStudyActive} onClick={() => handleShow('handleStopForEfficiency')}>Stop for Efficiency</Button></td>
              </tr>
              <tr>
                <td>Stop for Safety </td>
                <td><Button variant="danger" disabled={!web3jsState.isStudyActive} onClick={() => handleShow('handleStopForSafety')}>Stop for Safety</Button></td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Modal show={show} onHide={() => handleClose('nop')}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm action</Modal.Title>
        </Modal.Header>
        <Modal.Body>This action cannot be undone! Are you sure you want to proceed?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleClose('nop')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleClose(action)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Admin;