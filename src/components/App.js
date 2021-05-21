import React from 'react';
import { Web3Provider } from './Web3Context';
import { ToastProvider } from './ToastContext';
import { OrderProvider} from './OrderContext';
import { ProfileProvider } from './ProfileContext';

import DoubleBlindStudySupportApp from './DoubleBlindStudySupportApp';

const App = props => {
  return (

      <ToastProvider>
      <Web3Provider>
      <ProfileProvider>
      <OrderProvider>
        <DoubleBlindStudySupportApp />
      </OrderProvider>
      </ProfileProvider>
      </Web3Provider>
      </ToastProvider>
    );
  }

export default App;