
import React, { useState, useEffect } from 'react';
import { DiscoveryInterface } from './components/DiscoveryInterface';
import { MapInterface } from './components/MapInterface';
import { PlaceDetailsModal } from './components/PlaceDetailsModal';
import { GraduationCap } from 'lucide-react';
import { Place } from './types';

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Persistence for Saved Places
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(() => {
    try {
      const saved = localStorage.getItem('unispots_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load saved places", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('unispots_saved', JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  const toggleSavePlace = (place: Place) => {
    setSavedPlaces(prev => {
      const isSaved = prev.some(p => p.name === place.name && p.address === place.address);
      if (isSaved) {
        return prev.filter(p => p.name !== place.name || p.address !== place.address);
      } else {
        return [...prev, place];
      }
    });
  };

  const isPlaceSaved = (place: Place) => {
    return savedPlaces.some(p => p.name === place.name && p.address === place.address);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-violet-200 selection:text-violet-900 relative">
      
      {/* Decorative Bubbly Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header - iOS Style */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 shrink-0 z-50 sticky top-0 pt-safe">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-violet-500 text-white p-2 rounded-2xl shadow-lg shadow-violet-200">
                <GraduationCap size={22} strokeWidth={2.5} />
             </div>
             <span className="text-xl font-extrabold text-slate-800 tracking-tight">
               UniSpots
             </span>
          </div>
          
          <div className="flex items-center gap-2">
             <button className="px-5 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">
               Log In
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Panel: Search & List */}
        <div className={`
          w-full lg:w-[480px] xl:w-[520px] flex flex-col bg-transparent p-4 lg:p-6
          ${mobileView === 'list' ? 'absolute inset-0 lg:static' : 'hidden lg:flex'}
        `}>
          <DiscoveryInterface 
            onPlacesFound={setPlaces} 
            onLocationFound={setUserLocation}
            onPlaceSelect={setSelectedPlace}
            places={places}
            userLocation={userLocation}
            savedPlaces={savedPlaces}
            onToggleSave={toggleSavePlace}
          />
        </div>

        {/* Right Panel: Map */}
        <div className={`
          flex-1 bg-white/50 relative rounded-tl-[40px] overflow-hidden border-l border-white/50 shadow-inner
          ${mobileView === 'map' ? 'absolute inset-0 lg:static' : 'hidden lg:block'}
        `}>
          <div className="absolute inset-0">
             <MapInterface 
                places={places} 
                center={userLocation}
                onPlaceSelect={setSelectedPlace}
             />
          </div>
        </div>

        {/* Mobile View Toggle - Floating Pill */}
        <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex bg-white/90 backdrop-blur-md rounded-full shadow-xl shadow-violet-900/10 border border-white/50 p-1.5">
          <button 
            onClick={() => setMobileView('list')}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${mobileView === 'list' ? 'bg-violet-500 text-white shadow-lg shadow-violet-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            List
          </button>
          <button 
            onClick={() => setMobileView('map')}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${mobileView === 'map' ? 'bg-violet-500 text-white shadow-lg shadow-violet-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Map
          </button>
        </div>

      </div>

      {/* Detail Modal Overlay */}
      {selectedPlace && (
        <PlaceDetailsModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
          isSaved={isPlaceSaved(selectedPlace)}
          onToggleSave={() => toggleSavePlace(selectedPlace)}
        />
      )}
    </div>
  );
};

export default App;
