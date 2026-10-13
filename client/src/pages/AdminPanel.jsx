// client/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  TrendingUp, 
  Sprout, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, logRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getAuditLogs(),
        adminAPI.getStats()
      ]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (logRes.data.success) setAuditLogs(logRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, status) => {
    try {
      await adminAPI.verifyUser(userId, status);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#1b4d3e] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Platform Governance & Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#faf7ee]">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Verify farmer certifications, inspect transparent audit logs, and monitor ecosystem health.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Audit Trail
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#fefdfa] p-4 rounded-xl border border-[#ded5be] shadow-xs">
            <span className="text-[11px] uppercase font-bold text-[#687a66]">Total Ecosystem Members</span>
            <div className="text-2xl font-bold font-serif text-[#1b4d3e] mt-1">{stats.totalUsers}</div>
            <span className="text-[10px] text-[#788976]">Farmers: {stats.farmersCount} | Buyers: {stats.buyersCount}</span>
          </div>

          <div className="bg-[#fefdfa] p-4 rounded-xl border border-[#ded5be] shadow-xs">
            <span className="text-[11px] uppercase font-bold text-[#687a66]">Active Crop Batches</span>
            <div className="text-2xl font-bold font-serif text-[#1b4d3e] mt-1">{stats.activeProducts}</div>
            <span className="text-[10px] text-[#788976]">Verified quality standards</span>
          </div>

          <div className="bg-[#fefdfa] p-4 rounded-xl border border-[#ded5be] shadow-xs">
            <span className="text-[11px] uppercase font-bold text-[#687a66]">Completed Transactions</span>
            <div className="text-2xl font-bold font-serif text-[#1b4d3e] mt-1">{stats.totalOrders}</div>
            <span className="text-[10px] text-[#788976]">Zero dispute rate</span>
          </div>

          <div className="bg-[#fefdfa] p-4 rounded-xl border border-[#ded5be] shadow-xs">
            <span className="text-[11px] uppercase font-bold text-[#687a66]">Direct Trade Volume</span>
            <div className="text-2xl font-bold font-serif text-[#2e7d32] mt-1">₹{stats.grossTurnover.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">100% fair-price flow</span>
          </div>
        </div>
      )}

      {/* User Verification Management */}
      <div className="bg-[#fefdfa] rounded-2xl border border-[#ded5be] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#eee5d3] flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif text-[#1b4d3e] text-lg">User Verification & Compliance</h3>
            <p className="text-xs text-[#6e7d6b]">Approve farmer KYC, suspend fraudulent accounts, or audit credentials.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f3e8] text-[#556653] uppercase text-[10px] tracking-wider border-b border-[#eee5d3]">
              <tr>
                <th className="py-3 px-4">Name / Farm</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee5d3]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#fbf9f3] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#1b4d3e]">
                    <div>{u.name}</div>
                    {u.farm_name && <div className="text-[10px] text-[#6d7e6b]">{u.farm_name}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-[#556653]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#556653]">{u.mobile}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      u.verification_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.verification_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    {u.verification_status !== 'verified' && (
                      <button
                        onClick={() => handleVerify(u.id, 'verified')}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors"
                      >
                        Verify
                      </button>
                    )}
                    {u.verification_status !== 'suspended' && u.role !== 'admin' && (
                      <button
                        onClick={() => handleVerify(u.id, 'suspended')}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Logs Table */}
      <div className="bg-[#fefdfa] rounded-2xl border border-[#ded5be] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#eee5d3]">
          <h3 className="font-bold font-serif text-[#1b4d3e] text-lg">System Audit Log Trail</h3>
          <p className="text-xs text-[#6e7d6b]">
            Cryptographically timestamped transaction log of listings, orders, and role changes.
          </p>
        </div>

        <div className="max-h-[350px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f3e8] text-[#556653] uppercase text-[10px] tracking-wider border-b border-[#eee5d3] sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Log ID</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action Event</th>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee5d3]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fbf9f3] transition-colors font-mono text-[11px]">
                  <td className="py-2.5 px-4 text-gray-500">{log.id}</td>
                  <td className="py-2.5 px-4 text-[#556653]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#1b4d3e]">{log.action}</td>
                  <td className="py-2.5 px-4 text-[#556653]">{log.entity_type} ({log.entity_id})</td>
                  <td className="py-2.5 px-4 text-[#758673] truncate max-w-xs">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
