
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './card.jsx';
import { INDIAN_CITIES } from './cities.js';
import api from './api.js';
import { PropertyListing } from './models.js';

const Cards = () => {
  // Map of globally fetched properties
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // High-speed Set for direct O(1) lookups to check if a specific listing is bookmarked
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  
  // Local filtering states hooked directly to the UI search panel
  const [query, setQuery] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [occupancy, setOccupancy] = useState('all');
  
  // Dedicated City Filter hook and Autocomplete UI state
  const [cityFilter, setCityFilter] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const studentProfile = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('studentProfile') || 'null') : null;

  // Core initialization: Fetch all global listings from the backend REST API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await api.getListings();
        const models = (data || []).map(x => new PropertyListing(x));
        setListings(models);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token && !studentProfile?.phone) return;
      try {
        const data = token
          ? await api.getBookmarks()
          : await api.getStudentProfile(studentProfile.phone);
        
        const source = token ? data : data.bookmarks;
        const ids = new Set((Array.isArray(source) ? source : []).map(x => x._id || x.id));
        setBookmarkedIds(ids);
      } catch {}
    };
    fetchBookmarks();
  }, [token, studentProfile?.phone]);

  const handleToggleBookmark = async (listingId, isBookmarked) => {
    if (!token && !studentProfile?.phone) {
      alert('Please verify student phone or login.');
      return;
    }
    try {
      if (isBookmarked) {
        if (token) {
          await api.deleteBookmark(listingId);
        } else {
          await api.deleteStudentBookmark(studentProfile.phone, listingId);
        }
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        if (token) {
          await api.addBookmark(listingId);
        } else {
          await api.addStudentBookmark(studentProfile.phone, listingId);
        }
        setBookmarkedIds(prev => new Set(prev).add(listingId));
      }
    } catch {}
  };

  // Memoized derived state: Filter the raw listings array based on the 3 active filter criteria
  const filtered = listings.filter((l) => {
    const m = l.metadata || {};
    // Aggregate searchable text block
    const text = `${l.title} ${l.location} ${l.description}`.toLowerCase();
    const q = query.trim().toLowerCase();
    
    // Parse rent into raw numeric format preventing string comparison issues
    const rentNumber = Number(String(l.price || '').replace(/[^\d]/g, '')) || 0;
    
    // Condition 1: Query Match
    const fitsQuery = !q || text.includes(q);
    // Condition 2: Rent Limit
    const fitsRent = !maxRent || rentNumber <= Number(maxRent);
    // Condition 3: Occupancy Match
    const fitsOcc = occupancy === 'all' || (m.occupancyType || '').toLowerCase() === occupancy;
    
    // Condition 4: Exact or Substring City match built explicitly for Autocomplete mapping
    const fitsCity = !cityFilter || (l.location || '').toLowerCase().includes(cityFilter.toLowerCase());
    
    // Condition 5: Active Tag match
    const fitsTag = !activeTag || (l.metadata?.amenities || []).some(a => a.toLowerCase() === activeTag.toLowerCase());
    
    return fitsQuery && fitsRent && fitsOcc && fitsCity && fitsTag;
  });

  return (
    <section id="listings" className="mx-auto max-w-7xl px-4 py-10">
      <div className="panel relative z-[60] mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <input
          className="field"
          placeholder="Search by area, college..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        {/* Autocomplete City Filter System */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="City (e.g. Pune)..."
            className="field w-full"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
          />
          {showCityDropdown && cityFilter && (
            <ul className="absolute z-[100] mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl">
              {INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(cityFilter.toLowerCase())).map(c => (
                <li
                  key={c}
                  className="cursor-pointer px-4 py-2 text-sm text-slate-750 dark:text-slate-200 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800"
                  onClick={() => {
                    setCityFilter(c);
                    setShowCityDropdown(false);
                  }}
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          className="field"
          placeholder="Max Rent (e.g. 15000)"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
        />
        <select className="field" value={occupancy} onChange={(e) => setOccupancy(e.target.value)}>
          <option value="all">All occupancy</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      {/* Predefined Tags bar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2">Filter by tags:</span>
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1.5 text-xs font-extrabold rounded-2xl border transition duration-200 cursor-pointer ${
            !activeTag
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-750 dark:text-slate-355 hover:border-slate-400 dark:hover:border-slate-700'
          }`}
        >
          All
        </button>
        {["Wi-Fi", "AC", "Gym", "Food Provided", "Elevator", "Power Backup", "Parking", "Washing Machine", "Kitchen Access", "CCTV", "Water Purifier"].map(t => {
          const isSelected = activeTag === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTag(isSelected ? null : t)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-2xl border transition duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-750 dark:text-slate-355 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-center text-slate-500 dark:text-slate-400 font-semibold">Loading listings...</p>
      ) : filtered.length === 0 ? (
        <div className="panel text-center">
          <p className="text-slate-800 dark:text-slate-200 font-bold">No listings match this filter.</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing rent limit or occupancy type.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property, index) => (
            <Card
              key={property._id || property.id || index}
              {...property}
              isBookmarked={bookmarkedIds.has(property._id || property.id)}
              onToggleBookmark={handleToggleBookmark}
              onOpenDetails={(id) => navigate(`/listing/${id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Cards;



