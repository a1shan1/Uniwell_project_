
import React from 'react';
import { Place } from '../types';
import { MapPin, ArrowUpRight, Star, Heart } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
  onSelect?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick, onSelect, isSaved, onToggleSave }) => {
  // Default values for visual completeness if API doesn't return them
  const rating = place.rating || 4.5;
  const reviews = place.reviews || 88;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white p-6 rounded-[32px] border border-white shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-1"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
             <div className="flex items-center gap-2 mb-1">
                <span className="bg-violet-100 text-violet-600 text-[10px] font-bold px-2 py-1 rounded-full">OPEN</span>
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                  <span className="text-[10px] font-bold text-slate-500 ml-1">
                    {rating} ({reviews})
                  </span>
                </div>
             </div>
             <h3 className="font-bold text-slate-800 text-xl group-hover:text-violet-600 transition-colors tracking-tight leading-tight">
              {place.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
                className={`
                  p-2 rounded-full transition-all duration-300 
                  ${isSaved 
                    ? 'bg-pink-50 text-pink-500 hover:bg-pink-100' 
                    : 'bg-slate-50 text-slate-300 hover:text-pink-400 hover:bg-pink-50'}
                `}
                title={isSaved ? "Unsave" : "Save for later"}
              >
                <Heart size={18} className={isSaved ? "fill-current" : ""} />
              </button>
            )}
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 if (onSelect) onSelect();
               }}
               className="bg-slate-50 p-2 rounded-full hover:bg-violet-500 hover:text-white transition-all duration-300 cursor-pointer text-slate-500"
               title="View Details"
            >
               <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-4">
          <MapPin size={14} className="text-violet-400" />
          <span className="line-clamp-1">{place.address}</span>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-5 font-medium">
          {place.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            {place.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
