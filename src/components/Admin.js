import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Badge, Button, Card, Table, Modal, Spinner } from 'react-bootstrap';
import { Chart } from 'react-charts';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { REPORT_TYPES } from '../constants';
import { fromUnix } from '../utils';

const formatPatient = rawPatient => {
  const patient = {};
  patient.id = rawPatient._id;
  patient.mappingId = rawPatient._mappingId;
  patient.patientId = rawPatient._patientId;
  patient.hasBeenRewarded = rawPatient._hasBeenRewarded;
  patient.data = JSON.parse(rawPatient._data);
  patient.enrolledOn = rawPatient._enrolledOn;
  return patient;
}

const formatReport = rawReport => {
  const report = {};
  report.id = rawReport._id;
  report.patientId = rawReport._patientId;
  report.reportType = rawReport._reportType;
  report.reportedOn = rawReport._reportedOn;
  const data = JSON.parse(rawReport._data);
  report.data = data;
  return report;
}

const formatOrder = rawOrder => {
  let order = {};
  order.id = rawOrder[0];
  order.patientId = rawOrder[1];
  order.voucher = rawOrder[2];
  order.date = new Date(fromUnix(parseInt(rawOrder[3])));
  return order;
}

const downloadJson = json => {
  const url = window.URL.createObjectURL(
    new Blob([json]),
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    'data.json',
  );

  document.body.appendChild(link);

  link.click();
  link.parentNode.removeChild(link);
}

const Admin = props => {

  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
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
  ]);

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

  const handleGetData = async () => {
    setLoading(true);
    try {
      const data = {
        patients: {},
        orders: [],
        reports: []
      };

      const reportCount = await web3jsState.study.methods.reportCount().call();
      for (let i = 1; i <= reportCount; i++) {
        const rawReport = await web3jsState.study.methods.reports(i).call();
        const report = formatReport(rawReport);
        data.reports.push(report);
      }

      data.reports.forEach(report => data.patients[report.patientId] = {});
      const patientIds = Object.keys(data.patients);
      patientIds.forEach(async patientId => {
        const rawPatient = await web3jsState.study.methods.patients(patientId).call();
        data.patients[patientId] = formatPatient(rawPatient);
      });

      const orderCount = await web3jsState.study.methods.orderCount().call();
      for (let i = 1; i <= orderCount; i++) {
        const rawOrder = await web3jsState.study.methods.orders(i).call();
        const order = formatOrder(rawOrder);
        data.orders.push(order);
      }

      const json = JSON.stringify(data);
      downloadJson(json);
    } catch (e) {
      addToast('Error', e.message);
    }
    setLoading(false);
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
          { loading ? <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner> : null }
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
              <tr>
                <td>Get data</td>
                <td><Button variant="primary" disabled={web3jsState.isStudyActive || loading} onClick={() => handleGetData()}>Get data</Button></td>
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