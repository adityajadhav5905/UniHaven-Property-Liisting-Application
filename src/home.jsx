import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Hero / Advertising Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Background ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-12 animate-pulse duration-4000" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl translate-y-12 animate-pulse duration-6000" />

        <div className="relative mx-auto max-w-7xl grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-indigo-600 dark:text-indigo-200 uppercase">
              🚀 Welcome to UniHaven
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-800 dark:text-slate-100">
              Your Campus Sanctuary, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600">
                Found Instantly.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-550 dark:text-slate-355 max-w-xl leading-relaxed">
              Ditch the brokerage, skip the endless loops, and lock in the best PGs, flats, and studios near your college. Compare actual rent, utility costs, contract durations, and verified amenities in one click.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to="/explore" 
                className="btn-primary px-6 py-3 text-sm font-extrabold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition duration-200"
              >
                Find Accommodations
              </Link>
              <Link 
                to="/student/verify" 
                className="btn-secondary px-6 py-3 text-sm font-extrabold hover:border-slate-800 dark:hover:border-slate-300 hover:-translate-y-0.5 transition duration-200"
              >
                Student Quick Access
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="float-element rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl">
              <img 
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=60" 
                alt="Student dorm workspace" 
                className="h-[320px] w-full rounded-xl object-cover shadow-inner border border-slate-200 dark:border-white/5" 
              />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold tracking-wider uppercase">
                <span className="chip !justify-center bg-slate-50 dark:bg-slate-950 !py-2">Zero Brokerage</span>
                <span className="chip !justify-center bg-slate-50 dark:bg-slate-950 !py-2">Verified Hostels</span>
                <span className="chip !justify-center bg-slate-50 dark:bg-slate-950 !py-2">Fast Shortlist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Simulated Statistics Panel (with floating counter-look micro-animations) */}
      <section className="border-t border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="panel bg-white dark:bg-slate-950/40 p-6 space-y-1 shadow-md hover:-translate-y-1 transition duration-300 cursor-default">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-600">15,200+</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Students Registered</p>
          </div>
          <div className="panel bg-white dark:bg-slate-950/40 p-6 space-y-1 shadow-md hover:-translate-y-1 transition duration-300 cursor-default">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-600">4,800+</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sanctuaries Near Campuses</p>
          </div>
          <div className="panel bg-white dark:bg-slate-950/40 p-6 space-y-1 shadow-md hover:-translate-y-1 transition duration-300 cursor-default">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-600">620+</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verified Local Landlords</p>
          </div>
          <div className="panel bg-white dark:bg-slate-950/40 p-6 space-y-1 shadow-md hover:-translate-y-1 transition duration-300 cursor-default">
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-600">100%</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Owner Deals</p>
          </div>
        </div>
      </section>

      {/* 3. About Us / Core Purpose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid gap-12 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Sanctuary Matching Made Simple.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
            UniHaven was founded by former university students who experienced the painful, opaque process of finding off-campus rentals. Our platform eliminates middle-men, hidden fees, and sketchy advertisements by enforcing direct connections.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
            We require all property owners to complete standard contact details validation, verify proximity metrics to major colleges (DU, Christ, MIT, Symbiosis), and list transparent rental contracts. This ensures students can make informed housing decisions safely.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✔</span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Strict Security</h4>
                <p className="text-xs text-slate-500">Google logins and student OTP verification.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✔</span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Tag Search</h4>
                <p className="text-xs text-slate-500">Filter instantly by Wi-Fi, AC, and food policies.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900/40 dark:to-slate-950/20 p-8 border-slate-200 dark:border-white/5 space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">How UniHaven Works</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="h-7 w-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">1</span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Quick Authentication</h4>
                <p className="text-xs text-slate-500 mt-0.5">Students log in via rapid OTP check; Landlords verify using Google Sign-In.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="h-7 w-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">2</span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Tag & Price Filter</h4>
                <p className="text-xs text-slate-500 mt-0.5">Compare rent limits, safety parameters, deposit contracts, and amenities tags.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="h-7 w-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">3</span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Direct Owner Link</h4>
                <p className="text-xs text-slate-500 mt-0.5">Send immediate booking enquiries to owners directly from the properties explore grid.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
