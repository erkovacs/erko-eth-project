import { Card, Form, Button } from 'react-bootstrap'
import React, { useState, useContext } from 'react';
import { Web3Context } from './Web3Context';
import './Form.css';

const GENDERS = [
  'male',
  'female',
  'other'
];

const EnrollForm = props => {

  const { data } = useContext(Web3Context);
  const [state, setState] = useState({
    account: data.account,
    height: 0,
    weight: 0,
    age: 0,
  });

  const handleChange = (e, field) => {
    // TODO:: fix "Warning: A component is changing a controlled input of type text to be uncontrolled. Input elements should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://fb.me/react-controlled-components"
    // Here
    setState({ 
      [field]: e.target.value 
    });
  }

  const isValid = data => {
    // let fields = Object.keys(data);
    // for (let field of fields) {
    //   console.log(field, data[field]);
    // }
    return true;
  }

  const onSubmit = e => {
    e.preventDefault();
    if(isValid(state)) {
      console.log(state);
    }
  }
  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Patient Enrollment for Study participation</Card.Title>
          <Form>
            <br></br>
            <Form.Group controlId="account">
              <Form.Label>Patient Wallet address: </Form.Label>
              <Form.Control type="text" value={state.account} onChange={e => handleChange(e, 'account')} disabled />
              <Form.Text className="text-muted">
                Your wallet address will not be in any way associated with any of your Personally Identifiable Information.
              </Form.Text>
            </Form.Group>

            <Form.Text className="card-title h5">Patient parameters</Form.Text>
            
            <Form.Group controlId="height">
              <Form.Label>Height (cm): </Form.Label>
              <Form.Control type="number" value={state.height} onChange={e => handleChange(e, 'height')} />
            </Form.Group>
            <Form.Group controlId="weight">
              <Form.Label>Weight (kg): </Form.Label>
              <Form.Control type="number" value={state.weight} onChange={e => handleChange(e, 'weight')} />
            </Form.Group>

            <Form.Text className="text-muted">
                Please use metric units
            </Form.Text>

            <Form.Group controlId="age">
              <Form.Label>Age: </Form.Label>
              <Form.Control type="number" value={state.age} onChange={e => handleChange(e, 'age')} />
            </Form.Group>

            <Form.Group controlId="gender">
              <Form.Label>Gender: </Form.Label>
              { GENDERS.map(gender => {
                return (<Form.Check 
                  type="radio" 
                  label={gender} 
                  value={gender} 
                  key={`gender_${gender}`} 
                  id="gender"
                  name="gender" 
                  onChange={e => handleChange(e)}/>)
              }) }
            </Form.Group>

            <Button variant="dark" type="submit" onClick={e => onSubmit(e)}>
              Enroll
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default EnrollForm;