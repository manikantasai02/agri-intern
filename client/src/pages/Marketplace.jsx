// client/src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { OrderModal } from '../components/forms/OrderModal';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sprout, 
  ShoppingBag, 
  CheckCircle, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export const Marketplace = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Order modal state
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        q: filters.q !== undefined ? filters.q : searchTerm,
        category: filters.category !== undefined ? filters.category : selectedCategory,
        location: filters.location !== undefined ? filters.location : locationFilter,
        maxPrice: filters.maxPrice !== undefined ? filters.maxPrice : maxPrice,
      };
      const res = await productAPI.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setLocationFilter('');
    setMaxPrice('');
    fetchProducts({ q: '', category: '', location: '', maxPrice: '' });
  };

  const handleOpenOrder = (product) => {
    if (!isAuthenticated) {
      window.location.href = '/auth';
      return;
    }
    setSelectedProductForOrder(product);
    setIsOrderModalOpen(true);
  };

  const handleOrderPlaced = () => {
    fetchProducts(); // Refresh stock counts immediately
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner with Agricultural Nature Vibe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#173e32] via-[#215a49] to-[#2e7d32] text-white p-8 md:p-12 shadow-xl mb-10 border border-[#3b705e]">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-xs">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            Direct Farm Harvest Marketplace
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight leading-tight text-[#faf7ee]">
            Fresh from the Earth, <br />
            <span className="text-[#e2d8bd]">Direct to Your Doorstep.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-emerald-100/90 leading-relaxed">
            Eliminate middlemen, empower organic farming communities, and procure harvest batches with verified batch origins and instant atomic inventory locking.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 bg-[#14352b]/60 px-3 py-1.5 rounded-lg border border-emerald-700/40">
              🌾 Verified Agricultural Producers
            </span>
            <span className="flex items-center gap-1.5 bg-[#14352b]/60 px-3 py-1.5 rounded-lg border border-emerald-700/40">
              ⚡ Real-Time Stock Allocation
            </span>
            <span className="flex items-center gap-1.5 bg-[#14352b]/60 px-3 py-1.5 rounded-lg border border-emerald-700/40">
              🛡️ Safe Escrow Release
            </span>
          </div>
        </div>

        {/* Decorative farm contour art in banner */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:block">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="150" cy="50" r="40" fill="#faf7ee" />
            <path d="M40 180 Q 90 90 180 180 Z" fill="#faf7ee" />
          </svg>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#fcfaf4] p-5 rounded-2xl border border-[#ded5be] shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search crops, grain, pulses (e.g. Basmati, Turmeric, Wheat)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#cfc4ac] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  fetchProducts({ category: e.target.value });
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-[#cfc4ac] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              >
                <option value="">All Crop Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by farm region..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#cfc4ac] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>
          </div>

          {/* Quick Category Buttons & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ede5d3]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#5a6b57] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Popular:
              </span>
              {['Basmati', 'Turmeric', 'Chickpeas', 'Tomatoes'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSearchTerm(item);
                    fetchProducts({ q: item });
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#eee5d3] hover:bg-[#1b4d3e] hover:text-white text-[11px] font-medium text-[#3b4a38] transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg border border-[#cfc4ac] text-xs font-semibold text-[#4e5e4c] hover:bg-[#eee5d3] transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#1b4d3e] hover:bg-[#256653] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Listings Section */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#1b4d3e]">Available Harvest Batches</h2>
          <p className="text-xs text-[#6e7d6c]">Showing {products.length} live farm produce listing(s)</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1b4d3e]">Loading fresh harvest catalogs...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[#fbf9f4] rounded-2xl border border-[#ded5be] p-12 text-center">
          <Sprout className="w-12 h-12 text-[#9bb097] mx-auto mb-3" />
          <h3 className="text-lg font-bold font-serif text-[#1b4d3e]">No Harvest Found Matching Your Search</h3>
          <p className="text-xs text-[#647462] mt-1 max-w-md mx-auto">
            Try adjusting your search criteria or clearing filters to explore all available crops across regions.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-[#1b4d3e] text-white rounded-lg text-xs font-semibold"
          >
            Show All Listings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const availQty = product.inventory?.available_qty ?? product.quantity;
            const isOutOfStock = availQty <= 0;

            return (
              <div
                key={product.id}
                className="group bg-[#fefdfa] rounded-2xl border border-[#ded5be] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.commodity_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 backdrop-blur-xs text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        {product.category_name || 'Agri Produce'}
                      </span>
                      {product.grade && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-900/80 backdrop-blur-xs text-amber-200 text-[10px] font-semibold">
                          {product.grade}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs ${
                        isOutOfStock 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white/95 text-[#1b4d3e] backdrop-blur-xs'
                      }`}>
                        {isOutOfStock ? 'Sold Out' : `${availQty} ${product.unit} left`}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-bold font-serif text-[#1b4d3e] text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {product.commodity_name}
                      </h3>
                      {product.variety && (
                        <p className="text-xs text-[#526350] font-medium">Cultivar: {product.variety}</p>
                      )}
                    </div>

                    <p className="text-xs text-[#6e7d6c] line-clamp-2 leading-relaxed">
                      {product.description || 'Natural farm produce grown with organic nutrients and tested for supreme quality.'}
                    </p>

                    {/* Location & Farm info */}
                    <div className="pt-2 border-t border-[#eee5d3] space-y-1 text-[11px] text-[#556653]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{product.pickup_location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7c8b79] truncate">
                          Farm: <strong className="text-[#3b4b39]">{product.farm_name || product.seller?.name || 'Local Agro Collective'}</strong>
                        </span>
                        {product.seller?.verification_status === 'verified' && (
                          <span className="text-emerald-700 flex items-center gap-0.5 font-semibold text-[10px]">
                            <CheckCircle className="w-3 h-3 fill-emerald-100" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Procure Button */}
                <div className="p-4 pt-2 bg-[#faf7ee] border-t border-[#eee5d3] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold leading-none">Rate</span>
                    <span className="text-lg font-bold text-[#1b4d3e]">
                      ₹{product.price.toLocaleString()}
                      <span className="text-xs font-normal text-gray-600"> /{product.unit}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenOrder(product)}
                    disabled={isOutOfStock}
                    className="px-3.5 py-2 rounded-xl bg-[#1b4d3e] hover:bg-[#2e7d32] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Reserved' : 'Order Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Placement Modal */}
      <OrderModal
        product={selectedProductForOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
};
