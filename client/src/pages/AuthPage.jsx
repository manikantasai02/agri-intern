// client/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Wheat
} from 'lucide-react';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [role, setRole] = useState('farmer');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    farm_name: '',
    location_text: '',
    producer_type: 'Individual Farmer'
  });

  const [error, setError] = useState(null);
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (presetEmail, presetPass) => {
    setFormData(prev => ({ ...prev, email: presetEmail, password: presetPass }));
    setIsRegister(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      const res = await register({
        ...formData,
        role
      });
      if (res.success) {
        if (role === 'farmer') navigate('/farmer-dashboard');
        else if (role === 'admin') navigate('/admin');
        else navigate('/marketplace');
      } else {
        setError(res.error);
      }
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        if (res.user.role === 'farmer') navigate('/farmer-dashboard');
        else if (res.user.role === 'admin') navigate('/admin');
        else navigate('/marketplace');
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b4d3e] to-[#2e7d32] text-emerald-200 shadow-lg mb-3">
            <Wheat className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-[#1b4d3e]">
            {isRegister ? 'Join AgriConnect Platform' : 'Welcome Back, Agro Partner'}
          </h2>
          <p className="mt-1 text-xs text-[#5f6e5c]">
            {isRegister
              ? 'Connect directly to harvest markets, verified buyers and distributors'
              : 'Sign in to manage your harvest listings, orders and deliveries'}
          </p>
        </div>

        {/* Quick Demo Login Preset Pills */}
        <div className="bg-[#ede5d3] p-3.5 rounded-xl border border-[#ded5bd] text-xs">
          <span className="font-bold text-[#1b4d3e] block mb-1.5 flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Demo Quick-Switch Profiles:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('ramesh.farmer@agriconnect.org', 'password123')}
              className="px-2 py-1.5 bg-[#faf7ee] hover:bg-emerald-50 text-left rounded-lg border border-[#cfc4ac] text-[11px] text-[#2c3b2a] transition-colors"
            >
              🧑‍🌾 <strong>Farmer:</strong> Ramesh
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('buyer@greenharvest.com', 'password123')}
              className="px-2 py-1.5 bg-[#faf7ee] hover:bg-emerald-50 text-left rounded-lg border border-[#cfc4ac] text-[11px] text-[#2c3b2a] transition-colors"
            >
              🏢 <strong>Buyer:</strong> Green Harvest
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('logistics@kisanagro.com', 'password123')}
              className="px-2 py-1.5 bg-[#faf7ee] hover:bg-emerald-50 text-left rounded-lg border border-[#cfc4ac] text-[11px] text-[#2c3b2a] transition-colors"
            >
              🚛 <strong>Distributor:</strong> Kisan Agro
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@agriconnect.org', 'password123')}
              className="px-2 py-1.5 bg-[#faf7ee] hover:bg-emerald-50 text-left rounded-lg border border-[#cfc4ac] text-[11px] text-[#2c3b2a] transition-colors"
            >
              🛡️ <strong>Admin:</strong> Desk
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#fefdfa] py-8 px-6 shadow-xl rounded-2xl border border-[#ded5be]">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                {/* Role Selector Grid */}
                <div>
                  <label className="block text-xs font-semibold text-[#324330] mb-2">
                    Select Your Role in AgriConnect *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'farmer'
                          ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] shadow-sm'
                          : 'bg-[#faf7ee] text-[#4d5e4b] border-[#ded5bd] hover:bg-[#eee6d4]'
                      }`}
                    >
                      <Sprout className="w-4 h-4 mx-auto mb-1" />
                      <span className="block text-xs font-semibold">Farmer</span>
                      <span className="text-[10px] opacity-80">Sell Crop</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'buyer'
                          ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] shadow-sm'
                          : 'bg-[#faf7ee] text-[#4d5e4b] border-[#ded5bd] hover:bg-[#eee6d4]'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 mx-auto mb-1" />
                      <span className="block text-xs font-semibold">Buyer</span>
                      <span className="text-[10px] opacity-80">Procure</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('distributor')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'distributor'
                          ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] shadow-sm'
                          : 'bg-[#faf7ee] text-[#4d5e4b] border-[#ded5bd] hover:bg-[#eee6d4]'
                      }`}
                    >
                      <Truck className="w-4 h-4 mx-auto mb-1" />
                      <span className="block text-xs font-semibold">Distributor</span>
                      <span className="text-[10px] opacity-80">Logistics</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#324330] mb-1">Full Name / Entity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#324330] mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                  />
                </div>

                {role === 'farmer' && (
                  <div className="grid grid-cols-1 gap-3 p-3 bg-[#f5ede0] rounded-xl border border-[#ded5be]">
                    <div>
                      <label className="block text-xs font-semibold text-[#324330] mb-1">Farm / Orchard Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Golden Valley Organic Farm"
                        value={formData.farm_name}
                        onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#324330] mb-1">Location & District</label>
                      <input
                        type="text"
                        placeholder="e.g. Nashik Valley, Maharashtra"
                        value={formData.location_text}
                        onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#324330] mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#324330] mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1b4d3e] to-[#2e7d32] hover:from-[#153e32] hover:to-[#226327] text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </form>

          {/* Toggle between register and login */}
          <div className="mt-5 text-center text-xs text-[#5c6e5a]">
            {isRegister ? (
              <p>
                Already have an AgriConnect account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-[#1b4d3e] hover:underline"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                New to the platform?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-[#1b4d3e] hover:underline"
                >
                  Register as Farmer or Buyer
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
