'use client'

import React from 'react';
import { Button } from './ui/button';
import { Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';

export default function WatchlistButton({ 
  symbol, 
  company, 
  isInWatchlist, 
  showTrashIcon, 
  type = 'button',
  onWatchlistChange 
}: WatchlistButtonProps) {
  const handleClick = () => {
    if (onWatchlistChange) {
      onWatchlistChange(symbol, !isInWatchlist);
    }
  };

  if (type === 'icon') {
    return (
      <button onClick={handleClick} className="text-gray-400 hover:text-white transition-colors">
        {showTrashIcon ? <Trash2 className="w-5 h-5 text-red-500" /> : (isInWatchlist ? <BookmarkCheck className="w-5 h-5 text-[#0FEDBE]" /> : <Bookmark className="w-5 h-5" />)}
      </button>
    );
  }

  return (
    <Button 
      onClick={handleClick}
      variant={isInWatchlist ? "secondary" : "default"}
      className="watchlist-btn flex items-center justify-center gap-2"
    >
      {showTrashIcon ? <Trash2 className="w-4 h-4" /> : (isInWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />)}
      {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  );
}
