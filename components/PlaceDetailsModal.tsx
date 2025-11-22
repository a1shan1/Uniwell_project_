
import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Quote, Heart, Share2, Check } from 'lucide-react';
import { Place } from '../types';
import { MapInterface } from './MapInterface';

interface PlaceDetailsModalProps {
  place: Place;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ place, onClose, isSaved, onToggleSave }) => {
  const [copied, setCopied] = useState(false);

  // Generate a LoremFlickr URL based on keywords or category
  const imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(place.imageKeywords || place.tags?.[0] || 'city,architecture')}/all`;

  const handleShare = async () => {
    const shareData = {
      title: place.name,
      text: `Check out ${place.name} at ${place.address}. Found on UniSpots!`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
        console.debug('Share failed or cancelled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Left Side: Image & Quick Info */}
        <div className="w-full md:w-2/5 bg-slate-50 relative flex flex-col">
          <div className="h-64 md:h-1/2 w-full relative group">
             <img 
               src={imageUrl} 
               alt={place.name} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
             <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex flex-wrap gap-2 mb-2">
                  {place.tags?.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-4">
             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address</h3>
               <div className="flex items-start gap-2 text-slate-700">
                 <MapPin size={16} className="text-violet-500 mt-0.5 shrink-0" />
                 <p className="text-sm font-medium leading-snug">{place.address}</p>
               </div>
             </div>

             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rating</h3>
               <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-slate-800">{place.rating || 4.5}</span>
                  <div className="flex flex-col">
                    {renderStars(place.rating || 4.5)}
                    <span className="text-xs text-slate-500 font-medium">{place.reviews || 100} reviews</span>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Details & Map */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col bg-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">{place.name}</h2>
              <p className="text-slate-500 text-base leading-relaxed">{place.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
                title={copied ? "Copied!" : "Share"}
              >
                {copied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
              </button>

              {onToggleSave && (
                <button
                  onClick={onToggleSave}
                  className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-pink-50 text-pink-500' : 'bg-slate-100 text-slate-400 hover:text-pink-400 hover:bg-pink-50'}`}
                >
                  <Heart size={20} className={isSaved ? "fill-current" : ""} />
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Interactive Mini Map */}
          <div className="h-48 w-full rounded-3xl overflow-hidden border border-slate-100 shadow-inner mb-6 relative group">
             <div className="absolute inset-0 z-0 pointer-events-none group-hover:pointer-events-auto">
                <MapInterface places={[place]} center={{ lat: place.lat, lng: place.lng }} />
             </div>
          </div>

          {/* Reviews */}
          <div className="mt-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              Student Vibes <span className="text-slate-300 text-sm font-normal">(Reviews)</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {place.reviewSnippets?.map((snippet, idx) => (
                <div key={idx} className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100 relative">
                  <Quote size={16} className="text-violet-300 absolute top-4 left-4" />
                  <p className="pl-6 text-sm text-slate-700 italic font-medium">"{snippet}"</p>
                </div>
              )) || (
                <p className="text-slate-400 text-sm italic">No reviews available yet for this spot.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
