
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place } from '../types';
import { MapPin } from 'lucide-react';

const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface MapInterfaceProps {
  places: Place[];
  center?: { lat: number; lng: number };
  onPlaceSelect?: (place: Place) => void;
}

export const MapInterface: React.FC<MapInterfaceProps> = ({ places, center, onPlaceSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    fixLeafletIcons();

    if (mapRef.current && !mapInstanceRef.current) {
      // Toronto default
      const defaultCenter: [number, number] = center 
        ? [center.lat, center.lng] 
        : [43.6532, -79.3832];

      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(defaultCenter, 13);

      // Using CartoDB Voyager for a clean, light aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }

    // Fix for map loading issues (grey tiles) by invalidating size slightly after mount
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, []); 

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 14, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng])
        .addTo(map);
      
      if (onPlaceSelect) {
        // Interactive mode: Click opens details
        marker.on('click', () => {
          onPlaceSelect(place);
        });
        // Add a simple tooltip on hover
        marker.bindTooltip(place.name, {
          direction: 'top',
          offset: [0, -20],
          opacity: 0.9,
          className: 'font-sans font-bold text-xs px-2 py-1 rounded shadow-sm border-0 text-violet-900'
        });
      } else {
        // Read-only/Mini-map mode: Simple popup
         marker.bindPopup(`
          <div class="p-2 min-w-[150px] font-sans">
            <h3 class="font-bold text-slate-800 text-sm mb-1">${place.name}</h3>
            <p class="text-xs text-slate-500">${place.address}</p>
          </div>
        `);
      }
      
      markersRef.current.push(marker);
      bounds.extend([place.lat, place.lng]);
    });

    if (places.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
    
    // Ensure map renders correctly after markers added
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
    
  }, [places, onPlaceSelect]);

  return (
    <div className="h-full w-full relative rounded-[40px] overflow-hidden bg-slate-100 shadow-inner border border-white/50">
       <div ref={mapRef} className="absolute inset-0 z-0" />
       
       {/* Overlay Stats */}
       <div className="absolute top-6 right-6 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg shadow-slate-200/50 pointer-events-none">
         <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
           <MapPin size={12} className="text-violet-500" />
           <span>{places.length} Spots</span>
         </div>
       </div>
    </div>
  );
};
