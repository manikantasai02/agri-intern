// client/src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sprout, 
  Store, 
  LayoutDashboard, 
  Truck, 
  ShieldCheck, 
  LogOut, 
  User, 
  PlusCircle, 
  Package
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#faf7ee]/90 backdrop-blur-md border-b border-[#e5decb] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b4d3e] to-[#2e7d32] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1b4d3e] flex items-center gap-1 font-serif">
                AgriConnect
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-sans font-medium">
                  Direct Farm
                </span>
              </span>
              <p className="text-[11px] text-[#6d7967] leading-none -mt-0.5">Empowering Farmers & Sustainable Food Chains</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/marketplace"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/marketplace') 
                  ? 'bg-[#1b4d3e] text-white shadow-xs' 
                  : 'text-[#374939] hover:bg-[#eae3d2] hover:text-[#1b4d3e]'
              }`}
            >
              <Store className="w-4 h-4" />
              Marketplace
            </Link>

            {isAuthenticated && (
              <>
                {user.role === 'farmer' && (
                  <Link
                    to="/farmer-dashboard"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/farmer-dashboard')
                        ? 'bg-[#1b4d3e] text-white shadow-xs'
                        : 'text-[#374939] hover:bg-[#eae3d2] hover:text-[#1b4d3e]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Farmer Dashboard
                  </Link>
                )}

                <Link
                  to="/orders"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/orders')
                      ? 'bg-[#1b4d3e] text-white shadow-xs'
                      : 'text-[#374939] hover:bg-[#eae3d2] hover:text-[#1b4d3e]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  My Orders & Shipments
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-[#1b4d3e] text-white shadow-xs'
                        : 'text-[#374939] hover:bg-[#eae3d2] hover:text-[#1b4d3e]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action / Auth Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-[#1b4d3e] flex items-center justify-end gap-1">
                    {user.name}
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {user.role}
                    </span>
                  </span>
                  <span className="text-xs text-[#707c6f]">{user.email}</span>
                </div>

                {user.role === 'farmer' && (
                  <Link
                    to="/farmer-dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2e7d32] hover:bg-[#1b4d3e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Post Crop
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-[#4e5b4b] hover:text-red-700 hover:bg-[#f0e8d5] rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-[#1b4d3e] hover:bg-[#ede5d4] rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 text-sm font-medium bg-[#1b4d3e] hover:bg-[#25614f] text-[#faf7ee] rounded-lg shadow-xs transition-colors"
                >
                  Join Network
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
