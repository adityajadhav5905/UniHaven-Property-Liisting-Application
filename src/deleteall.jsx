import React from 'react';
import api from './api.js';

const Deleteall = ({ onListingsCleared }) => {
  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to clear all user listings?")) {
      try {
        await api.clearAllListings();
        alert('All listings cleared!');
        if (onListingsCleared) onListingsCleared();
      } catch (error) {
        alert(error.message || 'Failed to clear listings.');
      }
    }
  };
  return (
    <div className="w-full flex justify-center my-4">
      <button
        onClick={handleDeleteAll}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md"
      >
        Clear All User Listings
      </button>
    </div>
  );
};

export default Deleteall;
