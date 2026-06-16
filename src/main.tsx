import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {ThemeProvider} from './lib/ThemeContext';
import {AuthProvider} from './lib/AuthContext';
import {SiteConfigProvider} from './lib/SiteConfigContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SiteConfigProvider>
            <App />
          </SiteConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
