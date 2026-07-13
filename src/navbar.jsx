import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toggleTheme } from './theme.js';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Forces navbar re-render on route changes (so user login updates nav items instantly)
  
  const role = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');
  const studentProfile = JSON.parse(sessionStorage.getItem('studentProfile') || 'null');
  const isStudent = (!!studentProfile?.phone && !token) || (!!token && role === 'user');
  const isLandlord = !!token && role === 'seller';
  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const logout = () => {
    if (token) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('name');
      navigate('/login');
    } else {
      sessionStorage.removeItem('studentProfile');
      navigate('/student/verify');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/20 transform hover:rotate-6 transition duration-300">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.2c1.7 1.5 5.8 5.2 6.8 6.1v6.7h-2v-6H7.2v6h-2v-6.7c1-1 5.1-4.7 6.8-6.1z"/>
            </svg>
          </span>
          <div>
            <span className="block text-base font-extrabold tracking-tight text-slate-850 dark:text-slate-100 leading-none">UniHaven</span>
            <span className="block text-[9px] uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">student sanctuaries</span>
          </div>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/60 p-1.5 text-sm shadow-inner">
            <li><Link className="nav-link" to="/">Home</Link></li>
            <li><Link className="nav-link" to="/explore">Explore</Link></li>
            {(isStudent || isLandlord) && <li><Link className="nav-link" to="/bookmarks">Shortlist</Link></li>}
            {(isStudent || isLandlord) && <li><Link className="nav-link" to="/profile">Profile</Link></li>}
            {isLandlord && <li><Link className="nav-link" to="/seller/dashboard">Dashboard</Link></li>}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = toggleTheme();
              setTheme(next);
            }}
            className="rounded-xl border border-blue-400/20 dark:border-blue-400/30 bg-blue-500/5 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-200 transition hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
            title="Toggle theme"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          {!token && !studentProfile ? (
            <div className="flex gap-2">
              <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => navigate('/student/verify')}>Student Login</button>
              <button className="btn-primary !px-3 !py-1.5 !text-xs" onClick={() => navigate('/login')}>Landlord Login</button>
            </div>
          ) : (
            <button className="btn-danger !px-3 !py-1.5 !text-xs" onClick={logout}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
