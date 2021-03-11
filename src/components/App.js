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

    // check if MetaMask exists

    // assign to values to variables: web3, netId, accounts

    // check if account is detected, then load whatever is needed, else 
    // push alert

    // in try block load contracts

    // if MetaMask not exists push alert
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: ''
    }
  }

  render() {
    return (
      <h1>Hello world</h1>
    );
  }
}

export default App;