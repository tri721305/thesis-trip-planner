# Travel Planner System - Entity Relationship Diagram

## Database Schema Visualization

This ERD shows the complete database relationships for the travel planner system with the new referenced design pattern.

```mermaid
---
title: Travel Planner System - Database Schema
---
erDiagram
    %% Core Entities with Relationships
    User ||--o{ TravelPlan : creates
    User }o--o{ TravelPlan : collaborates

    TravelPlan ||--o{ Day : "contains"
    TravelPlan ||--o{ Hotel : "books"

    Day ||--o{ Place : "visits"
    Day ||--o{ Note : "has"
    Day ||--o{ Checklist : "manages"

    Checklist ||--o{ ChecklistItem : "contains"

    User ||--o{ ChecklistItem : "assigned to"

    %% Entity Definitions with Attributes
    User {
        ObjectId _id PK "Primary Key"
        string clerkId UK "Clerk Authentication ID"
        string name "Full name"
        string email UK "Email address"
        string username UK "Unique username"
        string image "Profile image URL"
        string bio "User biography"
        string location "User location"
        datetime createdAt "Account creation date"
        datetime updatedAt "Last update date"
    }

    TravelPlan {
        ObjectId _id PK "Primary Key"
        ObjectId userId FK "Creator user ID"
        string title "Travel plan title"
        string description "Travel plan description"
        date startDate "Trip start date"
        date endDate "Trip end date"
        ObjectId[] collaborators FK "Collaborator user IDs"
        boolean isPublic "Public visibility flag"
        string status "Plan status: draft/active/completed/archived"
        string coverImage "Cover image URL"
        datetime createdAt "Plan creation date"
        datetime updatedAt "Last update date"
    }

    Day {
        ObjectId _id PK "Primary Key"
        ObjectId travelPlanId FK "Travel plan reference"
        int dayNumber "Day sequence number"
        string title "Day title"
        string subheading "Day subtitle"
        date date "Specific date for this day"
        object route "Route configuration and data"
        datetime createdAt "Day creation date"
        datetime updatedAt "Last update date"
    }

    Place {
        ObjectId _id PK "Primary Key"
        ObjectId dayId FK "Day reference"
        string name "Place name"
        string address "Full address"
        string description "Place description"
        string imageUrl "Place image URL"
        int order "Visit order in day"
        object coordinates "GPS coordinates (lat, lng)"
        string duration "Estimated visit duration"
        string directions "Directions to place"
        string notes "Personal notes"
        float rating "User rating (1-5)"
        string website "Official website"
        string phone "Contact phone"
        string[] openHours "Opening hours array"
        string priceRange "Price range indicator"
        string[] categories "Place categories/tags"
        object travelFromPrevious "Travel info from previous place"
        datetime createdAt "Place creation date"
        datetime updatedAt "Last update date"
    }

    Note {
        ObjectId _id PK "Primary Key"
        ObjectId dayId FK "Day reference"
        string content "Note content"
        string type "Note type: text/link/reminder/tip"
        int order "Display order"
        boolean isImportant "Important flag"
        string[] attachments "Attachment file URLs"
        datetime createdAt "Note creation date"
        datetime updatedAt "Last update date"
    }

    Checklist {
        ObjectId _id PK "Primary Key"
        ObjectId dayId FK "Day reference"
        string title "Checklist title"
        string description "Checklist description"
        int order "Display order"
        string category "Category: packing/todo/shopping/documents/custom"
        boolean isCompleted "Completion status"
        datetime completedAt "Completion timestamp"
        datetime createdAt "Checklist creation date"
        datetime updatedAt "Last update date"
    }

    ChecklistItem {
        ObjectId _id PK "Primary Key"
        ObjectId checklistId FK "Checklist reference"
        ObjectId assignedTo FK "Assigned user ID"
        string text "Item description"
        boolean completed "Completion status"
        datetime completedAt "Completion timestamp"
        int order "Display order"
        string notes "Additional notes"
        string priority "Priority: low/medium/high"
        datetime createdAt "Item creation date"
        datetime updatedAt "Last update date"
    }

    Hotel {
        ObjectId _id PK "Primary Key"
        ObjectId travelPlanId FK "Travel plan reference"
        string name "Hotel name"
        string address "Hotel address"
        date checkIn "Check-in date"
        date checkOut "Check-out date"
        string confirmationNumber "Booking confirmation"
        string notes "Booking notes"
        object cost "Cost amount and currency"
        float rating "Hotel rating (1-5)"
        string website "Hotel website"
        string phone "Hotel phone"
        object coordinates "GPS coordinates (lat, lng)"
        string[] amenities "Hotel amenities list"
        string roomType "Room type booked"
        string bookingSource "Booking platform used"
        datetime createdAt "Hotel booking creation date"
        datetime updatedAt "Last update date"
    }
```

## 📊 Relationship Summary

### **One-to-Many Relationships**

1. **User** → **TravelPlan** (1:M) - A user can create multiple travel plans
2. **TravelPlan** → **Day** (1:M) - A travel plan contains multiple days
3. **TravelPlan** → **Hotel** (1:M) - A travel plan can have multiple hotel bookings
4. **Day** → **Place** (1:M) - A day can have multiple places to visit
5. **Day** → **Note** (1:M) - A day can have multiple notes
6. **Day** → **Checklist** (1:M) - A day can have multiple checklists
7. **Checklist** → **ChecklistItem** (1:M) - A checklist contains multiple items

### **Many-to-Many Relationships**

1. **User** ↔ **TravelPlan** (M:M) - Users can collaborate on travel plans
2. **User** ↔ **ChecklistItem** (M:M) - Users can be assigned to checklist items

## 🔑 Key Design Decisions

### **Primary Keys**

- All entities use MongoDB ObjectId as primary key (`_id`)
- Ensures unique identification across collections
- Enables efficient indexing and relationships

### **Foreign Keys**

- Referenced using ObjectId fields with FK notation
- Enables proper data normalization and relationships
- Supports efficient queries and joins

### **Indexes (Recommended)**

```javascript
// Travel Plan Collection
db.travelplans.createIndex({ userId: 1, status: 1 });
db.travelplans.createIndex({ collaborators: 1 });
db.travelplans.createIndex({ isPublic: 1, status: 1 });

// Day Collection
db.days.createIndex({ travelPlanId: 1, dayNumber: 1 }, { unique: true });

// Place Collection
db.places.createIndex({ dayId: 1, order: 1 });
db.places.createIndex({ coordinates: "2dsphere" }); // Geospatial queries

// Note Collection
db.notes.createIndex({ dayId: 1, order: 1 });

// Checklist Collection
db.checklists.createIndex({ dayId: 1, order: 1 });

// ChecklistItem Collection
db.checklistitems.createIndex({ checklistId: 1, order: 1 });
db.checklistitems.createIndex({ assignedTo: 1 });

// Hotel Collection
db.hotels.createIndex({ travelPlanId: 1 });
db.hotels.createIndex({ checkIn: 1, checkOut: 1 });
```

## 🎯 Benefits of This Schema Design

### **Scalability**

- No MongoDB 16MB document size limit
- Each collection can grow independently
- Better memory utilization

### **Performance**

- Targeted queries for specific entities
- Efficient indexing strategies
- Optimized for different access patterns

### **Flexibility**

- Easy to add new entity types
- Support for complex relationships
- Extensible for future features

### **Data Integrity**

- Proper foreign key relationships
- Referential integrity through validation
- Consistent data structure

### **Collaboration Features**

- User assignment to checklist items
- Multiple collaborators per travel plan
- Granular permission control potential

## 🚀 Implementation Notes

### **Query Patterns**

```javascript
// Get complete travel plan with all related data
const travelPlan = await TravelPlan.findById(id)
  .populate({
    path: "days",
    populate: [
      { path: "places", options: { sort: { order: 1 } } },
      { path: "notes", options: { sort: { order: 1 } } },
      {
        path: "checklists",
        populate: {
          path: "items",
          options: { sort: { order: 1 } },
          populate: { path: "assignedTo", select: "name email" },
        },
      },
    ],
  })
  .populate("hotels")
  .populate("collaborators", "name email image");
```

### **Transaction Support**

```javascript
// Multi-collection operations with transactions
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const travelPlan = await TravelPlan.create([newPlan], { session });
  const day = await Day.create(
    [{ ...newDay, travelPlanId: travelPlan[0]._id }],
    { session }
  );
  await Place.create([{ ...newPlace, dayId: day[0]._id }], { session });
});
```

This ERD provides a comprehensive view of the travel planner system's data architecture, supporting complex travel planning workflows with proper scalability and data integrity.
