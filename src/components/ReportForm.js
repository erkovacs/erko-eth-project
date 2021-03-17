import React, { useState, useContext } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Web3Context } from './Web3Context';
import DatePickerInput from './DatePickerInput';
import { REPORT_TYPES } from '../constants';

const ReportForm = () => {

  const { ctxState } = useContext(Web3Context);

  const [state, setState] = useState({
    fields: {
      reportType: { value: '', isValid: null },
      dosage: { value: '', isValid: null },
      timeOfAdministration: { value: '', isValid: null },
    },
    error: ''
  });

  const handleChange = (field, e) => {
    const fields = state.fields;
    let value = e.target.value;
    fields[field].value = value;
    fields[field].isValid = validateField(field, value);
    setState({ fields: fields });
  }

  const validateField = (field, value) => {
    switch (field) {
      case 'dosage':
        return /[0-9.]/gi.test(value);
      case 'timeOfAdministration':
        return null != value && !isNaN(value);
      case 'reportType':
        return typeof REPORT_TYPES[value] !== 'undefined';
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

  const onSubmit = async e => {
    e.preventDefault();
    if (validateForm()) {
      let payload = JSON.stringify(state.fields);
      let result = null;
      if (REPORT_TYPES.STATUS_REPORT.value === state.fields.reportType.value) {
        result = await ctxState.study.methods.reportStatus().send();
      } else if (REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value === state.fields.reportType.value) {
        result = await ctxState.study.methods.reportTreatmentAdministration().send();
      }
      console.log(result);
    } else {
      const fields = state.fields;
      setState({ error: 'Check the form for errors!', fields: fields });
    }
  }

  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Report Treatment Administration or Status</Card.Title>
          <Form>
            <br></br>
            {state.error ? <Alert variant="danger">
              {state.error}
            </Alert> : ''}
            <Form.Group controlId="reportType">
              <Form.Label>Report type</Form.Label>
              <Form.Control as="select" onChange={e => handleChange('reportType', e)}>
                { 
                  Object.keys(REPORT_TYPES).map(
                    (reportType, i) => {
                      return <option
                        key={i}
                        value={ REPORT_TYPES[reportType].value }>
                        { REPORT_TYPES[reportType].label }
                      </option>;
                    }) 
                }
              </Form.Control>
            </Form.Group>
            
            <Form.Text className="text-muted">
                Please use metric units
            </Form.Text>

            {
            REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value === state.fields.reportType.value ? 
              <div>
                <Form.Text className="card-title h5">
                  {REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.label}
                </Form.Text>
                <Form.Group controlId="dosage">
                <Form.Label>Dosage (mg): </Form.Label>
                <Form.Control 
                  isInvalid={state.fields.dosage.isValid === false} 
                  isValid={state.fields.dosage.isValid === true} 
                  type="number" 
                  value={state.fields.dosage.value} 
                  onChange={e => handleChange('dosage', e)} />
              </Form.Group>
              <Form.Group controlId="timeOfAdministration">
                <Form.Label>Date/Time of administration: </Form.Label><br></br> 
                <DatePickerInput 
                  /* Hacks beget hacks... */
                  onChange={datetime => handleChange('timeOfAdministration', { target: { value: datetime } })}
                  isInvalid={state.fields.timeOfAdministration.isValid === false} 
                  isValid={state.fields.timeOfAdministration.isValid === true} 
                />
              </Form.Group>
              </div> :
              ''
            }

            {
            REPORT_TYPES.STATUS_REPORT.value === state.fields.reportType.value ? 
              <Form.Text className="card-title h5">
                {REPORT_TYPES.STATUS_REPORT.label}
              </Form.Text> :
              ''
            }

            {
            REPORT_TYPES.NONE.value !== state.fields.reportType.value ? 
              <Button variant="dark" type="submit" onClick={e => onSubmit(e)}>
                Submit
              </Button> : ''
            }
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReportForm;