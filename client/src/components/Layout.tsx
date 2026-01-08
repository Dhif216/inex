import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Truck, Shield } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const isDriverPage = location.pathname.includes('/driver');
  const isAdminPage = location.pathname.includes('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/logo.webp" 
              alt="Pickup Management System" 
              className="h-12 w-auto object-contain"
            />
            
            {/* Navigation Toggle */}
            <div className="flex gap-2">
              <Link
                to="/driver"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isDriverPage
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span className="hidden sm:inline">Driver</span>
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isAdminPage
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
