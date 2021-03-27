import React, { createContext, useState, useEffect, useContext } from 'react';
import { Web3Context } from './Web3Context';
import { redactString } from '../utils';


export const OrderContext = createContext();

export const OrderProvider = props => {
  const { web3jsState } = useContext(Web3Context);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!web3jsState.study) {
      return;
    }
    (async () => {
      const result = await web3jsState.study.methods.getCurrentOrder().call();
      if (typeof result[0] !== 'undefined' && result[0] !== '') {
        let patientId = redactString(result[1], 30, 40);
        let voucher = redactString(result[2], 5);

        const order = {
          id: result[0],
          patientId: patientId,
          voucher: voucher,
          date: new Date(parseInt(result[3]) * 1000)
        };
        const _orders = orders.filter(_order => order.id !== _order.id);
        setOrders([..._orders, order]);
      }
    })();
  }, [web3jsState.isPatientEnrolled])

  return (
    <OrderContext.Provider
      value={[orders, setOrders]}>
      {props.children}
    </OrderContext.Provider>);
}