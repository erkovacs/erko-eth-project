import React, { useContext } from 'react';
import { Card, Table } from 'react-bootstrap';
import { formatDate } from '../utils';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { ProfileContext } from './ProfileContext';

const Profile = props => {

  const { web3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const { patientData } = useContext(ProfileContext);

  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Patient Profile</Card.Title>
          <Card.Text>
            <b>Account</b> <a href="/#">{web3jsState.account}</a>
          </Card.Text>
        </Card.Body>
        <Card.Body>
        <Table bordered hover responsive>
          <tbody>
            <tr><td><b>Patient ID</b></td><td>{web3jsState.patientId}</td></tr>
            <tr><td><b>Mapping ID</b></td><td>{patientData.mappingId ? patientData.mappingId : '-'}</td></tr>
            <tr><td><b>Height</b></td><td>{patientData.height ? `${patientData.height} cm` : '-'}</td></tr>
            <tr><td><b>Weight</b></td><td>{patientData.weight ? `${patientData.weight} kg` : '-'}</td></tr>
            <tr><td><b>Age</b></td><td>{patientData.age ? `${patientData.age} years` : '-'}</td></tr>
            <tr><td><b>Gender</b></td><td>{patientData.gender ? patientData.gender : '-'}</td></tr>
            <tr><td><b>Enrolled on</b></td><td>{patientData.date ? `${formatDate(patientData.date)} UTC` : '-'}</td></tr>
          </tbody>
        </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;