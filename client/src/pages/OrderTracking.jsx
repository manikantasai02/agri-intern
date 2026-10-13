// client/src/pages/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrders();
      if (res.data.success) {
        setOrders(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedOrder(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'packed': return 2;
      case 'dispatched': return 3;
      case 'delivered':
      case 'completed': return 4;
      default: return 0;
    }
  };

  const steps = [
    { title: 'Order Booked', desc: 'Atomic stock secured & payment held in escrow' },
    { title: 'Farmer Accepted', desc: 'Producer confirmed harvest quality & packaging' },
    { title: 'Packed & Weighed', desc: 'Batch sealed and prepared for logistics handover' },
    { title: 'In Transit', desc: 'Consignment moving via verified agro transporter' },
    { title: 'Delivered', desc: 'Buyer inspection approved & payment released' },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-[#1b4d3e]">Order Tracking & Logistics Hub</h1>
        <p className="text-xs sm:text-sm text-[#5f705d] mt-1">
          Monitor your agricultural shipments, delivery milestones, and escrow releases in real time.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1b4d3e]">Retrieving orders & consignment telemetry...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#fbf9f4] rounded-2xl border border-[#ded5be] p-12 text-center">
          <Package className="w-12 h-12 text-[#9bb097] mx-auto mb-3" />
          <h3 className="text-lg font-bold font-serif text-[#1b4d3e]">No Orders Recorded Yet</h3>
          <p className="text-xs text-[#647462] mt-1">
            Browse our agricultural marketplace to place orders directly with verified growers.
          </p>
          <a
            href="/marketplace"
            className="inline-block mt-4 px-4 py-2 bg-[#1b4d3e] text-white rounded-lg text-xs font-semibold"
          >
            Go to Marketplace
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Selector List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#687a66]">
              Your Consignments ({orders.length})
            </h3>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {orders.map((ord) => {
                const item = ord.items?.[0];
                const isSelected = selectedOrder?.id === ord.id;

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#f5ede0] border-[#1b4d3e] shadow-sm'
                        : 'bg-[#fefdfa] border-[#ded5be] hover:bg-[#faf7ee]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-[#1b4d3e]">{ord.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#2c3b29] truncate">
                      {item?.product?.commodity_name || 'Agricultural Produce'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#697a67] mt-2">
                      <span>{item?.quantity} {item?.product?.unit || 'Qtl'}</span>
                      <span className="font-bold text-[#2e7d32]">₹{ord.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Order Timeline & Dispatch Telemetry */}
          {selectedOrder && (
            <div className="lg:col-span-2 space-y-6">
              {/* Order Milestone Progress */}
              <div className="bg-[#fefdfa] rounded-2xl border border-[#ded5be] p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eee5d3] gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-500">CONSIGNMENT TRACKING</span>
                    <h3 className="text-xl font-bold font-serif text-[#1b4d3e]">{selectedOrder.id}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#728370] block">Escrow Valuation</span>
                    <span className="text-xl font-bold text-[#2e7d32]">
                      ₹{selectedOrder.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="py-8">
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-[#e0d6be] -z-0" />

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2">
                      {steps.map((st, idx) => {
                        const currentStep = getStepIndex(selectedOrder.status);
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={idx} className="relative z-10 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                                isCompleted
                                  ? 'bg-[#1b4d3e] text-emerald-200 ring-4 ring-emerald-100 shadow-md'
                                  : 'bg-[#ede5d3] text-[#7d8d7b]'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <div>
                              <div className={`text-xs font-bold ${isCurrent ? 'text-[#1b4d3e]' : 'text-[#50604f]'}`}>
                                {st.title}
                              </div>
                              <div className="text-[10px] text-[#7a8b78] hidden sm:block mt-1 leading-tight">
                                {st.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Shipping & Delivery Route Card */}
                <div className="bg-[#f8f5eb] rounded-xl p-4 border border-[#e3d9c3] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#71826f] flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-[#1b4d3e]" /> Origin (Farm Gate)
                    </span>
                    <p className="font-semibold text-[#293a27]">
                      {selectedOrder.delivery?.pickup_address || 'Nashik Agro Hub Unit 2, Maharashtra'}
                    </p>
                    <p className="text-[11px] text-[#71826f] mt-0.5">
                      Seller: {selectedOrder.seller?.name || 'Verified Producer'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#71826f] flex items-center gap-1 mb-1">
                      <Truck className="w-3 h-3 text-emerald-700" /> Destination (Buyer Hub)
                    </span>
                    <p className="font-semibold text-[#293a27]">{selectedOrder.delivery_address}</p>
                    <p className="text-[11px] text-[#71826f] mt-0.5">
                      Transporter: {selectedOrder.delivery?.transporter_name || 'Kisan Express Fleet'}
                    </p>
                  </div>
                </div>

                {/* Audit & Blockchain/Verification badge */}
                <div className="mt-4 pt-3 border-t border-[#eee5d3] flex items-center justify-between text-xs text-[#526350]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    ACID Compliant Zero-Overselling Transaction
                  </span>
                  <span className="font-mono text-[11px] text-[#7f907d]">
                    TXN: {selectedOrder.delivery?.id || 'TXN-90218'}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="bg-[#fefdfa] rounded-2xl border border-[#ded5be] p-5 shadow-xs">
                <h4 className="font-bold font-serif text-[#1b4d3e] text-sm mb-3">Consignment Breakdown</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#faf7ee] rounded-xl border border-[#eee5d3] text-xs">
                      <div className="flex items-center gap-3">
                        {it.product?.image_url && (
                          <img src={it.product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-bold text-[#1b4d3e] text-sm">{it.product?.commodity_name || 'Agri Produce'}</p>
                          <p className="text-[#647462]">{it.product?.variety || 'Natural'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1b4d3e]">{it.quantity} {it.product?.unit || 'Qtl'}</p>
                        <p className="text-emerald-700 font-semibold">₹{it.unit_price} / unit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
