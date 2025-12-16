import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { CountryApiData, User } from '../types';
import { Loader2, Globe, Building2, User as UserIcon, Lock, Mail } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const FALLBACK_COUNTRIES = [
  { name: { common: "United States" }, cca2: "US", currencies: { USD: { name: "United States dollar", "symbol": "$" } } },
  { name: { common: "United Kingdom" }, cca2: "GB", currencies: { GBP: { name: "British pound", "symbol": "£" } } },
  { name: { common: "Canada" }, cca2: "CA", currencies: { CAD: { name: "Canadian dollar", "symbol": "$" } } },
  { name: { common: "Australia" }, cca2: "AU", currencies: { AUD: { name: "Australian dollar", "symbol": "$" } } },
  { name: { common: "Germany" }, cca2: "DE", currencies: { EUR: { name: "Euro", "symbol": "€" } } },
  { name: { common: "France" }, cca2: "FR", currencies: { EUR: { name: "Euro", "symbol": "€" } } },
  { name: { common: "Japan" }, cca2: "JP", currencies: { JPY: { name: "Japanese yen", "symbol": "¥" } } },
  { name: { common: "India" }, cca2: "IN", currencies: { INR: { name: "Indian rupee", "symbol": "₹" } } },
  { name: { common: "China" }, cca2: "CN", currencies: { CNY: { name: "Chinese yuan", "symbol": "¥" } } },
  { name: { common: "Brazil" }, cca2: "BR", currencies: { BRL: { name: "Brazilian real", "symbol": "R$" } } },
];

export const Login: React.FC<AuthProps & { onSwitch: () => void }> = ({ onLogin, onSwitch }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await db.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500">Sign in to manage your expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Don't have a company account?{' '}
          <button onClick={onSwitch} className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
            Register Company
          </button>
        </div>
      </div>
    </div>
  );
};

export const Signup: React.FC<AuthProps & { onSwitch: () => void }> = ({ onLogin, onSwitch }) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCountries, setFetchingCountries] = useState(true);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,currencies');
        if (!res.ok) throw new Error('Failed to fetch from API');
        const data = await res.json();
        const sorted = data.sort((a: any, b: any) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      } catch (e) {
        console.warn("Failed to fetch countries from API, using fallback list.", e);
        // Sort fallback list
        const sorted = [...FALLBACK_COUNTRIES].sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      } finally {
        setFetchingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountry(code);
    const countryData = countries.find(c => c.cca2 === code);
    if (countryData && countryData.currencies) {
      const currencyCode = Object.keys(countryData.currencies)[0];
      setCurrency(currencyCode);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const countryName = countries.find(c => c.cca2 === selectedCountry)?.name.common || selectedCountry;
      const user = await db.registerCompany(companyName, countryName, currency, adminName, email, password);
      onLogin(user);
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Company</h1>
          <p className="text-slate-500">Setup your organization and admin account</p>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className={`h-2 w-16 rounded-full transition-colors ${step === 1 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <select 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={fetchingCountries}
                  >
                    <option value="">Select a country...</option>
                    {countries.map(c => (
                      <option key={c.cca2} value={c.cca2}>{c.name.common}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Currency (Auto-detected)</label>
                <input 
                  type="text" 
                  readOnly
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
                  value={currency}
                />
              </div>

              <button 
                type="button" 
                onClick={() => setStep(2)}
                disabled={!companyName || !selectedCountry}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Next: Admin Details
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Admin Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-2/3 flex items-center justify-center py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};