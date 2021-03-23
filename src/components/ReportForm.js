import React, { useState, useContext } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import Slider from 'react-input-slider';
import { Web3Context } from './Web3Context';
import DatePickerInput from './DatePickerInput';
import { nowUnix } from '../utils';
import { REPORT_TYPES } from '../constants';
import { ToastContext } from './ToastContext';

const ReportForm = () => {

  const { web3jsState } = useContext(Web3Context);
  const [toast, addToast] = useContext(ToastContext);

  const [submitting, setSubmitting] = useState(false);

  // Global form state -- which form to show
  const [reportType, setReportType] = useState({
    value: '', 
    isValid: null
  });

  // Treatment administration report fields
  const DEF_FIELDS_FORM_STATE_TREATMENT = {
    treatmentKitId: { value: '', isValid: null },
    dosage: { value: '', isValid: null },
    timeOfAdministration: { value: nowUnix(), isValid: null }
  };

  const DEF_FIELDS_FORM_STATE_STATUS = {
    temperature: { value: '', label: 'Temperature (deg C)', isValid: null, type: 'number'},
    heartRate: { value: '', label: 'Heart rate (bps)', isValid: null, type: 'number'},
    bloodPressureHi: { value: '', label: 'Systolic blood pressure (mm Hg)', isValid: null, type: 'number'},
    bloodPressureLo: { value: '', label: 'Dyastolic blood pressure (mm Hg)', isValid: null, type: 'number'},
    bloodOxygenContent: { value: '', label: 'Blood oxygen content (SpO2, %)', isValid: null, type: 'number'},
    generalCondition: { value: 50, label: 'General condition', isValid: null, type: 'slider'},
    notes: { value: '', label: 'Notes', isValid: null, type: 'text' },
    timeOfReport: { value: nowUnix(), label: 'Time of Report', isValid: null, type: 'text' }
  };

  // State for Treatment Administration Report
  const [formStateTreatment, setFormStateTreatment] = useState(DEF_FIELDS_FORM_STATE_TREATMENT);

  // State for Status Report
  const [formStateStatus, setFormStateStatus] = useState(DEF_FIELDS_FORM_STATE_STATUS);

  const handleChange = (field, e) => {

    let value = e.target.value;
    let isValid = validateField(field, value);

    if ('reportType' === field) {
      setReportType({
        value,
        isValid
      });
    } else {
     
      let form, setter, fieldHandle = null;
      
      if (field in formStateTreatment) {
        form = formStateTreatment;
        setter = setFormStateTreatment;
      } else if (field in formStateStatus) {
        form = formStateStatus;
        setter = setFormStateStatus;
      }

      fieldHandle = form[field];
      fieldHandle.isValid = isValid;
      fieldHandle.value = value;
      
      setter({ ...form, [field]: fieldHandle });
    }
  }

  const validateField = (field, value) => {
    switch (field) {
      case 'dosage':
      case 'temperature':
      case 'heartRate':
      case 'bloodPressureHi':
      case 'bloodPressureLo':
      case 'bloodOxygenContent':
        return /[0-9.]/gi.test(value);
      case 'timeOfAdministration':
      case 'timeOfReport':
      case 'generalCondition':
        return (value != null && !isNaN(value));
      case 'reportType':
        return typeof REPORT_TYPES[value] !== 'undefined';
      case 'notes':
        return (value != null && value.length > 15);
      case 'treatmentKitId':
        return (value != null && value.length > 0);
      default:
        return false;
    }
  }

  const validateForm = () => {
    let valid = true;

    const form = REPORT_TYPES.STATUS_REPORT.value === reportType.value ? 
      formStateStatus : formStateTreatment;

    const fields = Object.keys(form);

    for (let field of fields) {
      // simulate onChange with this hack
      handleChange(field, { target: { value: form[field].value } });
      if (!form[field].isValid) {
        valid = false;
      }
    }

    return valid;
  }

  const getSliderColor = () => {
    if (formStateStatus.generalCondition.value < 33) return '#c82333';
    if (formStateStatus.generalCondition.value >= 33 && formStateStatus.generalCondition.value < 66) return '#ffc107';
    if (formStateStatus.generalCondition.value >= 66) return '#28a745';
  }

  const serializeFields = form => {
    const payload = {};
    payload.reportType = reportType.value;

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
      let form, method = null;

      if (REPORT_TYPES.STATUS_REPORT.value === reportType.value) {
        form = formStateStatus;
        method = 'reportStatus';
      } else if (REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.value === reportType.value) {
        form = formStateTreatment;
        method = 'reportTreatmentAdministration';
      }
      
      let payload = serializeFields(form);
      
      try {
        let result = await web3jsState.study.methods[method](payload).send();
        if (result.status) {
          // Reset fields
          setReportType({ value: '', isValid: null });
          setFormStateTreatment(DEF_FIELDS_FORM_STATE_TREATMENT);
          setFormStateStatus(DEF_FIELDS_FORM_STATE_STATUS);
          addToast('Success', 'Successfuly submitted report!');
        } else {
          throw new Error(`Error in transaction: ${JSON.stringify(result)}`);
        }
      } catch (e) {
        console.error(e.message);
        addToast('Error', `Error: ${e.message}`);
      }
    } else {
      addToast('Invalid data in form', 'Check the form for errors!');
    }
    setSubmitting(false);
  }

  return (
    <div>
      <br></br>
      <Card>
        <Card.Body>
          <Card.Title>Report Treatment Administration or Status</Card.Title>
          <Form>
            <br></br>
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
              <React.Fragment>
                <Form.Text className="card-title h5">
                  {REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT.label}
                </Form.Text>
                <Form.Group controlId="treatmentKitId">
                  <Form.Label>Treatment kit ID: </Form.Label>
                  <Form.Control 
                    isInvalid={formStateTreatment.treatmentKitId.isValid === false} 
                    isValid={formStateTreatment.treatmentKitId.isValid === true} 
                    type="text" 
                    value={formStateTreatment.treatmentKitId.value} 
                    onChange={e => handleChange('treatmentKitId', e)} />
                </Form.Group>
                <Form.Group controlId="dosage">
                  <Form.Label>Dosage (mg): </Form.Label>
                  <Form.Control 
                    isInvalid={formStateTreatment.dosage.isValid === false} 
                    isValid={formStateTreatment.dosage.isValid === true} 
                    type="number" 
                    value={formStateTreatment.dosage.value} 
                    onChange={e => handleChange('dosage', e)} />
                </Form.Group>
                <Form.Group controlId="timeOfAdministration">
                  <Form.Label>Date/Time of administration: </Form.Label><br></br> 
                  <DatePickerInput 
                    initialValue={formStateTreatment.timeOfAdministration.value}
                    /* Hacks beget hacks... */
                    onChange={datetime => handleChange('timeOfAdministration', { target: { value: datetime } })}
                    isInvalid={formStateTreatment.timeOfAdministration.isValid === false} 
                    isValid={formStateTreatment.timeOfAdministration.isValid === true} 
                  /> UTC
                </Form.Group>
              </React.Fragment> :
              ''
            }

            {
            REPORT_TYPES.STATUS_REPORT.value === reportType.value ? 
              <React.Fragment>
                <Form.Text className="card-title h5">
                  {REPORT_TYPES.STATUS_REPORT.label}
                </Form.Text>
                
                { [
                  'temperature', 
                  'heartRate', 
                  'bloodPressureHi', 
                  'bloodPressureLo', 
                  'bloodOxygenContent'
                ].map(field => {
                  return (
                    <Form.Group controlId={field} key={`formStateStatus_${field}`}>
                      <Form.Label>{formStateStatus[field].label} :</Form.Label>
                      <Form.Control 
                        isInvalid={formStateStatus[field].isValid === false} 
                        isValid={formStateStatus[field].isValid === true} 
                        type={formStateStatus[field].type} 
                        value={formStateStatus[field].value} 
                        onChange={e => handleChange(field, e)} />
                    </Form.Group>
                  );
                })}

                <Form.Group controlId='generalCondition'>
                  <Form.Label>General condition :</Form.Label><br></br>
                  <Slider
                    axis="x"
                    x={formStateStatus.generalCondition.value}
                    styles={{
                      active: {
                        backgroundColor: getSliderColor()
                      }
                    }}
                    onChange={({ x }) => handleChange('generalCondition', { target: { value: x } })}
                  />
                </Form.Group>
                <Form.Text className="text-muted">
                Please assess your general condition
                </Form.Text>
                <Form.Group controlId='notes'>
                  <Form.Label>Notes :</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    isInvalid={formStateStatus.notes.isValid === false} 
                    isValid={formStateStatus.notes.isValid === true} 
                    onChange={ e => handleChange('notes', e) } 
                  />
                </Form.Group>
                <Form.Text className="text-muted">
                {`${formStateStatus.notes.value ? formStateStatus.notes.value.length : 0} / 15 characters`}
                </Form.Text>
                <Form.Group controlId='timeOfReport'>
                  <Form.Label>Time of Report :</Form.Label><br></br>
                  <DatePickerInput 
                    initialValue={formStateStatus.timeOfReport.value}
                    onChange={datetime => handleChange('timeOfReport', { target: { value: datetime } })}
                    isInvalid={formStateStatus.timeOfReport.isValid === false} 
                    isValid={formStateStatus.timeOfReport.isValid === true} 
                  /> UTC
                </Form.Group>

              </React.Fragment>:
              ''
            }

            {
            REPORT_TYPES.NONE.value !== reportType.value ? 
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting === true}
                onClick={e => onSubmit(e)}>
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