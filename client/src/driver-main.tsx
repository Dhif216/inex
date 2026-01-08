import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DriverDashboard from './pages/DriverDashboard';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen">
          <header className="bg-white shadow-md border-b border-green-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center">
                <img src="/logo.webp" alt="Inex Driver App" className="h-12 w-auto object-contain" />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DriverDashboard />
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
