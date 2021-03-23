import React from 'react';
import { Web3Provider } from './Web3Context';
import { ToastProvider } from './ToastContext';

import DoubleBlindStudySupportApp from './DoubleBlindStudySupportApp';

const App = props => {
  return (
      <Web3Provider>
      <ToastProvider>
        <DoubleBlindStudySupportApp />
      </ToastProvider>
      </Web3Provider>
    );
  }

export default App;