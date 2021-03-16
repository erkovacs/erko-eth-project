import React, { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { REPORT_TYPES } from '../constants';

const ReportForm = () => {

  const [state, setState] = useState({
    fields: {
      reportType: { value: '', isValid: null }
    },
    error: ''
  });

  const handleChange = (field, e) => {
    const fields = state.fields;
    fields[field].value = e.target.value;
    fields[field].isValid = validateField(field, e.target.value);
    setState({ fields: fields });
  }

  const validateField = (field, value) => {
    switch (field) {
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

  const onSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      // TODO:: send report
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

            {REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value === state.fields.reportType.value ? 
              <Form.Text className="card-title h5">
                {REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.label}
              </Form.Text> :
              ''
            }

            {REPORT_TYPES.STATUS_REPORT.value === state.fields.reportType.value ? 
              <Form.Text className="card-title h5">
                {REPORT_TYPES.STATUS_REPORT.label}
              </Form.Text> :
              ''
            }

            {REPORT_TYPES.NONE.value !== state.fields.reportType.value ? 
              <Button variant="dark" type="submit" onClick={e => onSubmit(e)}>
                Submit Report
              </Button> : ''
            }
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReportForm;