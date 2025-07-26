import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ★★★ ここで App コンポーネントを BrowserRouter で囲むばい！ ★★★ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
