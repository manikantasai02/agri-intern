// client/src/components/forms/ProductForm.jsx
import React, { useState } from 'react';
import { productAPI } from '../../services/api';
import { Sprout, MapPin, IndianRupee, Layers, Calendar, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export const ProductForm = ({ onProductCreated, categories = [] }) => {
  const [formData, setFormData] = useState({
    commodity_name: '',
    variety: '',
    category_id: 'cat-1',
    quantity: '',
    unit: 'quintal',
    price: '',
    grade: 'Grade A Export',
    pickup_location: '',
    harvest_date: new Date().toISOString().split('T')[0],
    description: '',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sampleImages = [
    { label: 'Golden Wheat / Grain', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Organic Basmati Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sun-dried Turmeric', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Pulses / Chana', url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
      };

      const res = await productAPI.createProduct(payload);
      if (res.data.success) {
        setSuccess(true);
        if (onProductCreated) {
          onProductCreated(res.data.data);
        }
        // Reset inputs
        setFormData({
          commodity_name: '',
          variety: '',
          category_id: 'cat-1',
          quantity: '',
          unit: 'quintal',
          price: '',
          grade: 'Grade A Export',
          pickup_location: '',
          harvest_date: new Date().toISOString().split('T')[0],
          description: '',
          image_url: sampleImages[0].url
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list product. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fefdf9] rounded-2xl border border-[#ded5be] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#efe9dc]">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <Sprout className="w-5 h-5 text-[#1b4d3e]" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-serif text-[#1b4d3e]">List New Harvested Crop</h3>
          <p className="text-xs text-[#6e7d6b]">Your produce will be listed live on the national marketplace with instant stock booking.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Listing successfully created and inventory synchronized!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Commodity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sharbati Wheat, Extra Bold Chickpeas"
              value={formData.commodity_name}
              onChange={(e) => setFormData({ ...formData, commodity_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Variety / Cultivar
            </label>
            <input
              type="text"
              placeholder="e.g. C-306, 1121 Organic, Desi"
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
            >
              <option value="cat-1">Grains & Cereals</option>
              <option value="cat-2">Pulses & Legumes</option>
              <option value="cat-3">Fresh Vegetables</option>
              <option value="cat-4">Fruits & Berries</option>
              <option value="cat-5">Spices & Herbs</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Harvest Quantity *
            </label>
            <div className="flex">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="400"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-2/3 px-3 py-2 rounded-l-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-1/3 px-2 py-2 rounded-r-lg border-y border-r border-[#cfc4ac] bg-[#eee7d5] text-xs font-medium focus:outline-none"
              >
                <option value="quintal">quintal</option>
                <option value="kg">kg</option>
                <option value="tonne">tonne</option>
                <option value="crate (25kg)">crate (25kg)</option>
                <option value="bag (50kg)">bag (50kg)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Price per Unit (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="4500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Quality Grade / Certification
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
            >
              <option value="Grade A Export">Grade A Export (Zero pesticide residue)</option>
              <option value="Certified Organic (NPOP)">Certified Organic (NPOP)</option>
              <option value="Standard Premium">Standard Premium Market Grade</option>
              <option value="Grade B Industrial">Grade B Industrial Processing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
              Pickup Farm Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Green Valley Farm Gate, Nashik, MH"
                value={formData.pickup_location}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
            Produce Photo (Select preset or custom URL)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {sampleImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFormData({ ...formData, image_url: img.url })}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  formData.image_url === img.url
                    ? 'bg-[#1b4d3e] text-white border-[#1b4d3e]'
                    : 'bg-[#faf7ee] text-[#4d5e4b] border-[#d7ceb9] hover:bg-[#ece4cf]'
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-xs text-gray-600 focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3b4b39] mb-1">
            Description & Farming Notes
          </label>
          <textarea
            rows="2"
            placeholder="Cultivated using rainwater irrigation, enriched with natural compost, moisture level certified under 12%..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#cfc4ac] bg-[#faf7ee] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1b4d3e] to-[#2e7d32] hover:from-[#163e32] hover:to-[#256629] text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sprout className="w-4 h-4 text-emerald-200" />
          {loading ? 'Publishing Crop Listing...' : 'Publish Crop to AgriConnect'}
        </button>
      </form>
    </div>
  );
};
