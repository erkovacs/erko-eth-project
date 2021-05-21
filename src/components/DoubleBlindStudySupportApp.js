import { Alert, Tabs, Tab, Navbar, Button } from 'react-bootstrap'
import React, { useContext, useEffect, useState } from 'react';
import EnrollForm from './EnrollForm';
import Profile from './Profile';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import ReportForm from './ReportForm';
import ClaimReward from './ClaimReward';
import Admin from './Admin';
import { Web3Context } from './Web3Context';
import { ToastContext } from './ToastContext';
import { TITLE } from '../constants';
import logo from '../logo.png';
import './App.css';

const DoubleBlindStudySupportApp = props => {
  const { web3jsState, connectMetamask } = useContext(Web3Context);
  const [toasts, addToast] = useContext(ToastContext);
  const [navTab, setNavTab] = useState('Enroll');
  const [reportType, setReportType] = useState({
    value: '', 
    isValid: null
  });

  useEffect(() => {
    if (web3jsState.isOwner) {
      setNavTab('Admin');
    } else if (web3jsState.isStudyConcluded) {
      setNavTab('Claim_reward');
    } else {
      setNavTab(web3jsState.isPatientEnrolled ? 'Profile' : 'Enroll');
    }
  }, [web3jsState.isOwner, web3jsState.isPatientEnrolled, web3jsState.isStudyConcluded]);

  return (
      <React.Fragment>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="/">
          <img src={logo} className="App-logo" alt="logo" height="32"/>{' '}
            {TITLE}
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              { 
              web3jsState.hasMetamask ? 
                web3jsState.isMetamaskConnected ? 
                <div>Connected with account: <a href="/#" onClick={e => null}>{web3jsState.account}</a></div> : 
                <div><a href="/#" onClick={() => connectMetamask()}>Please connect with MetaMask</a></div> :
              <div>Please connect with <a href="https://metamask.io/">MetaMask</a></div>
              } 
            </Navbar.Text>
          </Navbar.Collapse>
        </Navbar>

        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>{TITLE}</h1>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto col-lg-8 col-md-10">
              { web3jsState.hasMetamask && web3jsState.isMetamaskConnected && 
              !web3jsState.isStudyActive && !web3jsState.isOwner ? 
                <Alert variant="warning">
                  Study is not yet active. Please check back soon!
                </Alert> : null }

              { web3jsState.hasMetamask ? 
                  web3jsState.isMetamaskConnected ?
                    web3jsState.isOwner ?
                      <Admin />
                      : 
                      <Tabs activeKey={navTab} onSelect={key => setNavTab(key)} id="nav-tabs">
                        <Tab eventKey="Enroll" title="Enroll" disabled={web3jsState.isPatientEnrolled || web3jsState.isOwner}>
                          <EnrollForm />
                        </Tab>
                        <Tab eventKey="Profile" title="Profile" disabled={!web3jsState.isPatientEnrolled || web3jsState.isStudyConcluded}>
                          <Profile />
                        </Tab>
                        <Tab eventKey="Order" title="Order" disabled={!web3jsState.isPatientEnrolled || web3jsState.isStudyConcluded}>
                          <OrderForm />
                        </Tab>
                        <Tab eventKey="My_orders" title="My Orders" disabled={!web3jsState.isPatientEnrolled || web3jsState.isStudyConcluded}>
                          <OrderList setNavTab={setNavTab} setReportType={setReportType} />
                        </Tab>
                        <Tab eventKey="Report" title="Report" disabled={!web3jsState.isPatientEnrolled || web3jsState.isStudyConcluded}>
                          <ReportForm reportType={reportType} setReportType={setReportType}/>
                        </Tab>
                        <Tab eventKey="Claim_reward" title="Claim reward" disabled={!web3jsState.isStudyConcluded}>
                          <ClaimReward />
                        </Tab>
                      </Tabs> :

                      <p>Welcome to {TITLE}! This is a Blockchain-enabled website.<br></br><br></br>
                        <Button variant="primary" type="submit" onClick={() => connectMetamask()}>
                          Connect with MetaMask
                        </Button>
                      </p>  :

                      <p>Welcome to {TITLE}! This is a Blockchain-enabled website. Please connect with <a href="https://metamask.io/">MetaMask</a></p> 
              }
              </div>
            </main>
          </div>
          
          <div style={{
            position: 'fixed',
            top: 80,
            right: 20,
          }}>
            { toasts }
          </div>
        </div>
        <footer className="page-footer font-small blue pt-4">
          <div className="footer-copyright text-center py-3">© 2020 Copyright: 
            <a href="/#">{` ${TITLE}`}</a>
          </div>
        </footer>
      </React.Fragment>
    );
  }

export default DoubleBlindStudySupportApp;