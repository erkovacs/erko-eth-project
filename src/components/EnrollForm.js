import { Alert, Button, Card, Form } from 'react-bootstrap'
import React, { useState, useContext } from 'react';
import { Bytes32_NULL, GENDERS } from '../constants';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';

const EnrollForm = () => {

  const { web3jsState, setWeb3jsState } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);

  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState({
    fields: {
      account: { value: web3jsState.account, isValid: null },
      height: { value: '', isValid: null },
      weight: { value: '', isValid: null },
      age: { value: '', isValid: null },
      gender: { value: null, isValid: null }
    }
  });

  const handleChange = (field, e) => {
    const fields = state.fields;
    fields[field].value = e.target.value;
    fields[field].isValid = validateField(field, e.target.value);
    setState({ fields: fields });
  }

  const validateField = (field, value) => {
    switch (field) {
      case 'height':
      case 'weight':
      case 'age':
        return /[0-9.]/gi.test(value);
      case 'gender':
        return GENDERS.indexOf(value) > -1;
      case 'account':
        return /^0x.{40}/gi.test(value);
      default:
        return false;
    }
  }

  const validateForm = () => {
    let valid = true;
    const fields = state.fields;
    const keys = Object.keys(fields);
    for (let field of keys) {
      // simulate onChange with this hack
      handleChange(field, { target: { value: fields[field].value } });
      if (!fields[field].isValid) {
        valid = false;
      }
    }
    return valid;
  }

  const serializeFields = form => {
    const payload = {};
    const fields = Object.keys(form);
    for (let field of fields) {
      payload[field] = form[field].value;
    }
    return JSON.stringify(payload);
  }

  const onSubmit = async e => {
    e.preventDefault();

    if (true === submitting) {
      return; 
    } else {
      setSubmitting(true);
    }
    
    if (validateForm()) {
      try {
        const payload = serializeFields(state.fields);
        await web3jsState.study.methods.enroll(payload).send();
        const patientId = await web3jsState.study.methods.isPatientEnrolled(state.fields.account.value).call();
        if (Bytes32_NULL !== patientId) {
          addToast('Success', 'Successfully enrolled!');
          setWeb3jsState({ isPatientEnrolled: true, patientId: patientId });
        } else {
          addToast('Error', `Invalid patient ID returned: ${patientId}`);
          console.error(`Error: Invalid patient ID returned: ${patientId}`);
        }
      } catch (e) {
        addToast('Error', e.message);
        console.error(e.message);
      }
    } else {
      addToast('Error', 'Check the form for errors!');
    }
    setSubmitting(false);
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
              <Form.Control
                isInvalid={state.fields.account.isValid === false} 
                isValid={state.fields.account.isValid === true} 
                type="text" 
                value={state.fields.account.value} 
                onChange={e => handleChange('account', e)} 
                disabled />
              <Form.Text className="text-muted">
                Your wallet address will not be in any way associated with any of your Personally Identifiable Information.
              </Form.Text>
            </Form.Group>

            <Form.Text className="card-title h5">Patient parameters</Form.Text>
            
            <Form.Group controlId="height">
              <Form.Label>Height (cm): </Form.Label>
              <Form.Control 
                isInvalid={state.fields.height.isValid === false} 
                isValid={state.fields.height.isValid === true} 
                type="number" 
                value={state.fields.height.value} 
                onChange={e => handleChange('height', e)} />
            </Form.Group>
            <Form.Group controlId="weight">
              <Form.Label>Weight (kg): </Form.Label>
              <Form.Control 
                isInvalid={state.fields.weight.isValid === false} 
                isValid={state.fields.weight.isValid === true} 
                type="number" 
                value={state.fields.weight.value} 
                onChange={e => handleChange('weight', e)} />
            </Form.Group>

            <Form.Text className="text-muted">
                Please use metric units
            </Form.Text>

            <Form.Group controlId="age">
              <Form.Label>Age: </Form.Label>
              <Form.Control 
                isInvalid={state.fields.age.isValid === false} 
                isValid={state.fields.age.isValid === true} 
                type="number" 
                value={state.fields.age.value} 
                onChange={e => handleChange('age', e)} />
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
                  onChange={e => handleChange('gender', e)}/>)
              }) }
            </Form.Group>

            <Button variant="primary" type="submit" disabled={submitting === true} onClick={e => onSubmit(e)}>
              Enroll
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default EnrollForm;