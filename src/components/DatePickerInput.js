import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { toUnix, fromUnix } from '../utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DatePickerInput = props => {

  let initialValue = fromUnix(props.initialValue);
  initialValue = new Date(initialValue);

  const [startDate, setStartDate] = useState(initialValue);
  
  return (
    <DatePicker
      selected={startDate}
      onChange={date => { 
        setStartDate(date);
        const timestamp = toUnix(date);
        props.onChange(timestamp);
      }}
      timeInputLabel="Time: "
      showTimeInput
      timeFormat="HH:mm"
      dateFormat="dd/MM/yyyy HH:mm"
      customInput={<Form.Control type="text" isValid={props.isValid} isInvalid={props.isInvalid}/>}
    />
  );
}

export default DatePickerInput;