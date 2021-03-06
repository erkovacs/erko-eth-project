import React, { useEffect, useState, useContext } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { OrderContext, OrderFactory, OrderStates } from './OrderContext';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { ProfileContext } from './ProfileContext';
import { EXT_DRUGSTORE_API } from '../constants';

const OrderForm = props => {
  const { web3jsState } = useContext(Web3Context);
  const [toast, addToast] = useContext(ToastContext);
  const [orders, setOrders] = useContext(OrderContext);
  const { patientData } = useContext(ProfileContext);

  const [submitting, setSubmitting] = useState(false);

  const FIELD_DEFAULTS = {
    mappingId: { value: '', label: 'Mapping ID', isValid: null, type: 'text', disabled: true },
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
  };
  
  // State for Treatment Administration Report
  const [fields, setFields] = useState(FIELD_DEFAULTS);
  
  useEffect(() => {
    if (patientData.mappingId) {
      handleChange('mappingId', { target: { value: patientData.mappingId } });
    }
  }, [patientData.mappingId]);

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
      case 'mappingId':
        return /^0x[a-fA-F0-9]{64}$/g.test(value);
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

  const serializeFields = fields => {
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
      try {
        const payload = serializeFields(fields);

        // 1. Send address to external service
        const drugstoreResult = await fetch(EXT_DRUGSTORE_API.VOUCHER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        
        // 2. Get kit voucher
        const drugstoreVoucher = await drugstoreResult.json();
        if (drugstoreVoucher.success) {
          const { voucher } = drugstoreVoucher;
          
          // 3. Send kit voucher to contract
          await web3jsState.study.methods.order(voucher).send();
          
          // 4. Receive order id
          const result = await web3jsState.study.methods.getCurrentOrder().call();
          const order = OrderFactory(result);

          if (order) {
            // Update orders
            let _orders = orders.filter(_order => order.id !== _order.id);
            _orders.push(order);
            setOrders(_orders);
            
            // 5. Send order id to external service to confirm order
            const orderConfirmationResult = await fetch(EXT_DRUGSTORE_API.ORDER, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                voucher: voucher
              })
            });
            
            const orderConfirmation = await orderConfirmationResult.json();

            if (orderConfirmation.success) {
              // Confirm order
              _orders = _orders.map(_order => {
                if (order.id === _order.id) {
                  _order.state = OrderStates.Confirmed;
                }
                return _order;
              });
              
              setOrders(_orders);
              setFields({ 
                ...FIELD_DEFAULTS, 
                mappingId: { 
                  ...FIELD_DEFAULTS.mappingId, 
                  value: patientData.mappingId, 
                  isValid: true 
                }
              });
              addToast('Success', 'Successfuly placed order!');
            } else {
              throw new Error('Order could not be confirmed with drugstore.');
            }
          } else {
            throw new Error('Order ID could not be obtained.');
          }
        } else {
          throw new Error('Drugstore voucher could not be obtained.');
        }
      } catch (e) {
        addToast('Error', e.message);
      }
    } else {
      addToast('Invalid data in form', 'Check the form for errors!');
    }
    setSubmitting(false);
  }

  const activeOrders = orders.filter(order => order.state === OrderStates.Confirmed);

  return (
    <React.Fragment>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Order Treatment Kit</Card.Title>
          { activeOrders.length === 0 ? <Form>
            <br></br>
            <React.Fragment>
              {[
                [ 'mappingId' ],
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
                        onChange={e => handleChange(field1, e)}
                        disabled={activeOrders.length > 0 || fields[field1].disabled}
                        readOnly={fields[field1].disabled}/>
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
                        onChange={e => handleChange(field2, e)} 
                        disabled={activeOrders.length > 0 || fields[field2].disabled}
                        readOnly={fields[field2].disabled}/>
                    </Form.Group> 
                  </Col> : '' }
                </Row>
                );
              })}
            </React.Fragment>
            <Form.Text className="text-muted">
              The address provided here will not be in any way associated with any of your Personally Identifiable Information.
            </Form.Text>
            <Button
              variant="primary"
              type="submit"
              disabled={submitting === true}
              onClick={e => onSubmit(e)}>
              Order
              </Button>
          </Form> : <Card.Text>You already have an active order!</Card.Text> }
        </Card.Body>
      </Card>
    </React.Fragment>
  );
}

export default OrderForm;