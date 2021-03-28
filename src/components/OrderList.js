import React, { useContext } from 'react'
import { Badge, Button, Card, Table } from 'react-bootstrap';
import { OrderContext, OrderStates } from './OrderContext';
import { REPORT_TYPES } from '../constants';
import { formatDate } from '../utils';

const OrderList = props => {
  const [orders, setOrders] = useContext(OrderContext);

  // Go to ReportForm and switch to the Treatment Administration form
  const navigateToReport = () => {
    props.setNavTab('Report');
    props.setReportType(REPORT_TYPES.TREATMENT_ADMINISTRATION_REPORT);
  }

  return (
    <React.Fragment>
      <br></br>
      <Card>
        <Card.Body>
        { orders.length ? <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient ID</th>
                <th>Voucher code</th>
                <th>State</th>
                <th>Ordered on</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              { orders.map( order => { 
                return(
                  <tr key={`order_${order.id}`}>
                    <td>{ order.id }</td>
                    <td>{ order.patientId }</td>
                    <td>{ order.voucher }</td>
                    <td>
                      <Badge variant={ order.state === OrderStates.Confirmed ? 'success' : 'warning' }>
                        { order.state === OrderStates.Confirmed ? 'confirmed' : 'unconfirmed' }
                      </Badge>
                    </td>
                    <td>{ formatDate(order.date) }</td>
                    <td>
                      <Button size='sm' onClick={() => navigateToReport()}>Administer</Button>
                    </td>
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