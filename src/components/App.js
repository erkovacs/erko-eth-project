import { Tabs, Tab, Navbar } from 'react-bootstrap'
import DoubleBlindStudy from '../abis/DoubleBlindStudy.json'
import React, { Component } from 'react';
import EnrollForm from './EnrollForm';
import Profile from './Profile';
import Order from './Order';
import ReportForm from './ReportForm';
import ClaimReward from './ClaimReward';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';


const TITLE = 'Double Blind Study Support App';

class App extends Component {

  async componentDidMount () {
    if (typeof window.ethereum !== 'undefined') {
      this.setState({ hasMetamask: true });
      await this.connectMetamask();
    } else {
      console.error('MetaMask is not installed.');
    }
  }

  async loadBlockchainData () {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.getAccounts();
    
    if (typeof accounts[0] !== 'undefined') {
      this.setState({
        web3: web3,
        account: accounts[0]
      });
    } else {
      throw new Error ('No Metamask accounts connected!');
    }
    
    const { abi, networks } = DoubleBlindStudy;
    const address = networks[networkId] ? networks[networkId].address : null;

    const study = 
      new web3.eth.Contract(abi, address);

    this.setState({
      study: study,
      address: address,
      isMetamaskConnected: true
    });
  }

  async connectMetamask () {
    await window.ethereum.enable();
    try {
      await this.loadBlockchainData();
    } catch (e) {
      console.error(e.message);
    }
  }

  async enroll (params) {
    // TODO:: validate, then commit to blockchain
    const json = JSON.stringify(params);
    alert(json);
  }

  async order () {
    throw new Error('Not implemented!');
  }

  async reportAdministration () {
    throw new Error('Not implemented!');
  }

  async reportStatus () {
    throw new Error('Not implemented!');
  }

  constructor(props) {
    super(props)
    this.state = {
      hasMetamask: false,
      isMetamaskConnected: false,
      web3: null,
      account: null,
      study: null,
      address: null,
      isPatientEnrolled: false,
      isStudyConcluded: false
    }
  }

  render() {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#">
          <img src={logo} className="App-logo" alt="logo" height="32"/>{' '}
            {TITLE}
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              { 
              this.state.hasMetamask ? 
                this.state.isMetamaskConnected ? 
                <div>Connected with account: <a href="#profile">{this.state.account}</a></div> : 
                <div><a href="#" onClick={() => this.connectMetamask()}>Please connect with MetaMask</a></div> :
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
              { this.state.hasMetamask ? 
                this.state.isMetamaskConnected ?
                  <Tabs defaultActiveKey={this.state.isPatientEnrolled ? 'Profile' : 'Enroll'} id="uncontrolled-tab-example">
                    <Tab eventKey="Enroll" title="Enroll" disabled={this.state.isPatientEnrolled}>
                      <EnrollForm 
                        data={this.state} 
                        onSubmit={ params => this.enroll(params) }
                      />
                    </Tab>
                    <Tab eventKey="Profile" title="Profile" disabled={!this.state.isPatientEnrolled}>
                      <Profile/>
                    </Tab>
                    <Tab eventKey="Order" title="Order">
                      <Order/>
                    </Tab>
                    <Tab eventKey="Report" title="Report">
                      <ReportForm/>
                    </Tab>
                    <Tab eventKey="Claim_reward" title="Claim reward" disabled={!this.state.isStudyConcluded}>
                      <ClaimReward/>
                    </Tab>
                  </Tabs> : <p></p> :
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
}

export default App;