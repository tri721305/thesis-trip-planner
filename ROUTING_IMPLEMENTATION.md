# OpenStreetMap Routing Implementation

## Overview

This document describes the implementation of OpenStreetMap routing functionality in the PlannerForm component to calculate distances and routes between consecutive places within each day.

## Features Implemented

### 1. New State Management

- `routingData`: Stores routing information for each day
- Tracks routes, total distance/duration, calculation status, and errors
- Organized by `dayKey` format: `day-{detailIndex}`

### 2. OpenStreetMap API Integration

- **API Endpoint**: `https://routing.openstreetmap.de/routed-car/route/v1/driving/{coordinates}`
- **Format**: `longitude,latitude;longitude,latitude` for coordinate pairs
- **Response**: Returns distance (meters), duration (seconds), and GeoJSON geometry
- **Headers**: Includes proper User-Agent and Accept headers

### 3. Route Calculation Functions

#### `calculateRoute(coordinates)`

- Takes array of `{lat, lon}` coordinates
- Calls OpenStreetMap routing API
- Returns distance, duration, geometry, and waypoints
- Handles API errors gracefully

#### `calculateDayRoutes(detailIndex)`

- Processes all places in a specific day
- Fetches missing coordinates using `getPlaceById()`
- Calculates routes between consecutive places
- Updates routing state with results

#### `recalculateAllRoutes()`

- Recalculates routes for all days
- Useful for bulk updates

### 4. UI Components

#### Route Information Display

- Shows total distance and duration for each day
- Lists individual route segments
- Displays calculation status and errors
- Auto-refreshes when places are modified

#### Controls

- "Calculate Routes" button for individual days
- "Calculate All Routes" button for bulk calculation
- Loading states and error handling

### 5. Auto-Calculation Triggers

- Automatically calculates routes when places are added
- Recalculates when places are removed
- Debounced to prevent excessive API calls

## Data Flow

```
Place Items → Extract Coordinates → OpenStreetMap API → Route Data → UI Display
     ↓                ↓                    ↓              ↓           ↓
1. Filter places  2. Get lat/lon     3. Calculate    4. Store     5. Show
   by type           from location      routes          results      info
                     or fetch by ID
```

## Usage Examples

### Adding Places to Trigger Routing

```typescript
// When a place is added via PlaceSearch
handlePlaceSelect(place, dayIndex) →
  updateStore() →
  calculateDayRoutes(dayIndex) →
  Display route info
```

### Route Data Structure

```typescript
routingData = {
  "day-0": {
    routes: [
      {
        fromPlace: "Ben Thanh Market",
        toPlace: "War Remnants Museum",
        distance: 2500, // meters
        duration: 600,  // seconds
        geometry: {...}, // GeoJSON
        waypoints: [{lat: 10.772, lon: 106.698}]
      }
    ],
    totalDistance: 2500,
    totalDuration: 600,
    isCalculating: false,
    lastUpdated: Date,
    error: undefined
  }
}
```

### API Response Format

```typescript
{
  "routes": [{
    "distance": 2500.5,
    "duration": 600.2,
    "geometry": {
      "type": "LineString",
      "coordinates": [[106.698, 10.772], [106.699, 10.773]]
    }
  }],
  "waypoints": [
    {"location": [106.698, 10.772]},
    {"location": [106.699, 10.773]}
  ]
}
```

## Error Handling

### Common Scenarios

1. **No coordinates**: Places without location data
2. **API failures**: Network issues or invalid requests
3. **Insufficient places**: Less than 2 places in a day
4. **Rate limiting**: Too many API requests

### Error Display

- User-friendly error messages in UI
- Fallback to manual route entry
- Retry mechanisms for failed requests

## Performance Optimizations

### API Call Management

- Debounced route calculations (1-second delay)
- Prevents excessive API calls during rapid place additions
- Batched coordinate fetching for missing data

### State Management

- Efficient state updates using React.useCallback
- Memoized functions to prevent re-renders
- Selective re-calculation only when needed

### Caching Strategy

- Route data cached by day
- `lastUpdated` timestamp for cache validation
- Intelligent re-calculation triggers

## Integration Points

### With Existing Components

- **PlaceSearch**: Triggers route calculation on place selection
- **Map Component**: Can consume route geometry for visualization
- **Zustand Store**: Routes can be stored globally for other components

### With Database

- Route data can be persisted to planner details
- Coordinates fetched via `getPlaceById()` action
- Integration with existing place management

## Future Enhancements

### Potential Improvements

1. **Multiple Transport Modes**: Walking, cycling, public transport
2. **Route Optimization**: Reorder places for optimal routes
3. **Real-time Traffic**: Include traffic conditions
4. **Route Visualization**: Display routes on map
5. **Alternative Routes**: Show multiple route options
6. **Cost Estimation**: Add fuel/transport cost calculations

### API Alternatives

- Google Maps Directions API
- Mapbox Directions API
- GraphHopper Routing API
- OSRM (Open Source Routing Machine)

## Code Structure

### New Functions Added

- `calculateRoute()` - Core API interaction
- `calculateDayRoutes()` - Day-level route processing
- `recalculateAllRoutes()` - Bulk recalculation
- `formatRouteInfo()` - Display formatting

### State Variables Added

- `routingData` - Main routing state
- Route calculation triggers in existing functions

### UI Components Added

- Route information display section
- Calculation buttons and loading states
- Error handling and status displays

## Configuration

### Environment Variables (Optional)

```env
# For production, consider rate limiting
OPENSTREETMAP_API_KEY=optional
ROUTING_API_BASE_URL=https://routing.openstreetmap.de
```

### API Limits

- OpenStreetMap routing is generally free
- Rate limiting may apply for high-volume usage
- Consider caching for production applications

This implementation provides a robust foundation for route calculation between places in travel itineraries, with room for future enhancements and optimizations.
