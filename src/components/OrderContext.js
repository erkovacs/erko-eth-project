import React, { createContext, useState, useEffect, useContext } from 'react';
import { Web3Context } from './Web3Context';
import { redactString, fromUnix } from '../utils';
import { Bytes32_NULL, EXT_DRUGSTORE_API } from '../constants';


export const OrderContext = createContext();

export const OrderStates = { 
  Unconfirmed: 'UNCONFIRMED',
  Confirmed: 'CONFIRMED',
}

export const OrderFactory = rpcResult => {
  let order = null;
  if (
    typeof rpcResult[0] !== 'undefined' && 
    rpcResult[0] !== '' && 
    rpcResult[1] !== Bytes32_NULL
  ) {
    order = {};
    order.id = rpcResult[0];
    order.patientId = redactString(rpcResult[1], 30, 40);
    order.voucher = redactString(rpcResult[2], 5);
    order.state = OrderStates.Unconfirmed;
    order.date = new Date(fromUnix(parseInt(rpcResult[3])));
  }
  return order;
}

export const OrderProvider = props => {
  const { web3jsState } = useContext(Web3Context);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!web3jsState.study) {
      return;
    }
    (async () => {
      try {
        const result = await web3jsState.study.methods.getCurrentOrder().call();
        const order = OrderFactory(result);
        if (order) {
          // Verify if partner drug store also has this order
          const orderResult = await fetch(`${EXT_DRUGSTORE_API.ORDER}?orderId=${order.id}`);
          const isOrderConfirmed = await orderResult.json();
          if (isOrderConfirmed[0] && isOrderConfirmed[0].success) {
            order.state = OrderStates.Confirmed;
          }
          const _orders = orders.filter(_order => order.id !== _order.id);
          setOrders([..._orders, order]);
        }
      } catch (e) {
        console.error(e.message);
      }
    })();
  }, [web3jsState.isPatientEnrolled]);

  return (
    <OrderContext.Provider
      value={[orders, setOrders]}>
      {props.children}
    </OrderContext.Provider>);
}