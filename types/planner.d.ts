// Type definitions for trip planner components

// Detail types for route planning
export interface RouteDetail {
  type: "route";
  name: string;
  data: (PlaceItem | NoteItem | ChecklistItem)[];
  index: number;
  date?: string;
}

export interface ListDetail {
  type: "list";
  name: string;
  data: (PlaceItem | NoteItem | ChecklistItem)[];
  index: number;
}

export type Detail = RouteDetail | ListDetail;

// Item types that can be in route data
export interface PlaceItem {
  type: "place";
  id?: string;
  name?: string;
  address?: string;
  description?: string;
  timeStart?: string; // Visit duration in minutes
  timeEnd?: string; // Priority level (1-5)
  location?: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
  attractionId?: string;
  attractionData?: {
    openingPeriods?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface NoteItem {
  type: "note";
  content: string;
  [key: string]: any;
}

export interface ChecklistItem {
  type: "checklist";
  items: string[];
  completed?: boolean[];
  [key: string]: any;
}

// Hotel information type
export interface HotelInfo {
  name?: string;
  address?: string;
  checkIn?: string | Date;
  checkOut?: string | Date;
  confirmation?: string;
  notes?: string;
  cost?: any;
  location?: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
  [key: string]: any;
}

// Type for place with optimization data
export interface PlaceWithData {
  id?: string;
  name?: string;
  coordinates: { lat: number; lon: number };
  visitDuration: number;
  priority: number;
  openingPeriods: any[] | null;
  attractionId?: string;
  [key: string]: any;
}
