import { useState, useEffect } from 'react';

export interface FavoriteRoute {
  id: string;
  from: string;
  to: string;
  mode: 'train' | 'metro' | 'bus' | 'ferry';
  createdAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('nsw-train-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nsw-train-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (from: string, to: string, mode: 'train' | 'metro' | 'bus' | 'ferry') => {
    const id = `${from}-${to}-${mode}`;
    
    // Check if already exists
    if (favorites.some(fav => fav.id === id)) {
      return false;
    }

    const newFavorite: FavoriteRoute = {
      id,
      from,
      to,
      mode,
      createdAt: new Date().toISOString()
    };

    setFavorites(prev => [...prev, newFavorite]);
    return true;
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  const isFavorite = (from: string, to: string, mode: string): boolean => {
    const id = `${from}-${to}-${mode}`;
    return favorites.some(fav => fav.id === id);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
}
