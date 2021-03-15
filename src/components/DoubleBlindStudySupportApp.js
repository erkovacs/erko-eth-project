import { Tabs, Tab, Navbar, Button } from 'react-bootstrap'
import React, { useContext, useEffect, useState } from 'react';
import EnrollForm from './EnrollForm';
import Profile from './Profile';
import Order from './Order';
import ReportForm from './ReportForm';
import ClaimReward from './ClaimReward';
import { Web3Context } from './Web3Context';
import { TITLE } from '../constants';
import logo from '../logo.png';
import './App.css';

const DoubleBlindStudySupportApp = props => {
  const { ctxState, connectMetamask } = useContext(Web3Context);
  const [state, setState] = useState({});

  useEffect(() => {
    setState(ctxState);
  }, [ctxState, ctxState.hasMetamask, ctxState.isMetamaskConnected]);

  return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="/">
          <img src={logo} className="App-logo" alt="logo" height="32"/>{' '}
            {TITLE}
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              { 
              state.hasMetamask ? 
                state.isMetamaskConnected ? 
                <div>Connected with account: <a href="/#" onClick={e => null}>{state.account}</a></div> : 
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
              <div className="content mr-auto ml-auto">
              { state.hasMetamask ? 
                  state.isMetamaskConnected ?
                  <Tabs defaultActiveKey={state.isPatientEnrolled ? 'Profile' : 'Enroll'} id="uncontrolled-tab-example">
                      <Tab eventKey="Enroll" title="Enroll" disabled={state.isPatientEnrolled}>
                        <EnrollForm />
                      </Tab>
                      <Tab eventKey="Profile" title="Profile" disabled={!state.isPatientEnrolled}>
                        <Profile/>
                      </Tab>
                      <Tab eventKey="Order" title="Order">
                        <Order/>
                      </Tab>
                      <Tab eventKey="Report" title="Report">
                        <ReportForm/>
                      </Tab>
                      <Tab eventKey="Claim_reward" title="Claim reward" disabled={!state.isStudyConcluded}>
                        <ClaimReward/>
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
        </div>
        <footer className="page-footer font-small blue pt-4">
          <div className="footer-copyright text-center py-3">© 2020 Copyright: 
            <a href="#">{` ${TITLE}`}</a>
          </div>
        </footer>
      </div>
    );
  }

export default DoubleBlindStudySupportApp;