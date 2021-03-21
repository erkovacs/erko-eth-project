import React, { useContext, useEffect, useState } from 'react';
import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
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
            Account <a href="/#">{ctxState.account}</a>
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem><b>Patient ID:</b> {ctxState.patientId}</ListGroupItem>
          <ListGroupItem><b>Height:</b> {patientData.height ? `${patientData.height.value} cm` : ''}</ListGroupItem>
          <ListGroupItem><b>Weight:</b> {patientData.weight ? `${patientData.weight.value} kg` : ''}</ListGroupItem>
          <ListGroupItem><b>Age:</b> {patientData.age ? `${patientData.age.value} years` : ''}</ListGroupItem>
          <ListGroupItem><b>Gender:</b> {patientData.gender ? patientData.gender.value : ''}</ListGroupItem>
          <ListGroupItem><b>Enrolled on:</b> {patientData.date ? patientData.date.toString() : ''}</ListGroupItem>
        </ListGroup>
      </Card>
    </div>
  );
}

export default Profile;