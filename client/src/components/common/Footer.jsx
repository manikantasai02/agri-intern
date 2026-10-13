// client/src/components/common/Footer.jsx
import React from 'react';
import { Sprout, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#16382e] text-[#e3ded0] pt-12 pb-8 border-t border-[#294c40] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif text-[#faf7ee]">AgriConnect</span>
            </div>
            <p className="text-xs text-[#a3b19f] leading-relaxed">
              Transparent digital farm-to-buyer ecosystem empowering farmers with fair pricing, verified buyers, and atomic transaction security.
            </p>
          </div>

          {/* Pillars */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4cbb8] mb-3">Our Core Pillars</h4>
            <ul className="space-y-2 text-xs text-[#a3b19f]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified FPO & Farmer Profiles
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Integrated Agro Logistics
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Atomic Zero-Overbooking Inventory
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4cbb8] mb-3">Quick Navigation</h4>
            <ul className="space-y-1.5 text-xs text-[#a3b19f]">
              <li><a href="/marketplace" className="hover:text-emerald-300">Live Crop Listings</a></li>
              <li><a href="/auth" className="hover:text-emerald-300">Farmer Registration</a></li>
              <li><a href="/orders" className="hover:text-emerald-300">Track Consignment</a></li>
              <li><a href="/admin" className="hover:text-emerald-300">Admin Governance</a></li>
            </ul>
          </div>

          {/* Environmental Mission */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4cbb8] mb-3">Bonding with Nature</h4>
            <p className="text-xs text-[#a3b19f] leading-relaxed">
              Every harvest listed directly preserves soil health, supports regenerative farming practices, and cuts down carbon footprints from intermediary transit.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-[#1f4a3c] border border-emerald-800/60 text-[11px] text-emerald-200">
              🌱 Over 12,000+ metric quintals traded directly by regional growers.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#23493b] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8e9d8b]">
          <p>© 2026 AgriConnect Agribusiness Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted for sustainable agriculture <Heart className="w-3.5 h-3.5 text-red-400 fill-current" /> by Yuva Internship Program
          </p>
        </div>
      </div>
    </footer>
  );
};
