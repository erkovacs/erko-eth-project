# MSc. Thesis project - dApp for performing Double Blind Clinical Studies

## Intro

This app aims to facilitate ad-hoc, decentralised, fully-voluntary participation to clinical studies. Such studies are usually performed so that the efficacy of a new treatment can be assessed, however this same basic experiment design could in practice be used to check the efficacy of *any* newly-introduced behaviour, including the takeup of a new hobby or other change in environment or behaviour. 

The idea is to setup a decentralised double-blind experiment where neither the party setting it up (the Monitor) nor the subjects are aware whether they belong to the Control group (which receives the same treatment they got before or a placebo treatment, where applicable) or the Treatment group (which receives the legitimate new treatment being trialed).

Because we store a record of every action on the blockchain, we can trust that all involved are honest as they will commit their reports to the public ledger. There is no way to determine the identity of any participant, be it Patient or Monitor, strictly from the data or any other on-chain information. 

At the end of the study, all active participants receive a monetary reward in Ether from the "pot" initially set up by the Monitor and fed over the course of the study. Ideally the pot reward should be sufficient to offset any personal expense incurred via self-reporting (as any such interaction with the smart contract has a small associated fee).

## Setup 
### Prerequisites
- Brave browser or Chrome with MetaMask plugin
- Ganache (https://www.trufflesuite.com/ganache)
- Node and npm (https://nodejs.org/en/)
- Truffle suite installed globally (`npm install truffle --global`)

### Clone the repository
`mkdir double-blind-study-app`
`cd double-blind-study-app`
`git clone https://github.com/erkovacs/erko-eth-project.git .`

### Install dependecies
`npm install`

### Setup dev environment
 - Open Ganache
 - Create a new workspace by navigating to and selecting the `truffle-config.js` file
 - Open Brave or Chrome and access MetaMask
 - Add the local Ganache instance as a custom network
 - Open a terminal in the project root directory and issue the command `truffle migrate`
 - Verify in Ganache if the contracts are deployed (they should show up under the "Contracts" tab)
 - Import an account from Ganache (it gives you a lot of accounts with a lot of cash in them) into MetaMask. __DO NOT__ attempt to use these funds on a real network.
 - In the terminal in the project root directory, issue the command `npm run start`. This should open a React development server on localhost:3000
 - Access http://localhost:3000 from the browser with MetaMask Setup. If everything is set up correctly MetaMask should prompt you to connect to the site. Do so with the imported account!

## Usage
