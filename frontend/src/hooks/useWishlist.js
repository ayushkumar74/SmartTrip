import { useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlist.service';
import { useAuth } from '../context/AuthContext';

const normalizeId = (id) => {
  if (!id) return id;
  return String(id).replace(/^db_dest_|^db_hotel_|^db_room_|^db_/, '');
};

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    if (user) {
      wishlistService.getWishlist()
        .then((res) => {
          if (active) {
            setWishlistItems(res.data?.items || []);
            setInitialized(true);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch wishlist', err);
          if (active) setInitialized(true);
        });
    } else {
      if (active) setInitialized(true);
    }
    return () => { active = false; };
  }, [user]);

  const toggleWishlist = useCallback(async (itemType, itemId) => {
    if (!user) {
      // If unauthenticated, you might want to redirect to login or show toast
      // For now, fail silently or alert
      alert('Please log in to use the wishlist.');
      return;
    }

    const normalizedId = normalizeId(itemId);

    if (wishlistLoadingIds.has(itemId)) return;

    setWishlistLoadingIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    try {
      // Find existing
      const existing = wishlistItems.find(w => 
        (itemType === 'destination' && w.destinationId === normalizedId) ||
        (itemType === 'hotel' && w.hotelId === normalizedId) ||
        (itemType === 'package' && w.packageId === normalizedId) ||
        (w[itemType]?.id === normalizedId)
      );

      if (existing) {
        await wishlistService.removeFromWishlist(existing.id);
        setWishlistItems(prev => prev.filter(w => w.id !== existing.id));
      } else {
        const result = await wishlistService.addToWishlist({ type: itemType, itemId: normalizedId });
        if (result?.data?.item) {
          setWishlistItems(prev => [result.data.item, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
      // You could show a toast here if a toast system is implemented
    } finally {
      setWishlistLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [user, wishlistItems, wishlistLoadingIds]);

  const isWishlisted = useCallback((itemType, itemId) => {
    const normalizedId = normalizeId(itemId);
    return wishlistItems.some(w => 
      (itemType === 'destination' && w.destinationId === normalizedId) ||
      (itemType === 'hotel' && w.hotelId === normalizedId) ||
      (itemType === 'package' && w.packageId === normalizedId) ||
      (w[itemType]?.id === normalizedId)
    );
  }, [wishlistItems]);

  const isLoading = useCallback((itemId) => {
    return wishlistLoadingIds.has(itemId);
  }, [wishlistLoadingIds]);

  return {
    wishlistItems,
    toggleWishlist,
    isWishlisted,
    isLoading,
    initialized
  };
}
