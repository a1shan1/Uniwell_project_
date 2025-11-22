
export interface SearchParams {
  query: string;
  vibe: VibeType;
  category: CategoryType;
  radius: string; // e.g., "1km", "5km"
  features: {
    openLate: boolean;
    wifi: boolean;
    cheapEats: boolean;
    powerOutlets: boolean;
  }
}

export enum VibeType {
  ANY = 'Any Vibe',
  AESTHETIC = 'Aesthetic & Cute',
  CHILL = 'Quiet & Focus',
  SOCIAL = 'Loud & Social',
  NATURE = 'Green & Outdoors',
  INDUSTRIAL = 'Modern & Industrial',
  COZY = 'Warm & Cozy',
  DATE = 'Date Spot',
  GROUP = 'Group Friendly'
}

export enum CategoryType {
  ANY = 'Anything',
  CAFE = 'Cafe',
  BUBBLE_TEA = 'Bubble Tea Shop',
  LIBRARY = 'Library/Study Hall',
  COWORKING = 'Coworking Space',
  RESTAURANT = 'Restaurant/Diner',
  BAR = 'Bar/Pub',
  PARK = 'Park/Outdoor',
  BOOKSTORE = 'Bookstore',
  ART_SPACE = 'Art/Creative Space',
  MALL = 'Shopping Mall',
  SHOPPING = 'Thrift/Retail Store',
  ENTERTAINMENT = 'Entertainment (Escape Room/Arcade)'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[]
    }
  };
}

export interface Place {
  name: string;
  lat: number;
  lng: number;
  description: string;
  address: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
  reviewSnippets?: string[];
  imageKeywords?: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  groundingChunks?: GroundingChunk[];
}

export interface GeminiResult {
  text: string;
  groundingChunks?: GroundingChunk[];
}
