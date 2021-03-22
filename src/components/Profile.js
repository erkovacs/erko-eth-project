import React, { useContext, useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { formatDate } from '../utils';
import { Web3Context } from './Web3Context';

const Profile = props => {

  const { ctxState } = useContext(Web3Context);
  const [patientData, setPatientData] = useState({});

  useEffect(() => {
    (async () => {
      const patientData = await getPatientData();
      setPatientData(patientData);
    })();
  }, []);

  const getPatientData = async () => {
    const patientData = {};

    try {
      const result = await ctxState.study.methods.getPatientData(ctxState.account).call();
      if ('undefined' !== typeof result[2]) {
        const data = JSON.parse(result[2]);
        const props = Object.keys(data);
        for(let prop of props) {
          patientData[prop] = data[prop];
        }
      } else {
        throw new Error('Invalid result received.');
      }

      if ('undefined' !== typeof result[3]) {
        let ts = 0;
        ts = parseInt(result[3]);
        if(isNaN(ts)) {
          ts = 0;
        }
        ts = ts * 1000; // s to ms
        patientData.date = new Date(ts);
      } else {
        throw new Error('Invalid result received, no enrollment timestamp present.');
      }
      return patientData;
    } catch (e) {
      // TODO:: add toast here if there is time left
      console.error('Error: ' + e.message);
      return {};
    }
  }

  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Patient Profile</Card.Title>
          <Card.Text>
            <b>Account</b> <a href="/#">{ctxState.account}</a>
          </Card.Text>
        </Card.Body>
        <Card.Body>
        <Table bordered hover>
          <tbody>
            <tr><td><b>Patient ID</b></td><td>{ctxState.patientId}</td></tr>
            <tr><td><b>Height</b></td><td>{patientData.height ? `${patientData.height.value} cm` : '-'}</td></tr>
            <tr><td><b>Weight</b></td><td>{patientData.weight ? `${patientData.weight.value} kg` : '-'}</td></tr>
            <tr><td><b>Age</b></td><td>{patientData.age ? `${patientData.age.value} years` : '-'}</td></tr>
            <tr><td><b>Gender</b></td><td>{patientData.gender ? patientData.gender.value : '-'}</td></tr>
            <tr><td><b>Enrolled on</b></td><td>{patientData.date ? `${formatDate(patientData.date)} UTC` : '-'}</td></tr>
          </tbody>
        </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;