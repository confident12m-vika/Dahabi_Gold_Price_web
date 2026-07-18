import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { LangProvider } from './contexts/LangContext';
import { AuthProvider } from './contexts/AuthContext';
import { MarketProvider } from './contexts/MarketContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DataProvider } from './contexts/DataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <MarketProvider>
            <CurrencyProvider>
              <DataProvider>
                <App />
              </DataProvider>
            </CurrencyProvider>
          </MarketProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
