import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api.js';

const StudentVerify = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = input phone/name, 2 = verify OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpCode, setDevOtpCode] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const sanitizedPhone = phone.replace(/\D/g, '');
    if (!sanitizedPhone || sanitizedPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    try {
      const data = await api.sendOtp(sanitizedPhone);
      setDevOtpCode(data.devOtp || '');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const sanitizedPhone = phone.replace(/\D/g, '');
    try {
      const data = await api.verifyOtp(sanitizedPhone, otp, name);
      // Save verified profile
      sessionStorage.setItem('studentProfile', JSON.stringify(data.profile));
      // Ensure landlord token is removed to prevent state clash
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('name');
      
      // Navigate to explore
      navigate('/explore');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16 transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.12),transparent_50%)]" />
      
      <div className="panel relative w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-xl shadow-blue-500/20 mb-3">
            N
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {step === 1 ? 'Student quick access' : 'Enter verification code'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 
              ? 'Enter your phone number to browse and shortlist properties.' 
              : `We've sent a 6-digit OTP code to verify your phone.`}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Your full name
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="field"
              />
            </div>
            
            <div>
              <label htmlFor="phone-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Phone number
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Sending OTP...' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                6-Digit OTP Code
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                required
                className="field text-center text-xl tracking-[0.25em] font-mono"
              />
            </div>

            {devOtpCode && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3.5 text-center text-xs text-blue-300">
                <p className="font-semibold mb-1">Development Bypass OTP:</p>
                <code className="text-sm font-bold tracking-wider">{devOtpCode}</code>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="btn-secondary w-full"
            >
              Back to info
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default StudentVerify;
