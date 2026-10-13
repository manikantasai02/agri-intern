// client/src/pages/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, orderAPI } from '../services/api';
import { ProductForm } from '../components/forms/ProductForm';
import { 
  Sprout, 
  Package, 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  PlusCircle,
  ChevronRight,
  RefreshCw,
  Box
} from 'lucide-react';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        productAPI.getProducts({ sellerId: user.id }),
        orderAPI.getOrders()
      ]);
      if (prodRes.data.success) {
        setFarmerProducts(prodRes.data.data);
      }
      if (ordRes.data.success) {
        setOrders(ordRes.data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await orderAPI.updateOrderStatus(orderId, { status: newStatus });
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const totalStockQuantity = farmerProducts.reduce((acc, p) => acc + (p.inventory?.available_qty || p.quantity), 0);
  const totalEarnings = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'rejected')
    .reduce((acc, o) => acc + o.total_amount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-[#1b4d3e] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2">
            <Sprout className="w-4 h-4" /> Farmer Producer Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#faf7ee]">
            {user.farmer_profile?.farm_name || `${user.name}'s Farm`}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Location: {user.farmer_profile?.location_text || 'Nashik Valley Agro Belt'} • Status:{' '}
            <span className="text-emerald-300 font-bold uppercase">{user.verification_status}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#e9b949] hover:bg-[#d4a438] text-[#1b4d3e] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Hide Form' : 'List New Crop'}</span>
          </button>
          <button
            onClick={loadDashboardData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fefdfa] p-5 rounded-2xl border border-[#ded5be] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647462]">Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b4d3e]">{farmerProducts.length} Crops</div>
          <p className="text-[11px] text-[#6b7b69] mt-1">Available in national catalog</p>
        </div>

        <div className="bg-[#fefdfa] p-5 rounded-2xl border border-[#ded5be] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647462]">Available Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b4d3e]">{totalStockQuantity} Qtl</div>
          <p className="text-[11px] text-[#6b7b69] mt-1">Live synchronized stock</p>
        </div>

        <div className="bg-[#fefdfa] p-5 rounded-2xl border border-[#ded5be] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647462]">Incoming Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b4d3e]">{orders.length}</div>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">{pendingOrdersCount} pending acceptance</p>
        </div>

        <div className="bg-[#fefdfa] p-5 rounded-2xl border border-[#ded5be] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647462]">Procured Value</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b4d3e]">₹{totalEarnings.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Secured via Escrow</p>
        </div>
      </div>

      {/* Conditionally rendered new crop listing form */}
      {showAddForm && (
        <div className="animate-gentle-wave">
          <ProductForm
            onProductCreated={() => {
              loadDashboardData();
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      {/* Orders Management Table */}
      <div className="bg-[#fefdfa] rounded-2xl border border-[#ded5be] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#eee5d3] flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif text-[#1b4d3e] text-lg">Incoming Procurement Orders</h3>
            <p className="text-xs text-[#6e7d6b]">Approve, pack, or dispatch batches booked by buyers.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            {orders.length} Active Records
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6e7d6b]">
            No incoming procurement orders recorded yet. As soon as buyers place orders from the marketplace, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f3e8] text-[#556653] uppercase text-[10px] tracking-wider border-b border-[#eee5d3]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Crop / Batch</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total Escrow</th>
                  <th className="py-3 px-4">Buyer Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee5d3]">
                {orders.map((ord) => {
                  const item = ord.items?.[0];
                  return (
                    <tr key={ord.id} className="hover:bg-[#fbf9f3] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1b4d3e]">{ord.id}</td>
                      <td className="py-3.5 px-4 font-medium text-[#2d3b2b]">
                        {item?.product?.commodity_name || 'Agri Batch'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1b4d3e]">
                        {item?.quantity} {item?.product?.unit || 'Qtl'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#2e7d32]">
                        ₹{ord.total_amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-[#556653]">
                        <div>{ord.buyer?.name || 'Verified Buyer'}</div>
                        <div className="text-[10px] text-[#7d8c7b]">{ord.buyer?.mobile}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          ord.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {ord.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'accepted')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {ord.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'dispatched')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-[#1b4d3e] hover:bg-[#2e7d32] text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Dispatch Harvest
                          </button>
                        )}
                        {ord.status === 'dispatched' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Listed Stock Table */}
      <div className="bg-[#fefdfa] rounded-2xl border border-[#ded5be] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#eee5d3] flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif text-[#1b4d3e] text-lg">My Listed Crop Stock</h3>
            <p className="text-xs text-[#6e7d6b]">Live catalog inventory with atomic reserve counts.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-xs text-[#1b4d3e] font-bold hover:underline"
          >
            + Add Another Produce
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f3e8] text-[#556653] uppercase text-[10px] tracking-wider border-b border-[#eee5d3]">
              <tr>
                <th className="py-3 px-4">Produce</th>
                <th className="py-3 px-4">Variety</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Reserved Stock</th>
                <th className="py-3 px-4">Price / Unit</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee5d3]">
              {farmerProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#fbf9f3] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1b4d3e] flex items-center gap-2">
                    <img src={prod.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                    <span>{prod.commodity_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#556653]">{prod.variety || 'Standard'}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">
                    {prod.inventory?.available_qty ?? prod.quantity} {prod.unit}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-700">
                    {prod.inventory?.reserved_qty ?? 0} {prod.unit}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#2e7d32]">
                    ₹{prod.price} /{prod.unit}
                  </td>
                  <td className="py-3.5 px-4 text-[#667764] truncate max-w-xs">{prod.pickup_location}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {prod.status}
                    </span>
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
