// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NatureBackground } from './components/common/NatureBackground';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Marketplace } from './pages/Marketplace';
import { AuthPage } from './pages/AuthPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { OrderTracking } from './pages/OrderTracking';
import { AdminPanel } from './pages/AdminPanel';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between relative text-[#263238] bg-[#faf7ee]">
      {/* Background Nature effects & organic farmland aesthetics */}
      <NatureBackground />

      {/* Main app flow */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/farmer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/marketplace" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}
