// client/src/components/forms/OrderModal.jsx
import React, { useState } from 'react';
import { orderAPI } from '../../services/api';
import { ShoppingBag, ShieldCheck, Truck, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderModal = ({ product, isOpen, onClose, onOrderPlaced }) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const availableQty = product.inventory?.available_qty ?? product.quantity;
  const unitPrice = product.price;
  const totalAmount = Math.round(quantity * unitPrice * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity > availableQty) {
      setError(`Cannot order more than available stock (${availableQty} ${product.unit})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await orderAPI.placeOrder({
        product_id: product.id,
        quantity: parseFloat(quantity),
        delivery_address: address,
      });

      if (res.data.success) {
        setSuccess(true);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        if (onOrderPlaced) {
          onOrderPlaced(res.data.data);
        }
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#faf7ee] rounded-2xl border border-[#d9ceb5] shadow-2xl max-w-lg w-full overflow-hidden animate-gentle-wave">
        {/* Header */}
        <div className="bg-[#1b4d3e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold font-serif text-base">Direct Harvest Procurement</h3>
              <p className="text-[11px] text-emerald-200">Atomic inventory reservation & escrow guarantee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold font-serif text-[#1b4d3e]">Order Successfully Placed!</h4>
              <p className="text-xs text-[#526350] max-w-sm mx-auto">
                Stock of <span className="font-bold">{quantity} {product.unit}</span> has been deducted atomically from the farmer's inventory and booked for dispatch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Product Summary */}
              <div className="flex gap-4 p-3 bg-[#ede6d4] rounded-xl border border-[#ded5be]">
                <img
                  src={product.image_url}
                  alt={product.commodity_name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="text-xs">
                  <h4 className="font-bold text-[#1b4d3e] text-sm">{product.commodity_name}</h4>
                  <p className="text-[#647462]">{product.variety || 'Natural Cultivar'}</p>
                  <p className="font-semibold text-[#2e7d32] mt-1">₹{unitPrice} / {product.unit}</p>
                  <p className="text-[11px] text-amber-800">
                    Remaining Stock: <span className="font-bold">{availableQty} {product.unit}</span>
                  </p>
                </div>
              </div>

              {/* Order Inputs */}
              <div>
                <label className="block text-xs font-semibold text-[#324330] mb-1">
                  Procurement Quantity ({product.unit}) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={availableQty}
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                  />
                  <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {product.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#324330] mb-1">
                  Delivery Destination Address *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Grain Mandi Warehouse 4, APMC Market, Pune 411037"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                />
              </div>

              {/* Financial Calculation Box */}
              <div className="p-3 bg-[#e8f1e6] rounded-xl border border-emerald-300 text-xs space-y-1.5">
                <div className="flex justify-between text-[#3f573d]">
                  <span>Subtotal ({quantity} {product.unit} × ₹{unitPrice})</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#3f573d]">
                  <span>AgriConnect Platform Fee</span>
                  <span className="text-emerald-700 font-semibold">₹0 (Waived for Farmer Growth)</span>
                </div>
                <div className="pt-1.5 border-t border-emerald-200 flex justify-between font-bold text-sm text-[#1b4d3e]">
                  <span>Total Escrow Amount</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-[#5b6a59] px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safe Escrow
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> GPS Tracked Fleet
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || availableQty <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1b4d3e] to-[#2e7d32] hover:from-[#153b30] hover:to-[#226326] text-white font-medium text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Reserving Stock Atomically...' : `Confirm Order (₹${totalAmount.toLocaleString()})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
