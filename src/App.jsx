import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import NavBar from './navbar.jsx';
import Cards from './cards.jsx';
import Footer from './footer.jsx';
import Enquirypop from './enquirypop.jsx';
import Bookmarks from './bookmarks.jsx';
import StudentVerify from './studentverify.jsx';
import ListingDetail from './listingdetail.jsx';
import Profile from './profile.jsx';
import Home from './home.jsx';
import api from './api.js';
import { PropertyListing } from './models.js';

// Predefined Tags for Property Listings
const PREDEFINED_TAGS = ["Wi-Fi", "AC", "Gym", "Food Provided", "Elevator", "Power Backup", "Parking", "Washing Machine", "Kitchen Access", "CCTV", "Water Purifier"];

// Simple About Us page (UniHaven Branded)
function AboutUs() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 p-8">
      <div className="panel max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">About UniHaven</h1>
        <p className="text-slate-600 dark:text-slate-355 text-base leading-relaxed">
          UniHaven is a dedicated student sanctuaries finder. We connect university students with certified landlords offering verified PG accommodations, shared flats, and student studios near campuses.
        </p>
      </div>
    </div>
  );
}

// Simple Contact Us page (UniHaven Branded)
function ContactUs() {
  const [sent, setSent] = useState(false);
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 p-4">
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight text-slate-800 dark:text-slate-100">Contact Us</h1>
      <form onSubmit={handleContactSubmit} className="panel w-full max-w-md space-y-4 shadow-xl">
        <input type="text" placeholder="Your Name" className="field" required />
        <input type="email" placeholder="Your Email" className="field" required />
        <textarea placeholder="Your Message" className="field min-h-24" required />
        <button type="submit" className="btn-primary w-full">{sent ? 'Message Sent!' : 'Send Message'}</button>
      </form>
    </div>
  );
}

// Mock Google Account Selector Overlay
function GoogleAuthModal({ onClose, onSuccess }) {
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mockProfiles = [
    { name: 'Aarav Sharma (Student)', email: 'aarav.sharma@gmail.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=60' },
    { name: 'Ananya Iyer (Student)', email: 'ananya.iyer@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
    { name: 'Karan Malhotra (Student)', email: 'karan.m@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60' },
    { name: 'Rajesh Kumar (Landlord)', email: 'rajesh.landlord@gmail.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60' }
  ];

  const handleSelectAccount = async (name, email) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.googleLogin(email, name);
      onSuccess(data);
    } catch (err) {
      setError(err.message || 'Google Auth failed');
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;
    handleSelectAccount(customName.trim(), customEmail.trim());
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-1">
          <svg className="h-10 w-10 mx-auto" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.62v3.02h3.87c2.26-2.08 3.58-5.14 3.58-8.49z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.84 7.39 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.27c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.57.38-2.3V6.54H1.29C.47 8.17 0 9.97 0 12s.47 3.83 1.29 5.46l3.98-3.19z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.26 2.16 1.29 5.46l3.98 3.19c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Sign in with Google</h2>
          <p className="text-xs text-slate-550">to continue to UniHaven</p>
        </div>

        {error && <p className="text-red-500 text-xs text-center font-semibold">{error}</p>}

        {loading ? (
          <div className="text-center py-6 text-sm text-slate-550 dark:text-slate-400 font-semibold">
            Connecting secure Google Session...
          </div>
        ) : !useCustom ? (
          <div className="space-y-2">
            {mockProfiles.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAccount(p.name, p.email)}
                className="flex items-center gap-3 w-full p-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition duration-200 cursor-pointer"
              >
                <img src={p.avatar} alt={p.name} className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">{p.name}</p>
                  <p className="text-xs text-slate-550 mt-0.5">{p.email}</p>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className="w-full text-center py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-2 cursor-pointer"
            >
              Use another simulated account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Full name"
              required
              className="field"
            />
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Google email account"
              required
              className="field"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 py-2">Continue</button>
              <button type="button" onClick={() => setUseCustom(false)} className="btn-secondary flex-1 py-2">Back</button>
            </div>
          </form>
        )}

        <button
          onClick={onClose}
          type="button"
          disabled={loading}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.login(email, password);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);
      sessionStorage.setItem('name', data.name);
      if (data.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = (data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('name', data.name);
    setShowGoogleModal(false);
    if (data.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 px-4">
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">Login</h1>
      <form onSubmit={handleLogin} className="panel w-full max-w-md space-y-4 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-600">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="field" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="field" />
        <button type="submit" className="btn-primary w-full">Login</button>
        
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase font-semibold">Or connect via</span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
        </div>

        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full btn-secondary flex items-center justify-center gap-2.5 py-2.5 font-bold shadow-md hover:border-slate-800 dark:hover:border-slate-400 cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.62v3.02h3.87c2.26-2.08 3.58-5.14 3.58-8.49z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.84 7.39 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.27c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.57.38-2.3V6.54H1.29C.47 8.17 0 9.97 0 12s.47 3.83 1.29 5.46l3.98-3.19z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.26 2.16 1.29 5.46l3.98 3.19c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          Sign in with Google
        </button>

        {error && <p className="text-red-500 dark:text-red-400 text-center text-sm font-medium">{error}</p>}
        <p className="text-sm text-slate-555 dark:text-slate-400 text-center mt-2">
          Don't have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Register here</Link>
        </p>
      </form>

      {showGoogleModal && (
        <GoogleAuthModal
          onClose={() => setShowGoogleModal(false)}
          onSuccess={handleGoogleSuccess}
        />
      )}
    </div>
  );
}

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.register(name, email, password, role, role === 'seller' ? phone : null);
      setSuccess('Registered successfully! Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = (data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('name', data.name);
    setShowGoogleModal(false);
    if (data.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 px-4">
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight text-slate-800 dark:text-slate-100">Register</h1>
      <form onSubmit={handleRegister} className="panel w-full max-w-md space-y-4 shadow-xl">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="field" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="field" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="field" />
        
        <select value={role} onChange={e => setRole(e.target.value)} className="field">
          <option value="user">Student User</option>
          <option value="seller">Landlord Seller</option>
        </select>

        {role === 'seller' && (
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Landlord Contact Phone" required className="field" />
        )}

        <button type="submit" className="btn-primary w-full">Register</button>
        
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase font-semibold">Or connect via</span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
        </div>

        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full btn-secondary flex items-center justify-center gap-2.5 py-2.5 font-bold shadow-md hover:border-slate-800 dark:hover:border-slate-400 cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.62v3.02h3.87c2.26-2.08 3.58-5.14 3.58-8.49z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.84 7.39 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.27c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.57.38-2.3V6.54H1.29C.47 8.17 0 9.97 0 12s.47 3.83 1.29 5.46l3.98-3.19z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.26 2.16 1.29 5.46l3.98 3.19c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          Sign up with Google
        </button>

        {error && <p className="text-red-500 dark:text-red-400 text-center text-sm font-medium">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-center text-sm font-medium">{success}</p>}
        <p className="text-sm text-slate-555 dark:text-slate-400 text-center mt-2">
          Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login here</Link>
        </p>
      </form>

      {showGoogleModal && (
        <GoogleAuthModal
          onClose={() => setShowGoogleModal(false)}
          onSuccess={handleGoogleSuccess}
        />
      )}
    </div>
  );
}

// Modal component representing direct Listing Addition and Updates on the Dashboard itself
function ListingFormModal({ editId, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    city: '',
    pincode: '',
    propertyType: 'PG',
    occupancyType: 'single',
    deposit: '',
    maintenance: '',
    contractDuration: '',
    electricityIncluded: 'yes',
    amenities: [],
    images: [],
    existingGallery: []
  });

  const [loading, setLoading] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId) return;
    async function fetchDetails() {
      try {
        const data = await api.getListing(editId);
        const model = new PropertyListing(data);
        setFormData({
          title: model.title || '',
          description: model.description || '',
          price: model.price || '',
          location: model.location || '',
          city: model.metadata.city || '',
          pincode: model.metadata.pincode || '',
          propertyType: model.propertyType || 'PG',
          occupancyType: model.occupancyType || 'single',
          deposit: model.deposit || '',
          maintenance: model.maintenance || '',
          contractDuration: model.contractDuration || '',
          electricityIncluded: model.electricityIncluded ? 'yes' : 'no',
          amenities: Array.isArray(model.amenities) ? model.amenities : [],
          images: [],
          existingGallery: model.gallery || []
        });
      } catch (err) {
        setError('Failed to fetch details for editing');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [editId]);

  const handleToggleTag = (tag) => {
    setFormData((prev) => {
      const isSelected = prev.amenities.includes(tag);
      const updated = isSelected
        ? prev.amenities.filter((t) => t !== tag)
        : [...prev.amenities, tag];
      return { ...prev, amenities: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    })).then(base64s => {
      setFormData(prev => ({ ...prev, images: base64s }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const isEdit = !!editId;
    const gallery = formData.images.length > 0 ? formData.images : formData.existingGallery;

    if (!isEdit && gallery.length === 0) {
      setError('Please upload at least one listing image.');
      setSubmitting(false);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      location: formData.location,
      image: gallery[0] || '',
      metadata: {
        city: formData.city,
        pincode: formData.pincode,
        propertyType: formData.propertyType,
        occupancyType: formData.occupancyType,
        deposit: formData.deposit,
        maintenance: formData.maintenance,
        contractDuration: formData.contractDuration,
        electricityIncluded: formData.electricityIncluded === 'yes',
        amenities: formData.amenities,
        gallery,
        coverIndex: 0
      }
    };

    try {
      if (isEdit) {
        await api.updateListing(editId, payload);
      } else {
        await api.createListing(payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="panel w-full max-w-2xl p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {editId ? 'Edit Property Listing' : 'Add Property Listing'}
        </h3>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Contact parameters are automatically loaded from your landlord account settings on submission.
        </p>

        {loading ? (
          <div className="text-center py-8 text-sm text-slate-400">Loading details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Listing Title (e.g. Premium Girls PG)" required className="field" />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description (rules, near college, utilities, timings)" required className="field min-h-24" />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Local Address / Area" required className="field" />
              <input name="price" value={formData.price} onChange={handleChange} placeholder="Monthly Rent (e.g. Rs 12,000)" required className="field" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City (e.g. Pune)" required className="field" />
              <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode (e.g. 411038)" required className="field" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="field">
                <option value="PG">PG</option>
                <option value="Flat">Flat</option>
                <option value="Shared Room">Shared Room</option>
                <option value="Studio">Studio</option>
              </select>
              <select name="occupancyType" value={formData.occupancyType} onChange={handleChange} className="field">
                <option value="single">Single occupancy</option>
                <option value="double">Double occupancy</option>
                <option value="triple">Triple occupancy</option>
                <option value="mixed">Mixed occupancy</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input name="deposit" value={formData.deposit} onChange={handleChange} placeholder="Deposit Amount" className="field" />
              <input name="maintenance" value={formData.maintenance} onChange={handleChange} placeholder="Maintenance/m" className="field" />
              <input name="contractDuration" value={formData.contractDuration} onChange={handleChange} placeholder="Contract Duration" className="field" />
            </div>

            <select name="electricityIncluded" value={formData.electricityIncluded} onChange={handleChange} className="field font-bold">
              <option value="yes">Electricity included</option>
              <option value="no">Electricity excluded</option>
            </select>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Amenities & Tags</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PREDEFINED_TAGS.map((tag) => {
                  const isSelected = formData.amenities.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border text-center transition duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-750 dark:text-slate-355 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Property Images</label>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="field file:mr-4 file:rounded-md file:border-0 file:bg-blue-500/20 file:px-3 file:py-1 file:text-xs file:text-blue-200" />
            </div>

            {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2">{submitting ? 'Submitting...' : 'Save Property'}</button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2">Cancel</button>
            </div>
          </form>
        )}

        <button
          onClick={onClose}
          type="button"
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SellerDashboard() {
  const [listings, setListings] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal configurations
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  const fetchDashboardData = async () => {
    try {
      const listingsData = await api.getSellerListings();
      const listingsModels = (listingsData || []).map(x => new PropertyListing(x));
      setListings(listingsModels);

      const performanceData = await api.getSellerPerformance();
      setPerformance(performanceData);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== 'seller' || !token) {
      setError('You must be logged in as a seller to view this page.');
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [token, role]);

  const handleDelete = async (id) => {
    const reason = prompt('Please enter a reason for deleting this listing:');
    if (reason === null) return;
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      alert('A deletion reason is required.');
      return;
    }
    const note = prompt('Optional deletion notes:');
    try {
      await api.deleteListing(id, trimmedReason, note || '');
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (id) => {
    setEditingId(id);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <p className="text-lg font-semibold">Loading dashboard properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-500 p-4">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  const averageImpressions = performance && performance.totalListings > 0
    ? (performance.totalImpressions / performance.totalListings).toFixed(1)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Analytics / Stats Row */}
      <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <div className="panel bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900/20 dark:to-slate-950/20 flex flex-col justify-between p-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Properties</p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-300 mt-2">{performance?.totalListings || 0}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Properties actively visible to university students</p>
        </div>
        <div className="panel bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900/20 dark:to-slate-950/20 flex flex-col justify-between p-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Property Views</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-300 mt-2">{performance?.totalImpressions || 0}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Cumulative listing impressions across explore grids</p>
        </div>
        <div className="panel bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900/20 dark:to-slate-950/20 flex flex-col justify-between p-6 sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Views per Listing</p>
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-300 mt-2">{averageImpressions}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Average metrics of student interest per listing</p>
        </div>
      </section>

      {/* Properties List Header with Add Property button */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Your Properties</h2>
        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-extrabold shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Listing
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="panel text-center py-16 space-y-4">
          <p className="text-slate-550 dark:text-slate-400">No active listings yet. Add your first student housing accommodation.</p>
          <button onClick={handleOpenAdd} className="btn-primary">Get Started</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="panel flex flex-col justify-between hover:shadow-lg transition duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 line-clamp-1">{listing.title}</h3>
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border border-blue-400/20">
                    Views: {listing.impressions || 0}
                  </span>
                </div>
                {listing.image && (
                  <div className="image-fit-container rounded-xl w-full max-h-44 overflow-hidden relative">
                    <img src={listing.image} alt="" className="image-fit-blur-bg" />
                    <img src={listing.image} alt={listing.title} className="image-fit-content" />
                  </div>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-355 line-clamp-3 leading-relaxed">{listing.description}</p>
                <div className="space-y-1 text-sm border-t border-slate-200 dark:border-white/10 pt-2.5">
                  <p className="font-extrabold text-blue-600 dark:text-blue-300">Price: {listing.price}</p>
                  <p className="text-slate-500 dark:text-slate-400">Location: {listing.location}</p>
                </div>
              </div>
              <div className="flex gap-2.5 mt-5">
                <button onClick={() => handleOpenEdit(listing.id)} className="btn-primary flex-1 !py-2 !text-xs">Edit</button>
                <button onClick={() => handleDelete(listing.id)} className="btn-danger flex-1 !py-2 !text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shared form modal overlay */}
      {showModal && (
        <ListingFormModal
          editId={editingId}
          onClose={() => setShowModal(false)}
          onRefresh={fetchDashboardData}
        />
      )}
    </div>
  );
}

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  const handleEnquireClick = (toemail) => {
    setTargetEmail(toemail);
    setShowPopup(true);
  };

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Footer />
            </>
          }
        />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route
          path="/explore"
          element={
            <>
              <Cards onEnquireClick={handleEnquireClick} />
              {showPopup && (
                <Enquirypop
                  onClose={() => setShowPopup(false)}
                  toemail={targetEmail}
                />
              )}
              <Footer />
            </>
          }
        />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/student/verify" element={<StudentVerify />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
