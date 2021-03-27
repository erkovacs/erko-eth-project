import React, { useState, useContext } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';

const OrderForm = props => {
  const { web3jsState } = useContext(Web3Context);
  const [toast, addToast] = useContext(ToastContext);

  const [submitting, setSubmitting] = useState(false);

  // State for Treatment Administration Report
  const [fields, setFields] = useState({
    phone: { value: '', label: 'Phone', isValid: null, type: 'text' },
    fax: { value: '', label: 'Fax', isValid: null, type: 'text' },
    county: { value: '', label: 'County', isValid: null, type: 'text' },
    locality: { value: '', label: 'Locality', isValid: null, type: 'text' },
    code: { value: '', label: 'Post code', isValid: null, type: 'text' },
    street: { value: '', label: 'Street name', isValid: null, type: 'text' },
    number: { value: '', label: 'Street number', isValid: null, type: 'text' },
    entrance: { value: '', label: 'Entrance number', isValid: null, type: 'text' },
    block: { value: '', label: 'Block', isValid: null, type: 'text' },
    floor: { value: '', label: 'Floor', isValid: null, type: 'text' },
    apartmentNumber: { value: '', label: 'Apartment number', isValid: null, type: 'text' },
    notes: { value: '', label: 'Notes', isValid: null, type: 'text' }
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
      case 'code':
        return /[0-9]{6}/gi.test(value);
      case 'fax':
      case 'notes':
        return true;
      default:
        return value !== null && value !== '';
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
      const payload = serializeFields(fields);
      // 1. Send address to external service
      // TODO:: make it work
      console.log(payload);

      // 2. Get kit voucher
      const voucher = 'XX-YY-ZZ-1234';
      
      // 3. Send kit voucher to contract
      await web3jsState.study.methods.order(voucher).send();
      
      // 4. Receive order id
      const result = await web3jsState.study.methods.getCurrentOrder().call();
      console.log(result);
      
      // TODO
      // 5. Send order id to external service
      // Done!
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
                [ 'phone',    'fax' ],
                [ 'county' ],
                [ 'locality', 'code' ],
                [ 'street',   'number' ],
                [ 'entrance', 'block' ],
                [ 'floor',    'apartmentNumber' ],
                [ 'notes' ]
              ].map(fieldGroup => {
                const [field1, field2] = fieldGroup;
                return (
                <Row key={`fields_${field1}_${field2}`}>
                  { field1 ? <Col>
                    <Form.Group controlId={field1}>
                      <Form.Control
                        isInvalid={fields[field1].isValid === false}
                        isValid={fields[field1].isValid === true}
                        type={fields[field1].type}
                        value={fields[field1].value}
                        placeholder={fields[field1].label}
                        onChange={e => handleChange(field1, e)} />
                    </Form.Group>
                  </Col> : '' }
                  { field2 ? <Col>
                    <Form.Group controlId={field2} key={`fields_${field2}`}>
                      <Form.Control
                        isInvalid={fields[field2].isValid === false}
                        isValid={fields[field2].isValid === true}
                        type={fields[field2].type}
                        value={fields[field2].value}
                        placeholder={fields[field2].label}
                        onChange={e => handleChange(field2, e)} />
                    </Form.Group> 
                  </Col> : '' }
                </Row>
                );
              })}
            </React.Fragment>
            <Button
              variant="primary"
              type="submit"
              disabled={submitting === true}
              onClick={e => onSubmit(e)}>
              Order
              </Button>
          </Form>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
}

export default OrderForm;