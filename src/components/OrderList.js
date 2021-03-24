import React, { useState, useEffect } from 'react'
import { Card, Table } from 'react-bootstrap';
import { formatDate } from '../utils';

const OrderList = props => {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // TODO:: get orders from contract
  }, [])

  return (
    <React.Fragment>
      <br></br>
      <Card>
        <Card.Body>
        { orders.length ? <Table striped bordered hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              { orders.map( order => { 
                return(
                <tr key={`order_${order.id}`}>
                  <td>{ order.id }</td>
                  <td>{ order.status }</td>
                  <td>{ formatDate(order.date) }</td>
                  </tr>
                );
              }) }
            </tbody>
          </Table> :
          <Card.Title>You have no orders.</Card.Title> }
        </Card.Body>
      </Card>
    </React.Fragment>
  )
}

export default OrderList;