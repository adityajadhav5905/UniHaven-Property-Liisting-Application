import React from 'react';
import { Link } from 'react-router-dom';

const Mainimg = () => {
  return (
    <section className="hero-section">
      <div className="hero-bg" />
      <div className="relative mx-auto grid min-h-[520px] w-full max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div>
          <p className="inline-flex rounded-full border border-blue-400/20 dark:border-blue-400/30 bg-blue-500/5 dark:bg-blue-500/10 px-3 py-1 text-xs tracking-wide text-blue-600 dark:text-blue-200">
            STUDENT ACCOMMODATION PLATFORM
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-800 dark:text-slate-100 md:text-5xl tracking-tight">
            Find PGs, flats, and shared homes near your campus.
          </h1>
          <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Compare rent, deposit, occupancy, maintenance, and amenities in one clean flow. Built for students who need decisions fast.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/explore" className="btn-primary">Explore homes</Link>
            <Link to="/student/verify" className="btn-secondary">Student quick access</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-4 shadow-2xl backdrop-blur">
          <img src="/assets/bg3.jpg" alt="Student housing" className="h-[340px] w-full rounded-xl object-cover opacity-95 shadow-inner" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="chip !justify-center">Zero clutter</div>
            <div className="chip !justify-center">Verified listings</div>
            <div className="chip !justify-center">Fast shortlist</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mainimg;
