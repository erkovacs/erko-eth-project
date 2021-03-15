import React from 'react';

import { Web3Provider } from './Web3Context';

import DoubleBlindStudySupportApp from './DoubleBlindStudySupportApp';

const App = props => {
  return (
      <Web3Provider>
        <DoubleBlindStudySupportApp/>
      </Web3Provider>
    );
  }

export default App;