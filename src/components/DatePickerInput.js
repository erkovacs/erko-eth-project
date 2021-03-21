import React, { useState, forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DatePickerInput = props => {

  const toUnix = date => {
    return date ? Math.round(date.getTime() / 1000) : null;
  }

  const fromUnix = unix => {
    return unix ? unix * 1000 : null;
  }

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
      dateFormat="dd/MM/yyyy h:mm aa"
      showTimeInput
      customInput={<Form.Control type="text" isValid={props.isValid} isInvalid={props.isInvalid}/>}
    />
  );
}

export default DatePickerInput;