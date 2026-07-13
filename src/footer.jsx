import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/80">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">UniHaven</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">A focused student housing marketplace for PGs, flats, and shared rentals.</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Students</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>Explore listings</li>
            <li>Save shortlist</li>
            <li>Contact landlords</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Landlords</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>Create listing</li>
            <li>Manage dashboard</li>
            <li>Fill complete details</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Trust</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>Transparent pricing</li>
            <li>Structured information</li>
            <li>Better student decisions</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-200 dark:border-white/10 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} UniHaven. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
