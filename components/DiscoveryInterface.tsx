
import React, { useState } from 'react';
import { Search, Loader2, Navigation, Filter, ChevronDown, ChevronUp, SlidersHorizontal, Wifi, Clock, DollarSign, Zap } from 'lucide-react';
import { PlaceCard } from './PlaceCard';
import { searchPlaces } from '../services/geminiService';
import { Place, SearchParams, VibeType, CategoryType } from '../types';
import { VIBES, CATEGORIES } from '../constants';

interface DiscoveryInterfaceProps {
  onPlacesFound: (places: Place[]) => void;
  onLocationFound: (loc: { lat: number; lng: number }) => void;
  onPlaceSelect: (place: Place) => void;
  places: Place[];
  userLocation?: { lat: number; lng: number };
  savedPlaces: Place[];
  onToggleSave: (place: Place) => void;
}

export const DiscoveryInterface: React.FC<DiscoveryInterfaceProps> = ({ 
  onPlacesFound, 
  onLocationFound,
  onPlaceSelect,
  places,
  userLocation,
  savedPlaces,
  onToggleSave
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Filters
  const [selectedVibe, setSelectedVibe] = useState<VibeType>(VibeType.ANY);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CategoryType.ANY);
  const [radius, setRadius] = useState<string>('5km');
  
  // Toggles
  const [features, setFeatures] = useState({
    openLate: false,
    wifi: false,
    cheapEats: false,
    powerOutlets: false
  });

  const [locLoading, setLocLoading] = useState(false);

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLocationRequest = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onLocationFound(loc);
          setLocLoading(false);
        },
        (error) => {
          console.error(error);
          setLocLoading(false);
        }
      );
    } else {
      setLocLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsExpanded(false);
    const effectiveQuery = query.trim() || "recommended spots";
    setLoading(true);
    onPlacesFound([]); 

    const params: SearchParams = {
      query: effectiveQuery,
      vibe: selectedVibe,
      category: selectedCategory,
      radius: radius,
      features: features
    };

    const result = await searchPlaces(params, userLocation);

    const jsonBlockRegex = /```json([\s\S]*?)```/;
    const match = result.text.match(jsonBlockRegex);

    if (match && match[1]) {
      try {
        const parsedPlaces: Place[] = JSON.parse(match[1]);
        onPlacesFound(parsedPlaces);
      } catch (e) {
        console.error("Failed to parse places JSON", e);
      }
    }

    setLoading(false);
  };

  const isPlaceSaved = (place: Place) => {
    return savedPlaces.some(p => p.name === place.name && p.address === place.address);
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Search & Filters Bubble */}
      <div className={`
        bg-white/70 backdrop-blur-2xl shadow-sm border border-white mb-6 
        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isExpanded ? 'p-6 rounded-[32px]' : 'p-4 rounded-[24px]'}
      `}>
        
        <div className="flex justify-between items-center">
           {isExpanded ? (
             <div>
               <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Explore GTA</h2>
               <p className="text-slate-400 font-medium text-sm">Find your next favorite hangout</p>
             </div>
           ) : (
             <div 
               onClick={() => setIsExpanded(true)}
               className="flex-1 flex items-center gap-3 cursor-pointer group"
             >
                <div className="bg-violet-100 text-violet-600 p-2.5 rounded-full group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                   <Search size={16} strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">
                     {query || "Exploring GTA"}
                   </h3>
                   <p className="text-xs text-slate-400 font-bold truncate">
                     {selectedCategory === 'Anything' ? 'All Spots' : selectedCategory} • {selectedVibe === 'Any Vibe' ? 'Any Vibe' : selectedVibe}
                   </p>
                </div>
             </div>
           )}

           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="p-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-violet-500 hover:border-violet-100 transition-all active:scale-95 ml-2 shrink-0"
           >
             {isExpanded ? <ChevronUp size={20} /> : <SlidersHorizontal size={18} />}
           </button>
        </div>
        
        {/* Collapsible Content */}
        <div className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isExpanded ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}
        `}>
          {/* Main Search Input */}
          <div className="relative mb-4 group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for matcha, tacos, quiet study..."
              className="w-full pl-12 pr-4 py-4 bg-slate-100/80 border-0 rounded-full text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-violet-100 focus:bg-white transition-all text-sm font-semibold"
            />
            <Search className="absolute left-5 top-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
          </div>

          {/* Dropdowns - Bubbles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                className="appearance-none w-full bg-slate-50 border-0 text-slate-600 text-xs font-bold rounded-2xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all cursor-pointer hover:bg-slate-100"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={selectedVibe}
                onChange={(e) => setSelectedVibe(e.target.value as VibeType)}
                className="appearance-none w-full bg-slate-50 border-0 text-slate-600 text-xs font-bold rounded-2xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all cursor-pointer hover:bg-slate-100"
              >
                {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="appearance-none w-full bg-slate-50 border-0 text-slate-600 text-xs font-bold rounded-2xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all cursor-pointer hover:bg-slate-100"
              >
                <option value="1km">1 km</option>
                <option value="5km">5 km</option>
                <option value="10km">10 km</option>
                <option value="25km">GTA (25km)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Feature Toggles - Horizontal Scroll on mobile if needed */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              onClick={() => toggleFeature('openLate')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all border-2 ${features.openLate ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-200' : 'bg-transparent border-slate-100 text-slate-400 hover:border-violet-200'}`}
            >
              <Clock size={12} />
              Late
            </button>
            
            <button 
              onClick={() => toggleFeature('wifi')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all border-2 ${features.wifi ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-200' : 'bg-transparent border-slate-100 text-slate-400 hover:border-violet-200'}`}
            >
              <Wifi size={12} />
              Wifi
            </button>

            <button 
              onClick={() => toggleFeature('powerOutlets')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all border-2 ${features.powerOutlets ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-200' : 'bg-transparent border-slate-100 text-slate-400 hover:border-violet-200'}`}
            >
              <Zap size={12} />
              Power
            </button>

            <button 
              onClick={() => toggleFeature('cheapEats')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all border-2 ${features.cheapEats ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-200' : 'bg-transparent border-slate-100 text-slate-400 hover:border-violet-200'}`}
            >
              <DollarSign size={12} />
              Cheap
            </button>

             <button 
              onClick={handleLocationRequest}
              className={`ml-auto flex items-center justify-center w-9 h-9 rounded-full transition-all border-2 ${userLocation ? 'bg-emerald-400 border-emerald-400 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
              title="Use my location"
            >
              {locLoading ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
            </button>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-full transition-all shadow-xl shadow-slate-200 disabled:opacity-70 disabled:shadow-none flex justify-center items-center gap-2 text-sm tracking-wide transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Searching...</span>
              </>
            ) : (
              'Find Spots'
            )}
          </button>
        </div>
      </div>

      {/* Results Feed */}
      <div className="flex-1 overflow-y-auto px-1 pb-24 scrollbar-hide -mx-2 px-2">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Loader2 className="animate-spin text-violet-500" size={24} />
             </div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading</p>
           </div>
        ) : places.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-bold text-slate-800 text-lg">Top Picks</h3>
            </div>
            {places.map((place, idx) => (
              <PlaceCard 
                key={idx} 
                place={place} 
                onSelect={() => onPlaceSelect(place)}
                isSaved={isPlaceSaved(place)}
                onToggleSave={() => onToggleSave(place)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-20 h-20 bg-white rounded-[30px] flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <Filter size={32} className="text-slate-300" />
            </div>
            <p className="text-center max-w-xs text-sm font-medium text-slate-500">Set your filters to start exploring.</p>
          </div>
        )}
      </div>
    </div>
  );
};
