import React from 'react';

// The Card component handles individual property visual representation. 
// It safely destructures incoming listing properties with fallbacks.
const Card = ({ _id, id, title, description, image, price, location, metadata, onOpenDetails, isBookmarked = false, onToggleBookmark }) => {
  // Unify ID structures between potential format discrepancies (front-end vs back-end mappings)
  const listingId = _id || id;
  const m = metadata || {};

  return (
    // 'group' class ensures child elements can trigger animations when the parent card is hovered
    <article 
      onClick={() => onOpenDetails && onOpenDetails(listingId)}
      className="listing-card group"
    >
      
      {/* Property Cover Image Section */}
      <div className="image-fit-container h-44 w-full border-b border-slate-200 dark:border-white/10 rounded-t-[0.8rem] relative">
        {image ? (
          <>
            <img src={image} alt="" className="image-fit-blur-bg" />
            <img src={image} alt={title} className="image-fit-content transition duration-500 group-hover:scale-105" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image uploaded</div>
        )}
        {/* Absolute positioned premium badge for the property sub-type */}
        <span className="absolute left-3 top-3 rounded-md bg-slate-900/90 dark:bg-slate-950/75 px-2 py-1 text-xs text-slate-100 dark:text-blue-200 font-bold shadow-md z-10">{m.propertyType || 'Property'}</span>
      </div>

      {/* Property Details Section */}
      <div className="space-y-3 p-4 flex flex-col flex-1">
        <div>
          {/* clamp limits title size preventing huge text blocks from breaking UI uniformity */}
          <h3 className="line-clamp-1 text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{location}</p>
        </div>
        
        {/* Informational chips for rapid scanning by students */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="chip">Deposit: {m.deposit || 'N/A'}</span>
          <span className="chip">Occupancy: {m.occupancyType || 'N/A'}</span>
          <span className="chip">Duration: {m.contractDuration || 'N/A'}</span>
        </div>
        
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        
        {/* Render a few amenities/tags as small badges */}
        {m.amenities && m.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {m.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-550 dark:text-slate-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {amenity}
              </span>
            ))}
            {m.amenities.length > 3 && (
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold self-center">
                +{m.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing header and electrical utility indicator */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-300 tracking-tight">{price}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{m.electricityIncluded ? 'Electricity included' : 'Electricity extra'}</p>
        </div>
        
        {/* Call to Actions (CTA) */}
        <div className="flex items-center gap-2 mt-2">
          <button 
            className="btn-primary flex-1 shadow-md" 
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails && onOpenDetails(listingId);
            }}
          >
            View details
          </button>
          <button
            // Dynamically change visual weight depending on bookmark state
            className={isBookmarked ? 'btn-danger flex-1' : 'btn-secondary flex-1'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark && onToggleBookmark(listingId, isBookmarked);
            }}
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default Card;

