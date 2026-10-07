import React from 'react';
import { Heart, Loader2 } from 'lucide-react';

export default function WishlistButton({ isWishlisted, onToggle, loading, className = '' }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loading) {
          onToggle();
        }
      }}
      disabled={loading}
      className={`absolute top-4 right-4 bg-surface/90 p-2 rounded-full transition-colors shadow-sm z-10 ${
        isWishlisted
          ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
          : 'text-muted hover:text-red-500 hover:bg-red-50'
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
      )}
    </button>
  );
}
