import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ConfigProvider } from 'antd';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#C62828',
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Button: {
            fontWeight: 900,
            controlHeight: 40,
          },
          Table: {
            headerBg: '#fdfdfd',
            headerColor: '#9ca3af',
            headerBorderRadius: 0,
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
