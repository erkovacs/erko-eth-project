import { Tabs, Tab } from 'react-bootstrap'
import DoubleBlindStudy from '../abis/DoubleBlindStudy.json'
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';


class App extends Component {

  async componentDidMount() {
    console.log(Tabs, Tab);
    console.log(DoubleBlindStudy);
    console.log(Web3);
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();
      
      if (typeof accounts[0] !== 'undefined') {
        this.setState({
          web3: web3,
          account: accounts[0]
        });
      } else {
        throw new Error ('Please install MetaMask browser extension!');
      }
    } else {
      throw new Error ('Please install MetaMask browser extension!');
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      account: null
    }
  }

  render() {
    return (
      <h1>Hello world</h1>
    );
  }
}

export default App;