# Travel Planner System - Complete Documentation

## Overview

Hệ thống Travel Planner được thiết kế dựa trên UI như Google Trips/TripIt, cho phép users tạo ra các travel plan với multiple days, places, notes, checklists và hotel bookings.

## Database Schema Design

### 1. Core Validation Schemas

```typescript
// lib/validation.ts - Thêm các schemas sau:

export const NoteSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, { message: "Note content is required." }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ChecklistItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, { message: "Checklist item is required." }),
  completed: z.boolean().default(false),
  createdAt: z.date().optional(),
});

export const ChecklistSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Checklist title is required." }),
  items: z.array(ChecklistItemSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PlaceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Place name is required." }),
  address: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  duration: z.string().optional(), // "58 min • 62 km"
  directions: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  order: z.number().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const DayPlanSchema = z.object({
  id: z.string().optional(),
  dayNumber: z.number().min(1),
  title: z.string().default("Day 1"),
  subheading: z.string().optional(),
  route: z
    .object({
      autoFill: z.boolean().default(false),
      optimize: z.boolean().default(false),
      duration: z.string().optional(),
      distance: z.string().optional(),
    })
    .optional(),
  places: z.array(PlaceSchema),
  notes: z.array(NoteSchema),
  checklists: z.array(ChecklistSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const TravelPlanSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Travel plan title is required." }),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  destination: z.string().optional(),
  coverImage: z.string().url().optional(),
  days: z.array(DayPlanSchema),
  hotels: z.array(HotelSchema).optional(),
  userId: z.string().optional(),
  collaborators: z.array(z.string()).optional(), // User IDs
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  budget: z
    .object({
      total: z.number().optional(),
      currency: z.string().default("USD"),
      categories: z.record(z.number()).optional(), // { "food": 500, "transport": 200 }
    })
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Update HotelSchema để tương thích với travel plan
export const HotelsArraySchema = z.object({
  hotels: z.array(HotelSchema),
});
```

### 2. Database Models

```typescript
// database/travel-plan.model.ts
import { Schema, model, models, Document } from "mongoose";

interface INote extends Document {
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IChecklistItem extends Document {
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface IChecklist extends Document {
  title: string;
  items: IChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface IPlace extends Document {
  name: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  duration?: string;
  directions?: string;
  notes?: string;
  rating?: number;
  order?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface IDayPlan extends Document {
  dayNumber: number;
  title: string;
  subheading?: string;
  route?: {
    autoFill: boolean;
    optimize: boolean;
    duration?: string;
    distance?: string;
  };
  places: IPlace[];
  notes: INote[];
  checklists: IChecklist[];
  createdAt: Date;
  updatedAt: Date;
}

interface ITravelPlan extends Document {
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  destination?: string;
  coverImage?: string;
  days: IDayPlan[];
  hotels: Schema.Types.ObjectId[];
  userId: Schema.Types.ObjectId;
  collaborators: Schema.Types.ObjectId[];
  isPublic: boolean;
  tags: string[];
  budget?: {
    total?: number;
    currency: string;
    categories?: Map<string, number>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ChecklistItemSchema = new Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ChecklistSchema = new Schema({
  title: { type: String, required: true },
  items: [ChecklistItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PlaceSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  duration: { type: String },
  directions: { type: String },
  notes: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  order: { type: Number },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const DayPlanSchema = new Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, default: "Day 1" },
  subheading: { type: String },
  route: {
    autoFill: { type: Boolean, default: false },
    optimize: { type: Boolean, default: false },
    duration: { type: String },
    distance: { type: String },
  },
  places: [PlaceSchema],
  notes: [NoteSchema],
  checklists: [ChecklistSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TravelPlanSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  destination: { type: String },
  coverImage: { type: String },
  days: [DayPlanSchema],
  hotels: [{ type: Schema.Types.ObjectId, ref: "Hotel" }],
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isPublic: { type: Boolean, default: false },
  tags: [{ type: String }],
  budget: {
    total: { type: Number },
    currency: { type: String, default: "USD" },
    categories: { type: Map, of: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
TravelPlanSchema.index({ userId: 1 });
TravelPlanSchema.index({ isPublic: 1 });
TravelPlanSchema.index({ tags: 1 });
TravelPlanSchema.index({ destination: 1 });
TravelPlanSchema.index({ createdAt: -1 });

const TravelPlan =
  models.TravelPlan || model<ITravelPlan>("TravelPlan", TravelPlanSchema);
export default TravelPlan;
```

### 3. TypeScript Global Types

```typescript
// types/travel.d.ts
declare global {
  interface Note {
    id?: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface ChecklistItem {
    id?: string;
    text: string;
    completed: boolean;
    createdAt?: Date;
  }

  interface Checklist {
    id?: string;
    title: string;
    items: ChecklistItem[];
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface Place {
    id?: string;
    name: string;
    address?: string;
    description?: string;
    imageUrl?: string;
    duration?: string;
    directions?: string;
    notes?: string;
    rating?: number;
    order?: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }

  interface DayPlan {
    id?: string;
    dayNumber: number;
    title: string;
    subheading?: string;
    route?: {
      autoFill: boolean;
      optimize: boolean;
      duration?: string;
      distance?: string;
    };
    places: Place[];
    notes: Note[];
    checklists: Checklist[];
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface TravelPlan {
    id?: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    destination?: string;
    coverImage?: string;
    days: DayPlan[];
    hotels?: Hotel[];
    userId?: string;
    collaborators?: string[];
    isPublic: boolean;
    tags?: string[];
    budget?: {
      total?: number;
      currency: string;
      categories?: Record<string, number>;
    };
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface Hotel {
    id?: string;
    name: string;
    address?: string;
    checkin?: string;
    checkout?: string;
    confirmation?: string;
    note?: string;
    cost?: {
      type: string;
      number: string;
    };
  }
}

export {};
```

### 4. Server Actions

```typescript
// lib/actions/travel-plan.action.ts
"use server";

import { connectToDatabase } from "@/lib/mongoose";
import TravelPlan from "@/database/travel-plan.model";
import { TravelPlanParams, CreateTravelPlanParams } from "@/types/action";
import { revalidatePath } from "next/cache";

export async function createTravelPlan(params: CreateTravelPlanParams) {
  try {
    await connectToDatabase();

    const {
      title,
      description,
      startDate,
      endDate,
      destination,
      userId,
      path,
    } = params;

    const travelPlan = await TravelPlan.create({
      title,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      destination,
      userId,
      days: [
        {
          dayNumber: 1,
          title: "Day 1",
          places: [],
          notes: [],
          checklists: [],
        },
      ],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (path) {
      revalidatePath(path);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error creating travel plan:", error);
    throw new Error("Failed to create travel plan");
  }
}

export async function updateTravelPlan(
  params: TravelPlanParams & { planId: string }
) {
  try {
    await connectToDatabase();

    const { planId, ...updateData } = params;

    const travelPlan = await TravelPlan.findByIdAndUpdate(
      planId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    if (params.path) {
      revalidatePath(params.path);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error updating travel plan:", error);
    throw new Error("Failed to update travel plan");
  }
}

export async function addDayToPlan(planId: string, dayData: Partial<DayPlan>) {
  try {
    await connectToDatabase();

    const travelPlan = await TravelPlan.findById(planId);
    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    const newDayNumber = travelPlan.days.length + 1;
    const newDay = {
      dayNumber: newDayNumber,
      title: `Day ${newDayNumber}`,
      places: [],
      notes: [],
      checklists: [],
      ...dayData,
    };

    travelPlan.days.push(newDay);
    travelPlan.updatedAt = new Date();

    await travelPlan.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error adding day to plan:", error);
    throw new Error("Failed to add day to plan");
  }
}

export async function addPlaceToDay(
  planId: string,
  dayNumber: number,
  placeData: Place
) {
  try {
    await connectToDatabase();

    const travelPlan = await TravelPlan.findById(planId);
    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    const dayIndex = travelPlan.days.findIndex(
      (day) => day.dayNumber === dayNumber
    );
    if (dayIndex === -1) {
      throw new Error("Day not found");
    }

    const newOrder = travelPlan.days[dayIndex].places.length + 1;
    travelPlan.days[dayIndex].places.push({
      ...placeData,
      order: newOrder,
    });

    travelPlan.updatedAt = new Date();
    await travelPlan.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error adding place to day:", error);
    throw new Error("Failed to add place to day");
  }
}

export async function addNoteToDay(
  planId: string,
  dayNumber: number,
  noteData: Note
) {
  try {
    await connectToDatabase();

    const travelPlan = await TravelPlan.findById(planId);
    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    const dayIndex = travelPlan.days.findIndex(
      (day) => day.dayNumber === dayNumber
    );
    if (dayIndex === -1) {
      throw new Error("Day not found");
    }

    travelPlan.days[dayIndex].notes.push({
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    travelPlan.updatedAt = new Date();
    await travelPlan.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error adding note to day:", error);
    throw new Error("Failed to add note to day");
  }
}

export async function addChecklistToDay(
  planId: string,
  dayNumber: number,
  checklistData: Checklist
) {
  try {
    await connectToDatabase();

    const travelPlan = await TravelPlan.findById(planId);
    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    const dayIndex = travelPlan.days.findIndex(
      (day) => day.dayNumber === dayNumber
    );
    if (dayIndex === -1) {
      throw new Error("Day not found");
    }

    travelPlan.days[dayIndex].checklists.push({
      ...checklistData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    travelPlan.updatedAt = new Date();
    await travelPlan.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error adding checklist to day:", error);
    throw new Error("Failed to add checklist to day");
  }
}

export async function getTravelPlansByUser(userId: string) {
  try {
    await connectToDatabase();

    const travelPlans = await TravelPlan.find({ userId })
      .populate("hotels")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlans)),
    };
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    throw new Error("Failed to fetch travel plans");
  }
}

export async function getTravelPlanById(planId: string) {
  try {
    await connectToDatabase();

    const travelPlan = await TravelPlan.findById(planId)
      .populate("hotels")
      .populate("userId", "name username image")
      .populate("collaborators", "name username image")
      .lean();

    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    throw new Error("Failed to fetch travel plan");
  }
}

export async function deleteTravelPlan(planId: string, path?: string) {
  try {
    await connectToDatabase();

    const travelPlan = await TravelPlan.findByIdAndDelete(planId);

    if (!travelPlan) {
      throw new Error("Travel plan not found");
    }

    if (path) {
      revalidatePath(path);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(travelPlan)),
    };
  } catch (error) {
    console.error("Error deleting travel plan:", error);
    throw new Error("Failed to delete travel plan");
  }
}
```

### 5. Action Types

```typescript
// types/action.d.ts - Thêm vào file existing

interface TravelPlanParams {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
  isPublic?: boolean;
  tags?: string[];
  path?: string;
}

interface CreateTravelPlanParams extends TravelPlanParams {
  userId: string;
}

interface DayPlanParams {
  title?: string;
  subheading?: string;
  route?: {
    autoFill: boolean;
    optimize: boolean;
    duration?: string;
    distance?: string;
  };
}

interface PlaceParams {
  name: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  duration?: string;
  directions?: string;
  notes?: string;
  rating?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface NoteParams {
  content: string;
}

interface ChecklistParams {
  title: string;
  items: {
    text: string;
    completed: boolean;
  }[];
}
```

## Component Architecture

### 1. Main Components Structure

```
components/
├── travel-plan/
│   ├── TravelPlanCard.tsx          # Card hiển thị travel plan
│   ├── TravelPlanForm.tsx          # Form tạo/edit travel plan
│   ├── DayPlanComponent.tsx        # Component cho 1 day
│   ├── PlaceComponent.tsx          # Component cho 1 place
│   ├── NoteComponent.tsx           # Component cho notes
│   ├── ChecklistComponent.tsx      # Component cho checklist
│   └── RouteOptimizer.tsx          # Component tối ưu route
├── input/
│   ├── InputCollapseHotel.tsx      # Existing hotel input
│   ├── PlaceInput.tsx              # Input thêm place
│   ├── NoteInput.tsx               # Input thêm note
│   └── ChecklistInput.tsx          # Input thêm checklist
└── ui/
    └── [existing components]
```

### 2. Sample JSON Structure

```json
{
  "id": "travel_plan_123",
  "title": "Amazing Vietnam Adventure",
  "description": "10-day trip exploring Vietnam",
  "startDate": "2024-12-10T00:00:00Z",
  "endDate": "2024-12-20T00:00:00Z",
  "destination": "Vietnam",
  "coverImage": "https://example.com/vietnam.jpg",
  "userId": "user_123",
  "collaborators": ["user_456", "user_789"],
  "isPublic": false,
  "tags": ["adventure", "culture", "food"],
  "budget": {
    "total": 2000,
    "currency": "USD",
    "categories": {
      "accommodation": 800,
      "food": 600,
      "transport": 400,
      "activities": 200
    }
  },
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1",
      "subheading": "Arrival in Ho Chi Minh City",
      "route": {
        "autoFill": true,
        "optimize": true,
        "duration": "8 hours",
        "distance": "45 km"
      },
      "places": [
        {
          "id": "place_1",
          "name": "Cu Chi Tunnel Ben Duoc",
          "address": "Ben Duoc, Cu Chi District, Ho Chi Minh City",
          "description": "Historic tunnel complex from Vietnam War",
          "imageUrl": "https://example.com/cu-chi.jpg",
          "duration": "58 min • 62 km",
          "directions": "Drive north from city center",
          "notes": "Bring comfortable clothes and water",
          "rating": 4.5,
          "order": 1,
          "coordinates": {
            "lat": 11.1413,
            "lng": 106.4954
          }
        },
        {
          "id": "place_2",
          "name": "Suoi Tien Theme Park",
          "address": "120 Xa Lo Ha Noi, District 9, Ho Chi Minh City",
          "description": "Vietnamese cultural theme park",
          "imageUrl": "https://example.com/suoi-tien.jpg",
          "rating": 4.0,
          "order": 2
        }
      ],
      "notes": [
        {
          "id": "note_1",
          "content": "Remember to bring sunscreen and comfortable walking shoes. The weather will be hot and humid.",
          "createdAt": "2024-01-01T10:00:00Z",
          "updatedAt": "2024-01-01T10:00:00Z"
        },
        {
          "id": "note_2",
          "content": "Check opening hours for Cu Chi Tunnels - they close at 5 PM",
          "createdAt": "2024-01-01T11:00:00Z",
          "updatedAt": "2024-01-01T11:00:00Z"
        }
      ],
      "checklists": [
        {
          "id": "checklist_1",
          "title": "Things to pack for Day 1",
          "items": [
            {
              "id": "item_1",
              "text": "Camera with extra batteries",
              "completed": false,
              "createdAt": "2024-01-01T09:00:00Z"
            },
            {
              "id": "item_2",
              "text": "Water bottles (2L)",
              "completed": true,
              "createdAt": "2024-01-01T09:00:00Z"
            },
            {
              "id": "item_3",
              "text": "Cash for entrance fees",
              "completed": false,
              "createdAt": "2024-01-01T09:00:00Z"
            }
          ],
          "createdAt": "2024-01-01T09:00:00Z",
          "updatedAt": "2024-01-01T10:30:00Z"
        },
        {
          "id": "checklist_2",
          "title": "Documents needed",
          "items": [
            {
              "id": "item_4",
              "text": "Passport",
              "completed": true,
              "createdAt": "2024-01-01T09:00:00Z"
            },
            {
              "id": "item_5",
              "text": "Travel insurance papers",
              "completed": false,
              "createdAt": "2024-01-01T09:00:00Z"
            }
          ],
          "createdAt": "2024-01-01T09:15:00Z",
          "updatedAt": "2024-01-01T09:15:00Z"
        }
      ],
      "createdAt": "2024-01-01T08:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "hotels": [
    {
      "id": "hotel_1",
      "name": "The Reverie Saigon",
      "address": "Times Square, Nguyen Hue Blvd, District 1",
      "checkin": "2024-12-10",
      "checkout": "2024-12-13",
      "confirmation": "REV-123456",
      "note": "Request river view room",
      "cost": {
        "type": "USD",
        "number": "450"
      }
    }
  ],
  "createdAt": "2024-01-01T08:00:00Z",
  "updatedAt": "2024-01-01T15:30:00Z"
}
```

## Features Implementation

### 1. Multiple Notes System

- Users có thể thêm unlimited notes cho mỗi day
- Mỗi note có timestamp và có thể edit/delete
- Support rich text hoặc markdown

### 2. Checklist System

- Multiple checklists per day
- Each checklist có title và multiple items
- Items có thể check/uncheck
- Real-time progress tracking

### 3. Places/Locations System

- Drag & drop để reorder places
- Auto-calculate route optimization
- Integration với Google Maps API
- Duration và distance calculation
- Photo upload cho mỗi place

### 4. Route Management

- Auto-fill từ Google Maps
- Route optimization
- Real-time traffic updates
- Multiple transportation options

### 5. Budget Tracking

- Category-based budget
- Multi-currency support
- Real-time expense tracking
- Budget vs actual spending comparison

### 6. Collaboration

- Share plans với other users
- Real-time collaborative editing
- Comment system
- Permission management

## Next Steps

### Immediate Implementation:

1. **Update validation.ts** với new schemas
2. **Create database models** theo design trên
3. **Implement server actions** cho CRUD operations
4. **Build components** theo component architecture
5. **Create pages** cho travel planner functionality

### Phase 2:

1. **Google Maps integration**
2. **Real-time collaboration**
3. **Mobile app support**
4. **Advanced route optimization**
5. **Budget tracking với expense categories**

### Phase 3:

1. **AI trip suggestions**
2. **Weather integration**
3. **Local recommendations**
4. **Social features** (reviews, sharing)
5. **Offline support**

## File Structure Changes Needed

```
app/
├── (root)/
│   ├── planners/
│   │   ├── page.tsx              # List all travel plans
│   │   ├── create/
│   │   │   └── page.tsx          # Create new travel plan
│   │   └── [id]/
│   │       ├── page.tsx          # View/edit travel plan
│   │       ├── edit/
│   │       └── share/
│   └── ...existing

components/
├── travel-plan/
│   ├── TravelPlanCard.tsx
│   ├── TravelPlanForm.tsx
│   ├── DayPlanComponent.tsx
│   ├── PlaceComponent.tsx
│   ├── NoteComponent.tsx
│   ├── ChecklistComponent.tsx
│   └── RouteOptimizer.tsx
└── ...existing

lib/actions/
├── travel-plan.action.ts
├── day-plan.action.ts
├── place.action.ts
├── note.action.ts
├── checklist.action.ts
└── ...existing
```

This comprehensive system will provide a complete travel planning solution similar to Google Trips với full functionality cho việc tạo, quản lý và share travel plans.
