import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api.js';
import Card from './card.jsx';
import { UserProfile, PropertyListing } from './models.js';

const Profile = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const studentProfile = JSON.parse(sessionStorage.getItem('studentProfile') || 'null');
  
  const userModel = new UserProfile({
    token,
    role,
    name: sessionStorage.getItem('name'),
    studentProfile
  });

  const isStudent = userModel.isStudent;
  const isLandlord = userModel.isLandlord;

  // Student specific states
  const [studentBookmarks, setStudentBookmarks] = useState([]);
  const [studentLoading, setStudentLoading] = useState(isStudent);

  // Landlord specific states
  const [performance, setPerformance] = useState(null);
  const [landlordLoading, setLandlordLoading] = useState(isLandlord);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!token && !studentProfile) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      setError('');
      try {
        if (isStudent) {
          const data = token
            ? await api.getBookmarks()
            : await api.getStudentProfile(studentProfile.phone);
          const bookmarksSource = token ? data : (data.bookmarks || []);
          const models = (bookmarksSource || []).map(x => new PropertyListing(x));
          setStudentBookmarks(models);
          setStudentLoading(false);
        } else if (isLandlord) {
          const data = await api.getSellerPerformance();
          setPerformance(data);
          setLandlordLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to reach server. Please try again.');
        setStudentLoading(false);
        setLandlordLoading(false);
      }
    };

    fetchProfileData();
  }, [token, isStudent, isLandlord, navigate]);

  // Remove bookmark handler for student profile
  const handleRemoveBookmark = async (listingId) => {
    try {
      if (token) {
        await api.deleteBookmark(listingId);
      } else {
        await api.deleteStudentBookmark(studentProfile.phone, listingId);
      }
      setStudentBookmarks((prev) => prev.filter((l) => (l.id !== listingId) && (l._id !== listingId)));
    } catch {
      alert('Failed to remove bookmark.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('studentProfile');
    navigate('/');
  };

  if (studentLoading || landlordLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <p className="text-lg font-semibold">Loading profile data...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Upper Profile Card */}
      <section className="panel flex flex-col md:flex-row items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
            {(userModel.displayName || 'Guest')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              {userModel.displayName}
            </h1>
            <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
              {isStudent 
                ? `Student account • ${studentProfile?.phone || 'Verified Google Student'}` 
                : `Landlord account`}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isLandlord && (
            <Link to="/seller/dashboard" className="btn-secondary !text-xs !px-4">
              Seller Dashboard
            </Link>
          )}
          <button onClick={handleLogout} className="btn-danger !text-xs !px-4">
            Sign Out
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-500 dark:text-red-400 font-semibold">
          {error}
        </div>
      )}

      {/* Main Student Bookmarks section */}
      {isStudent && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Your Shortlist</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keep track of properties you have saved for easy comparison.</p>
          </div>

          {studentBookmarks.length === 0 ? (
            <div className="panel text-center py-12">
              <p className="text-slate-600 dark:text-slate-300 font-bold">No saved properties yet</p>
              <p className="text-sm text-slate-550 dark:text-slate-400 mt-1 mb-6">Explore the student rental grid to find PGs, flats, and rooms.</p>
              <Link to="/explore" className="btn-primary">Browse Properties</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
              {studentBookmarks.map((listing, index) => (
                <Card 
                  key={listing.id || listing._id || index}
                  {...listing}
                  isBookmarked={true}
                  onToggleBookmark={handleRemoveBookmark}
                  onOpenDetails={(id) => navigate(`/listing/${id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Landlord performance section */}
      {isLandlord && performance && (
        <section className="grid gap-6 md:grid-cols-3">
          {/* Stats Summary Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="panel space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Performance Summary</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="panel !p-4 text-center bg-slate-50/50 dark:bg-slate-900/40">
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">{performance.totalListings}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">Active</p>
                </div>
                <div className="panel !p-4 text-center bg-slate-50/50 dark:bg-slate-900/40">
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">{performance.totalImpressions}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">Views</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Performance List */}
          <div className="md:col-span-2">
            <div className="panel space-y-4 h-full">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Property Views Breakdown</h2>
              
              {performance.listings?.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">You haven't added any listings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                      <tr>
                        <th className="py-3 pr-4 font-bold">Property Title</th>
                        <th className="py-3 px-4 text-right font-bold">Impressions</th>
                        <th className="py-3 pl-4 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {performance.listings.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3.5 pr-4 font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-blue-600 dark:text-blue-300">{item.impressions || 0}</td>
                          <td className="py-3.5 pl-4 text-right">
                            <Link 
                              to={`/listing/${item.id}`} 
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Profile;
