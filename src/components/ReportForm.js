import React, { useState, useContext } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Web3Context } from './Web3Context';
import DatePickerInput from './DatePickerInput';
import { REPORT_TYPES } from '../constants';

const ReportForm = () => {

  const { ctxState } = useContext(Web3Context);

  // Global form state -- which form to show
  const [reportType, setReportType] = useState({
    value: '', 
    isValid: null
  });

  const [_error, _setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for Treatment Administration Report
  const [formStateTreatment, setFormStateTreatment] = useState({
    fields: {
      dosage: { value: '', isValid: null },
      timeOfAdministration: { value: '', isValid: null },
    }
  });

  // State for Status Return
  // TODO:: create the second form too
  const [formStateStatus, setFormStateStatus] = useState({
    fields: {
    }
  });

  const handleChange = (field, e) => {
    let value = e.target.value;
    let isValid = validateField(field, value);
    if ('reportType' === field) {
      setReportType({
        value,
        isValid
      });
    } else {
      const fields = formStateTreatment.fields;
      fields[field].value = value;
      fields[field].isValid = isValid;
      setFormStateTreatment({ fields });
    }
    
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
    const fields = formStateTreatment.fields;
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
      let payload = JSON.stringify(formStateTreatment.fields);
      let method = null;
      if (REPORT_TYPES.STATUS_REPORT.value === reportType.value) {
        method = 'reportStatus';
      } else if (REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value === reportType.value) {
        method = 'reportTreatmentAdministration';
      }
      try {
        let result = await ctxState.study.methods[method](payload).send();
        if (result.status) {
          // Reset
          setReportType({ value: '', isValid: null });
          setFormStateTreatment({ 
            fields : {
              dosage: { value: '', isValid: null },
              timeOfAdministration: { value: '', isValid: null }
            }
          });
          setSuccess('Successfuly submitted report!');
          setTimeout(() => setSuccess(null), 6000);
        } else {
          throw new Error(`Error in transaction: ${JSON.stringify(result)}`);
        }
      } catch (e) {
        console.error(e.message);
        _setError(`Error: ${e.message}`);
      }
    } else {
      _setError('Check the form for errors!');
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
            {_error ? <Alert variant="danger">
              {_error}
            </Alert> : ''}
            {success ? <Alert variant="success">
              {success}
            </Alert> : ''}
            <Form.Group controlId="reportType">
              <Form.Label>Report type</Form.Label>
              <Form.Control as="select" onChange={e => handleChange('reportType', e)}>
                { 
                  Object.keys(REPORT_TYPES).map(
                    (_reportType, i) => {
                      return <option
                        key={i}
                        value={ REPORT_TYPES[_reportType].value }>
                        { REPORT_TYPES[_reportType].label }
                      </option>;
                    }) 
                }
              </Form.Control>
            </Form.Group>
            
            <Form.Text className="text-muted">
                Please use metric units
            </Form.Text>

            {
            REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value === reportType.value ? 
              <div>
                <Form.Text className="card-title h5">
                  {REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.label}
                </Form.Text>
                <Form.Group controlId="dosage">
                <Form.Label>Dosage (mg): </Form.Label>
                <Form.Control 
                  isInvalid={formStateTreatment.fields.dosage.isValid === false} 
                  isValid={formStateTreatment.fields.dosage.isValid === true} 
                  type="number" 
                  value={formStateTreatment.fields.dosage.value} 
                  onChange={e => handleChange('dosage', e)} />
              </Form.Group>
              <Form.Group controlId="timeOfAdministration">
                <Form.Label>Date/Time of administration: </Form.Label><br></br> 
                <DatePickerInput 
                  /* Hacks beget hacks... */
                  onChange={datetime => handleChange('timeOfAdministration', { target: { value: datetime } })}
                  isInvalid={formStateTreatment.fields.timeOfAdministration.isValid === false} 
                  isValid={formStateTreatment.fields.timeOfAdministration.isValid === true} 
                />
              </Form.Group>
              </div> :
              ''
            }

            {
            REPORT_TYPES.STATUS_REPORT.value === reportType.value ? 
              <Form.Text className="card-title h5">
                {REPORT_TYPES.STATUS_REPORT.label}
              </Form.Text> :
              ''
            }

            {
            REPORT_TYPES.NONE.value !== reportType.value ? 
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