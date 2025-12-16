import React, { useState, useRef } from 'react';
import { User, Expense } from '../types';
import { db } from '../services/mockDb';
import { analyzeReceipt } from '../services/geminiService';
import { Upload, Scan, Loader2, Calendar, DollarSign, Tag, FileText, Check } from 'lucide-react';

interface ExpenseFormProps {
  user: User;
  onSuccess: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      
      // Trigger AI
      // Note: This requires process.env.API_KEY to be set in your build environment
      if (process.env.API_KEY) {
        setAnalyzing(true);
        try {
          const data = await analyzeReceipt(base64);
          if (data) {
            if (data.amount) setAmount(data.amount.toString());
            if (data.currency) setCurrency(data.currency);
            if (data.date) setDate(data.date);
            if (data.category) setCategory(data.category);
            if (data.merchant) setMerchant(data.merchant);
            if (data.description) setDescription(data.description);
          }
        } catch (error) {
          console.error("AI Analysis Failed. Full error:", error);
          alert("Could not analyze receipt automatically. Check console for details, or fill manually.");
        } finally {
          setAnalyzing(false);
        }
      } else {
        console.warn("API_KEY not found in environment. Skipping AI analysis.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await db.submitExpense({
        amount: parseFloat(amount),
        currency,
        category,
        description,
        date,
        merchant,
        receiptImage: preview || undefined
      }, user);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setMerchant('');
      setPreview(null);
      setSuccessMsg('Expense submitted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
      
      onSuccess();
    } catch (error) {
      alert("Failed to submit expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">New Expense Claim</h2>
        <p className="text-sm text-slate-500">Upload a receipt to auto-fill details</p>
      </div>

      {successMsg && (
        <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg flex items-center shadow-lg animate-in slide-in-from-top-2 z-10">
          <Check size={16} className="mr-2" />
          {successMsg}
        </div>
      )}

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Receipt Upload */}
        <div className="lg:col-span-1 space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative group cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all h-64
              ${preview ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
            `}
          >
            {preview ? (
              <img src={preview} alt="Receipt" className="absolute inset-0 w-full h-full object-contain p-2 rounded-xl" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                  <Scan size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700">Click to upload Receipt</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
            
            {analyzing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                <Loader2 className="animate-spin text-indigo-600 w-8 h-8 mb-2" />
                <p className="text-sm font-semibold text-indigo-900">Analyzing Receipt...</p>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Right Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Lodging">Lodging</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Software">Software</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Merchant</label>
            <input
              type="text"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Starbucks, Uber"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                placeholder="Business lunch with client..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Submit Expense Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};