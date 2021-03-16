import React, { useContext } from 'react';
import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Web3Context } from './Web3Context';

const Profile = props => {

  const { ctxState } = useContext(Web3Context);
  // TODO:: populate these parameters too
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
          <ListGroupItem><b>Height:</b> {0}</ListGroupItem>
          <ListGroupItem><b>Weight:</b> {0}</ListGroupItem>
          <ListGroupItem><b>Age:</b> {0}</ListGroupItem>
          <ListGroupItem><b>Gender:</b> {0}</ListGroupItem>
          <ListGroupItem><b>Enrolled on:</b> {0}</ListGroupItem>
        </ListGroup>
      </Card>
    </div>
  );
}

export default Profile;