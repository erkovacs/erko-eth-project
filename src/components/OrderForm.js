import React, { useState, useContext } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';

const OrderForm = props => {
  const { web3jsState } = useContext(Web3Context);
  const [toast, addToast] = useContext(ToastContext);

  const [submitting, setSubmitting] = useState(false);

  // State for Treatment Administration Report
  const [fields, setFields] = useState({
    field1: { value: '', label: 'Field 1', isValid: null, type: 'text' },
    field2: { value: '', label: 'Field 2', isValid: null, type: 'text' }
  });

  const handleChange = (field, e) => {

    let value = e.target.value;
    let isValid = validateField(field, value);

    const fieldHandle = fields[field];
    fieldHandle.value = value;
    fieldHandle.isValid = isValid;

    setFields({ ...fields, [field]: fieldHandle });
  }

  const validateField = (field, value) => {
    switch (field) {
      default:
        return false;
    }
  }

  const validateForm = () => {
    let valid = true;

    const fieldsNames = Object.keys(fields);

    for (let field of fieldsNames) {
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

    const fieldNames = Object.keys(fields);
    for (let field of fieldNames) {
      payload[field] = fields[field].value;
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
      //
      // TODO:: do the whole dance:
      // 
      // 1. Send address to external service
      // 2. Get kit voucher
      // 3. Send user hash and kit voucher to contract
      // 4. Receive order id
      // 5. Send order id to external service
      // 6. External service will determine on basis of order id if treatment or placebo kit will be delivered
      //
    } else {
      addToast('Invalid data in form', 'Check the form for errors!');
    }
    setSubmitting(false);
  }

  return (
    <React.Fragment>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Order Treatment Kit</Card.Title>
          <Form>
            <br></br>
                <React.Fragment>
                  {[
                    'field1',
                    'field2',
                  ].map(field => {
                    return (
                      <Form.Group controlId={field} key={`fields_${field}`}>
                        <Form.Label>{fields[field].label} :</Form.Label>
                        <Form.Control
                          isInvalid={fields[field].isValid === false}
                          isValid={fields[field].isValid === true}
                          type={fields[field].type}
                          value={fields[field].value}
                          onChange={e => handleChange(field, e)} />
                      </Form.Group>
                    );
                  })}
                </React.Fragment>
              <Button
                variant="primary"
                type="submit"
                disabled={submitting === true}
                onClick={e => onSubmit(e)}>
                Submit
              </Button>
          </Form>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
}

export default OrderForm;