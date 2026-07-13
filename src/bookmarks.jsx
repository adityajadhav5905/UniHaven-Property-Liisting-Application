import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './card.jsx';
import api from './api.js';
import { PropertyListing } from './models.js';

const Bookmarks = () => {
  // State for storing the fetched properties
  const [listings, setListings] = useState([]);
  // Loading and error states for UX feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  // Fetch authentication credentials from local storage
  const token = sessionStorage.getItem('token');
  const studentProfile = JSON.parse(sessionStorage.getItem('studentProfile') || 'null');

  // Effect to load bookmarks either by Landlord token or Student phone profile
  useEffect(() => {
    async function load() {
      // Abort fetching if no auth credentials exist
      if (!token && !studentProfile?.phone) {
        setError('Please verify student phone or login to view shortlist.');
        setLoading(false);
        return;
      }
      try {
        const data = token
          ? await api.getBookmarks()
          : await api.getStudentProfile(studentProfile.phone);
        
        const rawList = token ? data : data.bookmarks;
        const models = (rawList || []).map(x => new PropertyListing(x));
        setListings(models);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    }
    load();
  }, [token]);

  // Handler to toggle (remove) bookmark from the list
  const handleToggleBookmark = async (listingId) => {
    try {
      if (token) {
        await api.deleteBookmark(listingId);
      } else {
        await api.deleteStudentBookmark(studentProfile.phone, listingId);
      }
      // Once successfully deleted on the server, filter it out from the local UI state
      setListings((prev) => prev.filter((x) => (x._id || x.id) !== listingId));
    } catch {}
  };

  if (loading) return <section className="mx-auto max-w-6xl px-4 py-16 text-slate-300">Loading shortlist...</section>;
  if (error) return <section className="mx-auto max-w-6xl px-4 py-16 text-rose-400">{error}</section>;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Your shortlist</h1>
          <p className="mt-1 text-sm text-slate-400">Quickly compare your saved options and contact landlords.</p>
        </div>
      </div>
      
      {/* Fallback to display empty state if no bookmarks are found */}
      {listings.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center p-12 text-center">
          <p className="text-lg font-medium text-slate-300">No saved listings yet.</p>
          <p className="mt-2 text-sm text-slate-400">Start exploring and save your favorites to compare later.</p>
          <button onClick={() => navigate('/explore')} className="btn-primary mt-6">Explore listings</button>
        </div>
      ) : (
        /* Render grid layout containing all saved property cards */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((property, index) => (
            <Card
              key={property._id || property.id || index}
              {...property}
              isBookmarked={true} // In this view, all items are inherently bookmarked
              onToggleBookmark={handleToggleBookmark}
              onOpenDetails={(id) => navigate(`/listing/${id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Bookmarks;
