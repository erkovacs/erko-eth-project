import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Badge, Button, Card, Table, Modal } from 'react-bootstrap';
import { Chart } from 'react-charts';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { REPORT_TYPES } from '../constants';

const Admin = props => {

  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [show, setShow] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsUpdated, setReportsUpdated] = useState(false);
  const [action, setAction] = useState('nop');

  useEffect(() => {
    (async () => {
      const count = await web3jsState.study.methods.getReportCount().call();
      for (let i = 1; i <= count; i++) {
        const reportRaw = await web3jsState.study.methods.getReport(i).call();
        const report = {
          id: reportRaw[0],
          data: JSON.parse(reportRaw[3]),
          ts: parseInt(reportRaw[4])
        };
        const reportsCopy = reports;
        reportsCopy.push(report);
        setReports(reportsCopy);
      }
      setReportsUpdated(true);
    })();
  }, []);

  const reportData = useMemo(() => {
    
    //
    // {"label":"Series 1","datums":[{"x":"Test 1","y":69},{"x":"Test 2","y":14}]}
    //
    const administrationReports = reports.filter(report => 
      report.data.reportType === REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value);

    const statusReports = reports.filter(report => 
      report.data.reportType === REPORT_TYPES.STATUS_REPORT.value);

    const data = [{
      label: 'Reports', datums: [{
        x: 'Administration reports',
        y: administrationReports.length
      }, {
        x: 'Status reports',
        y: statusReports.length
      }]
    }];

    return data;
  }, [reportsUpdated]);

  const axes = useMemo(() => [
    { primary: true, type: 'ordinal', position: 'bottom' },
    { position: 'left', type: 'linear', stacked: true }
  ], []);

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

  const handleActivateStudy = async () => {
    try {
      await web3jsState.study.methods.activate().send();
      addToast('Success', 'Study successfully activated');
    } catch (e) {
      addToast('Error', e.message);
    }
  }

  const conclude = async reason => {
    const message = JSON.stringify({ reason });
    try {
      await web3jsState.study.methods.conclude(message).send();
      addToast('Success', 'Study successfully concluded');
    } catch (e) {
      addToast('Error', e.message);
    }
  }

  const handleConcludeStudy = () => conclude('Study concluded successfully');

  const handleStopForEfficiency = () => conclude('Study stopped for efficiency');

  const handleStopForSafety = () => conclude('Study stopped for safety');

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
          <div
            style={{
              width: '600px',
              height: '300px',
              margin: '0 auto'
            }}
          >
            <Chart data={reportData} series={{ type: 'bar' }} axes={axes} tooltip />
          </div>
          <h4>
            Study status <Badge variant={web3jsState.isStudyActive ? 'success' : 'warning'}>{web3jsState.isStudyActive ? 'Active' : 'Inactive'}</Badge>
          </h4>
          <Table bordered responsive>
            <tbody>
              <tr>
                <td>Activate study </td>
                <td><Button variant="primary" disabled={web3jsState.isStudyActive} onClick={() => handleShow('handleActivateStudy')}>Activate study</Button></td>
              </tr>
              <tr>
                <td>Conclude study </td>
                <td><Button variant="primary" disabled={!web3jsState.isStudyActive} onClick={() => handleShow('handleConcludeStudy')}>Conclude study</Button></td>
              </tr>
            </tbody>
          </Table>
          <h4>
            Exceptional actions
            </h4>
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