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
 - Create directory `mkdir double-blind-study-app`
 - Enter directory `cd double-blind-study-app`
 - Clone repo `git clone https://github.com/erkovacs/erko-eth-project.git .`

### Install dependecies
 - `npm install`

### Setup dev environment
 - Open Ganache
 - Create a new workspace by navigating to and selecting the `truffle-config.js` file
 - Open Brave or Chrome and access MetaMask
 - Add the local Ganache instance as a custom network
 - Open a terminal in the project root directory and issue the command `truffle migrate`
 - Verify in Ganache if the contracts are deployed (they should show up under the "Contracts" tab)
 - Import an account from Ganache (it gives you a lot of accounts with a lot of cash in them) into MetaMask. __DO NOT__ attempt to use these funds on a real network.
 - In the terminal in the project root directory, issue the command `npm run start`. This should open a React development server on localhost:3000. This will launch both server and client apps
 - Access http://localhost:3000 from the browser with MetaMask Setup. If everything is set up correctly MetaMask should prompt you to connect to the site. Do so with the imported account!

## Usage
After accessing the application and connecting MetaMask, the patient is prompted to enrol. They must provide a series of basic biological parameters but are not otherwise identifiable by the data they give out. An informed consent form is also filled in and submitted at the same time.

![image](https://user-images.githubusercontent.com/32717298/118352160-966ec480-b568-11eb-808d-9762b21de15f.png)

The patient’s parameters are displayed in the Profile tab.
 
 ![image](https://user-images.githubusercontent.com/32717298/118352170-a1c1f000-b568-11eb-871f-a240a0b913e5.png)
 
Afterwards, the patient can launch an order for a Treatment Kit. They must provide an address for the delivery of the Treatment Kit which will be relayed to the third-party providing the Treatment Kits, but cannot be linked to the patient as the third party will only receive the Mapping ID, which is insufficient information to identify the patient with the address.

![image](https://user-images.githubusercontent.com/32717298/119265767-82723500-bbf0-11eb-8aba-7ddc22f4c711.png)

Orders are displayed under the “My Orders” tab. When the order is in status “confirmed” in the third-party’s system, the patient can report the administration of the Treatment Kit.

![image](https://user-images.githubusercontent.com/32717298/119265728-5e165880-bbf0-11eb-8e83-660b9579e92f.png)

Submitting the report will create a Treatment Administration Report containing the Treatment Kit ID, the dosage, and a timestamp (independent from the block timestamp).

![image](https://user-images.githubusercontent.com/32717298/118352191-b56d5680-b568-11eb-9865-725f83bb1436.png)

A different kind of report is the Status Report. It includes more general information on the patient, including basic biological parameters, general well-being and a short, written report.

![image](https://user-images.githubusercontent.com/32717298/118352199-bbfbce00-b568-11eb-9508-a6f3ded4a464.png)

At the conclusion of the study, the patient can claim their reward in MED Token:

![image](https://user-images.githubusercontent.com/32717298/119265940-66bb5e80-bbf1-11eb-9075-ae9085f32ed9.png)

The owner of the contract has administrative access to the application and cannot be a participant himself, at least not with the same account. They can view a dashboard containing general data about the status of the study, and can activate/deactivate it, as well as take the emergency measures of stopping for safety/stopping for efficiency.

![image](https://user-images.githubusercontent.com/32717298/118352350-ac30b980-b569-11eb-8905-baa89abe61e6.png)

They can also retrieve data after deactivating the study:

![image](https://user-images.githubusercontent.com/32717298/120339612-edf98800-c2fd-11eb-8fe9-c5842ba5e7b1.png)

