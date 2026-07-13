import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api.js';
import { PropertyListing } from './models.js';
import Enquirypop from './enquirypop.jsx';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gallery navigation state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Enquiry popup state
  const [showEnquiry, setShowEnquiry] = useState(false);
  
  // Bookmarking status
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Authentication states
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const name = sessionStorage.getItem('name');
  const studentProfile = JSON.parse(sessionStorage.getItem('studentProfile') || 'null');
  
  const hasAccess = !!token || !!studentProfile?.phone;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await api.getListing(id);
        const model = new PropertyListing(data);
        setListing(model);
        // Set initial cover image index
        if (model.coverIndex) {
          setActiveImageIndex(model.coverIndex);
        }
      } catch (err) {
        setError(err.message || 'Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Fetch bookmarks status on load
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!hasAccess) return;
      try {
        const data = token
          ? await api.getBookmarks()
          : await api.getStudentProfile(studentProfile.phone);
        
        const bookmarks = token ? data : data.bookmarks;
        const bookmarked = (Array.isArray(bookmarks) ? bookmarks : []).some(
          (x) => String(x._id || x.id) === String(id)
        );
        setIsBookmarked(bookmarked);
      } catch {}
    };

    checkBookmarkStatus();
  }, [id, token, studentProfile?.phone, hasAccess]);

  const handleToggleBookmark = async () => {
    if (!hasAccess) {
      alert('Please verify student phone or login as landlord to save properties.');
      navigate('/student/verify');
      return;
    }
    
    try {
      if (isBookmarked) {
        if (token) {
          await api.deleteBookmark(id);
        } else {
          await api.deleteStudentBookmark(studentProfile.phone, id);
        }
        setIsBookmarked(false);
      } else {
        if (token) {
          await api.addBookmark(id);
        } else {
          await api.addStudentBookmark(studentProfile.phone, id);
        }
        setIsBookmarked(true);
      }
    } catch {
      alert('Failed to update bookmark status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-300">
        <p className="text-lg">Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-300 px-4">
        <div className="panel text-center max-w-md">
          <p className="text-lg font-medium text-rose-400 mb-2">{error || 'Property not found'}</p>
          <p className="text-sm text-slate-400 mb-6">The listing might have been removed by the landlord.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  const gallery = listing.gallery;
  const activeImage = gallery[activeImageIndex] || listing.image;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Back link */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        &larr; Back to properties
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Title, gallery, details, amenities */}
        <section className="lg:col-span-2 space-y-6">
          <div className="panel space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-blue-500/10 border border-blue-400/20 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
                {listing.propertyType}
              </span>
              <span className="rounded-md bg-indigo-500/10 border border-indigo-400/20 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                {listing.occupancyType ? `${listing.occupancyType} occupancy` : 'Single occupancy'}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{listing.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{listing.location}</p>
            </div>

            {/* Main Image View */}
            <div className="image-fit-container relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950">
              {activeImage ? (
                <>
                  <img src={activeImage} alt="" className="image-fit-blur-bg" />
                  <img 
                    src={activeImage} 
                    alt={listing.title} 
                    className="image-fit-content transition-opacity duration-300"
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No Image Available</div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg border bg-slate-900 transition-all ${
                      idx === activeImageIndex 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Panel */}
          <div className="panel space-y-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">About this property</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities Panel */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="panel space-y-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Amenities offered</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, idx) => (
                  <span key={idx} className="chip">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Pricing details, contact options, views */}
        <section className="space-y-6">
          {/* Price Spec Panel */}
          <div className="panel space-y-5">
            <div className="border-b border-slate-200 dark:border-white/10 pb-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Monthly rent</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-300 mt-1">{listing.price}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Security Deposit</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.deposit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Maintenance Charges</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.maintenance} / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Contract Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.contractDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Electricity Billing</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {listing.electricityIncluded ? 'Included in Rent' : 'Charged Extra'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button 
                onClick={() => setShowEnquiry(true)}
                className="btn-primary w-full shadow-lg"
              >
                Enquire Now
              </button>
              
              <button 
                onClick={handleToggleBookmark}
                className={`w-full ${isBookmarked ? 'btn-danger' : 'btn-secondary'}`}
              >
                {isBookmarked ? 'Saved to Shortlist' : 'Save to Shortlist'}
              </button>
            </div>
          </div>

          {/* Landlord Contact Info Card */}
          <div className="panel space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Landlord Details</h3>
            
            {hasAccess ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Contact Person</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{listing.name || 'Owner'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Phone Number</p>
                  <a href={`tel:${listing.phone}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block">
                    {listing.phone || 'Contact phone not listed'}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Email Address</p>
                  <a href={`mailto:${listing.toemail}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block">
                    {listing.toemail || 'Contact email not listed'}
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Contact details are locked. Verify your student phone number or login to request direct landlord details.
                </p>
                <button 
                  onClick={() => navigate('/student/verify')}
                  className="btn-secondary w-full !text-xs !py-2"
                >
                  Quick Student Verification
                </button>
              </div>
            )}
          </div>

          {/* Impressions / views indicator */}
          <div className="panel py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Impressions tracker</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {listing.impressions} {listing.impressions === 1 ? 'view' : 'views'}
            </span>
          </div>
        </section>
      </div>

      {/* Enquiry Popup overlay */}
      {showEnquiry && (
        <Enquirypop 
          onClose={() => setShowEnquiry(false)}
          toemail={listing.toemail}
          listingTitle={listing.title}
        />
      )}
    </main>
  );
};

export default ListingDetail;
