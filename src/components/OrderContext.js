import React, { createContext, useState, useEffect, useContext } from 'react';
import { Web3Context } from './Web3Context';
import { redactString, fromUnix } from '../utils';
import { Bytes32_NULL, EXT_DRUGSTORE_API } from '../constants';


export const OrderContext = createContext();

export const OrderStates = { 
  Unconfirmed: 'UNCONFIRMED',
  Confirmed: 'CONFIRMED',
  Closed: 'CLOSED'
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
    order._patientId = rpcResult[1];
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
        // grab all orders
        const allOrders = [];
        const orderCountString = await web3jsState.study.methods.orderCount().call();
        const orderCount = parseInt(orderCountString);
        
        for (let i = 1; i <= orderCount; i++) {
          const rawOrder = await web3jsState.study.methods.orders(i).call();
          const order = OrderFactory(rawOrder);
          order.state = OrderStates.Closed;
          if (order._patientId === web3jsState.patientId) {
            allOrders.push(order);
          }
        }
        
        setOrders(allOrders);

        // mark the current one as active
        const result = await web3jsState.study.methods.getCurrentOrder().call();
        const order = OrderFactory(result);
        if (order) {
          // Verify if partner drug store also has this order
          const orderResult = await fetch(`${EXT_DRUGSTORE_API.ORDER}?orderId=${order.id}`);
          const isOrderConfirmed = await orderResult.json();
          if (isOrderConfirmed[0] && isOrderConfirmed[0].success) {
            order.state = OrderStates.Confirmed;
          }
          const _orders = order.filter(_order => order.id !== _order.id);
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