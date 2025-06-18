import mongoose, { Document, Schema, Types } from "mongoose";

// Enums for route types and modes
export enum TransportMode {
  DRIVING = "driving",
  WALKING = "walking",
  CYCLING = "cycling",
  TRANSIT = "transit",
  FLIGHT = "flight",
  TRAIN = "train",
  BUS = "bus",
  FERRY = "ferry",
  RIDESHARE = "rideshare",
  TAXI = "taxi",
}

export enum RouteOptimization {
  FASTEST = "fastest",
  SHORTEST = "shortest",
  CHEAPEST = "cheapest",
  MOST_SCENIC = "most_scenic",
  LEAST_TRAFFIC = "least_traffic",
  ECO_FRIENDLY = "eco_friendly",
}

export enum RouteStatus {
  CACHED = "cached",
  CALCULATING = "calculating",
  FAILED = "failed",
  EXPIRED = "expired",
  OPTIMIZED = "optimized",
}

export enum TrafficCondition {
  LIGHT = "light",
  MODERATE = "moderate",
  HEAVY = "heavy",
  SEVERE = "severe",
  UNKNOWN = "unknown",
}

// Interfaces for nested objects
interface Waypoint {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
    placeId?: Types.ObjectId;
    googlePlaceId?: string;
  };
  stopover: boolean;
  arrivalTime?: Date;
  departureTime?: Date;
  visitDuration?: number; // minutes
  order: number;
  notes?: string;
}

interface RouteSegment {
  startLocation: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  endLocation: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  transportMode: TransportMode;
  distance: number; // meters
  duration: number; // seconds
  cost?: {
    amount: number;
    currency: string;
    breakdown?: Record<string, number>;
  };
  instructions: Array<{
    instruction: string;
    distance: number;
    duration: number;
    coordinates?: [number, number];
  }>;
  polyline?: string; // encoded polyline
  trafficCondition?: TrafficCondition;
  alternativeRoutes?: Array<{
    description: string;
    distance: number;
    duration: number;
    polyline?: string;
  }>;
}

interface RouteStatistics {
  totalDistance: number; // meters
  totalDuration: number; // seconds
  totalCost?: {
    amount: number;
    currency: string;
    breakdown?: Record<string, number>;
  };
  carbonFootprint?: {
    amount: number;
    unit: "kg" | "lbs";
    breakdown?: Record<TransportMode, number>;
  };
  averageSpeed?: number; // km/h
  elevationGain?: number; // meters
  difficultyLevel?: "easy" | "moderate" | "hard" | "extreme";
}

interface WeatherCondition {
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  visibility: number;
  condition: string; // sunny, cloudy, rainy, etc.
  warnings?: string[];
}

interface TrafficInfo {
  timestamp: Date;
  overallCondition: TrafficCondition;
  incidents?: Array<{
    type: "accident" | "construction" | "closure" | "congestion";
    description: string;
    location: {
      latitude: number;
      longitude: number;
    };
    severity: "low" | "medium" | "high";
    estimatedClearance?: Date;
  }>;
  alternativeRecommended: boolean;
}

interface OptimizationResult {
  originalOrder: number[];
  optimizedOrder: number[];
  timeSaved: number; // seconds
  distanceSaved: number; // meters
  costSaved?: number;
  optimizationCriteria: RouteOptimization[];
  confidence: number; // 0-100
}

// Main Route interface
export interface IRoute extends Document {
  _id: Types.ObjectId;

  // Basic route information
  name: string;
  description?: string;
  travelPlan?: Types.ObjectId;
  day?: Types.ObjectId;
  user: Types.ObjectId;

  // Route configuration
  transportMode: TransportMode;
  optimization: RouteOptimization;
  status: RouteStatus;

  // Locations and waypoints
  origin: Waypoint;
  destination: Waypoint;
  waypoints: Waypoint[];

  // Route segments and path
  segments: RouteSegment[];
  polyline?: string; // encoded polyline for entire route
  bounds?: {
    northeast: { latitude: number; longitude: number };
    southwest: { latitude: number; longitude: number };
  };

  // Route statistics
  statistics: RouteStatistics;

  // Contextual information
  scheduledDepartureTime?: Date;
  scheduledArrivalTime?: Date;
  timeZone?: string;

  // Real-time data
  currentTraffic?: TrafficInfo;
  weatherConditions?: WeatherCondition[];
  realTimeUpdates?: Array<{
    timestamp: Date;
    updateType: "traffic" | "weather" | "incident" | "delay";
    message: string;
    severity: "info" | "warning" | "critical";
    affectedSegments?: number[]; // segment indices
  }>;

  // Optimization details
  optimizationHistory?: Array<{
    date: Date;
    criteria: RouteOptimization[];
    result: OptimizationResult;
    appliedBy?: Types.ObjectId;
  }>;

  // Alternative routes
  alternatives?: Array<{
    name: string;
    description?: string;
    transportMode: TransportMode;
    segments: RouteSegment[];
    statistics: RouteStatistics;
    confidence: number;
    recommendationReason?: string;
  }>;

  // Cache and performance
  cacheExpiry: Date;
  lastCalculated: Date;
  calculationTime?: number; // milliseconds
  dataSource: string; // google_maps, mapbox, osrm, etc.
  apiVersion?: string;

  // User preferences and customization
  preferences?: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    avoidFerries: boolean;
    preferScenic: boolean;
    maxWalkingDistance?: number; // meters
    accessibilityNeeds?: string[];
  };

  // Sharing and collaboration
  isPublic: boolean;
  sharedWith?: Types.ObjectId[];
  allowModification: boolean;

  // Analytics and usage
  usage?: {
    viewCount: number;
    useCount: number;
    shareCount: number;
    lastUsed?: Date;
    averageRating?: number;
    feedback?: Array<{
      userId: Types.ObjectId;
      rating: number;
      comment?: string;
      date: Date;
    }>;
  };

  // External integrations
  externalRouteId?: string;
  calendarIntegration?: {
    eventId?: string;
    reminderSet: boolean;
    notificationsEnabled: boolean;
  };

  // Error handling
  errors?: Array<{
    timestamp: Date;
    errorType: string;
    message: string;
    segment?: number;
    resolved: boolean;
  }>;

  // Metadata
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId;
}

// Mongoose schema definition
const RouteSchema = new Schema<IRoute>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    travelPlan: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      index: true,
    },
    day: {
      type: Schema.Types.ObjectId,
      ref: "Day",
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    transportMode: {
      type: String,
      enum: Object.values(TransportMode),
      required: true,
      index: true,
    },
    optimization: {
      type: String,
      enum: Object.values(RouteOptimization),
      default: RouteOptimization.FASTEST,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(RouteStatus),
      default: RouteStatus.CACHED,
      index: true,
    },

    origin: {
      location: {
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 },
        name: { type: String, trim: true },
        address: { type: String, trim: true },
        placeId: { type: Schema.Types.ObjectId, ref: "Place" },
        googlePlaceId: String,
      },
      stopover: { type: Boolean, default: false },
      arrivalTime: Date,
      departureTime: Date,
      visitDuration: { type: Number, min: 0 },
      order: { type: Number, required: true, default: 0 },
      notes: { type: String, trim: true },
    },

    destination: {
      location: {
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 },
        name: { type: String, trim: true },
        address: { type: String, trim: true },
        placeId: { type: Schema.Types.ObjectId, ref: "Place" },
        googlePlaceId: String,
      },
      stopover: { type: Boolean, default: false },
      arrivalTime: Date,
      departureTime: Date,
      visitDuration: { type: Number, min: 0 },
      order: { type: Number, required: true, default: 999 },
      notes: { type: String, trim: true },
    },

    waypoints: [
      {
        location: {
          latitude: { type: Number, required: true, min: -90, max: 90 },
          longitude: { type: Number, required: true, min: -180, max: 180 },
          name: { type: String, trim: true },
          address: { type: String, trim: true },
          placeId: { type: Schema.Types.ObjectId, ref: "Place" },
          googlePlaceId: String,
        },
        stopover: { type: Boolean, default: true },
        arrivalTime: Date,
        departureTime: Date,
        visitDuration: { type: Number, min: 0 },
        order: { type: Number, required: true },
        notes: { type: String, trim: true },
      },
    ],

    segments: [
      {
        startLocation: {
          latitude: { type: Number, required: true, min: -90, max: 90 },
          longitude: { type: Number, required: true, min: -180, max: 180 },
          name: { type: String, trim: true },
          address: { type: String, trim: true },
        },
        endLocation: {
          latitude: { type: Number, required: true, min: -90, max: 90 },
          longitude: { type: Number, required: true, min: -180, max: 180 },
          name: { type: String, trim: true },
          address: { type: String, trim: true },
        },
        transportMode: {
          type: String,
          enum: Object.values(TransportMode),
          required: true,
        },
        distance: { type: Number, required: true, min: 0 },
        duration: { type: Number, required: true, min: 0 },
        cost: {
          amount: { type: Number, min: 0 },
          currency: { type: String, length: 3 },
          breakdown: Schema.Types.Mixed,
        },
        instructions: [
          {
            instruction: { type: String, required: true, trim: true },
            distance: { type: Number, required: true, min: 0 },
            duration: { type: Number, required: true, min: 0 },
            coordinates: [Number],
          },
        ],
        polyline: String,
        trafficCondition: {
          type: String,
          enum: Object.values(TrafficCondition),
        },
        alternativeRoutes: [
          {
            description: { type: String, trim: true },
            distance: { type: Number, min: 0 },
            duration: { type: Number, min: 0 },
            polyline: String,
          },
        ],
      },
    ],

    polyline: String,
    bounds: {
      northeast: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
      },
      southwest: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
      },
    },

    statistics: {
      totalDistance: { type: Number, required: true, min: 0 },
      totalDuration: { type: Number, required: true, min: 0 },
      totalCost: {
        amount: { type: Number, min: 0 },
        currency: { type: String, length: 3 },
        breakdown: Schema.Types.Mixed,
      },
      carbonFootprint: {
        amount: { type: Number, min: 0 },
        unit: { type: String, enum: ["kg", "lbs"], default: "kg" },
        breakdown: Schema.Types.Mixed,
      },
      averageSpeed: { type: Number, min: 0 },
      elevationGain: { type: Number, min: 0 },
      difficultyLevel: {
        type: String,
        enum: ["easy", "moderate", "hard", "extreme"],
      },
    },

    scheduledDepartureTime: {
      type: Date,
      index: true,
    },
    scheduledArrivalTime: {
      type: Date,
      index: true,
    },
    timeZone: String,

    currentTraffic: {
      timestamp: { type: Date, default: Date.now },
      overallCondition: {
        type: String,
        enum: Object.values(TrafficCondition),
      },
      incidents: [
        {
          type: {
            type: String,
            enum: ["accident", "construction", "closure", "congestion"],
          },
          description: { type: String, trim: true },
          location: {
            latitude: { type: Number, min: -90, max: 90 },
            longitude: { type: Number, min: -180, max: 180 },
          },
          severity: { type: String, enum: ["low", "medium", "high"] },
          estimatedClearance: Date,
        },
      ],
      alternativeRecommended: { type: Boolean, default: false },
    },

    weatherConditions: [
      {
        location: {
          latitude: { type: Number, min: -90, max: 90 },
          longitude: { type: Number, min: -180, max: 180 },
        },
        timestamp: { type: Date, required: true },
        temperature: Number,
        humidity: { type: Number, min: 0, max: 100 },
        windSpeed: { type: Number, min: 0 },
        precipitation: { type: Number, min: 0 },
        visibility: { type: Number, min: 0 },
        condition: { type: String, trim: true },
        warnings: [{ type: String, trim: true }],
      },
    ],

    realTimeUpdates: [
      {
        timestamp: { type: Date, required: true },
        updateType: {
          type: String,
          enum: ["traffic", "weather", "incident", "delay"],
          required: true,
        },
        message: { type: String, required: true, trim: true },
        severity: {
          type: String,
          enum: ["info", "warning", "critical"],
          default: "info",
        },
        affectedSegments: [{ type: Number, min: 0 }],
      },
    ],

    optimizationHistory: [
      {
        date: { type: Date, required: true },
        criteria: [
          {
            type: String,
            enum: Object.values(RouteOptimization),
          },
        ],
        result: {
          originalOrder: [{ type: Number, min: 0 }],
          optimizedOrder: [{ type: Number, min: 0 }],
          timeSaved: { type: Number, min: 0 },
          distanceSaved: { type: Number, min: 0 },
          costSaved: { type: Number, min: 0 },
          optimizationCriteria: [
            {
              type: String,
              enum: Object.values(RouteOptimization),
            },
          ],
          confidence: { type: Number, min: 0, max: 100 },
        },
        appliedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    alternatives: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        transportMode: {
          type: String,
          enum: Object.values(TransportMode),
        },
        segments: [Schema.Types.Mixed], // Reuse segment structure
        statistics: Schema.Types.Mixed, // Reuse statistics structure
        confidence: { type: Number, min: 0, max: 100 },
        recommendationReason: { type: String, trim: true },
      },
    ],

    cacheExpiry: {
      type: Date,
      required: true,
      index: true,
    },
    lastCalculated: {
      type: Date,
      required: true,
      default: Date.now,
    },
    calculationTime: { type: Number, min: 0 },
    dataSource: {
      type: String,
      required: true,
      trim: true,
    },
    apiVersion: String,

    preferences: {
      avoidTolls: { type: Boolean, default: false },
      avoidHighways: { type: Boolean, default: false },
      avoidFerries: { type: Boolean, default: false },
      preferScenic: { type: Boolean, default: false },
      maxWalkingDistance: { type: Number, min: 0 },
      accessibilityNeeds: [{ type: String, trim: true }],
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    allowModification: {
      type: Boolean,
      default: false,
    },

    usage: {
      viewCount: { type: Number, default: 0, min: 0 },
      useCount: { type: Number, default: 0, min: 0 },
      shareCount: { type: Number, default: 0, min: 0 },
      lastUsed: Date,
      averageRating: { type: Number, min: 0, max: 5 },
      feedback: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String, trim: true },
          date: { type: Date, default: Date.now },
        },
      ],
    },

    externalRouteId: {
      type: String,
      trim: true,
      index: true,
    },
    calendarIntegration: {
      eventId: String,
      reminderSet: { type: Boolean, default: false },
      notificationsEnabled: { type: Boolean, default: true },
    },

    errors: [
      {
        timestamp: { type: Date, required: true },
        errorType: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        segment: { type: Number, min: 0 },
        resolved: { type: Boolean, default: false },
      },
    ],

    tags: [{ type: String, trim: true }],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for optimal query performance
RouteSchema.index({ user: 1, status: 1 });
RouteSchema.index({ travelPlan: 1, day: 1 });
RouteSchema.index({ transportMode: 1, optimization: 1 });
RouteSchema.index({ cacheExpiry: 1 }); // TTL-like behavior
RouteSchema.index({ scheduledDepartureTime: 1 });
RouteSchema.index({ lastCalculated: -1 });
RouteSchema.index({ dataSource: 1, status: 1 });

// Compound indexes for common queries
RouteSchema.index({ user: 1, transportMode: 1, status: 1 });
RouteSchema.index({
  travelPlan: 1,
  transportMode: 1,
  scheduledDepartureTime: 1,
});
RouteSchema.index({ user: 1, isPublic: 1, "usage.averageRating": -1 });

// Geospatial indexes for location-based queries
RouteSchema.index({
  "origin.location.latitude": 1,
  "origin.location.longitude": 1,
});
RouteSchema.index({
  "destination.location.latitude": 1,
  "destination.location.longitude": 1,
});

// Text search index
RouteSchema.index({
  name: "text",
  description: "text",
  "origin.location.name": "text",
  "destination.location.name": "text",
});

// Pre-save middleware for data validation and auto-calculation
RouteSchema.pre("save", function (next) {
  // Set cache expiry if not provided (default 1 hour for most routes)
  if (!this.cacheExpiry) {
    const expiryTime =
      this.transportMode === TransportMode.DRIVING
        ? 60 * 60 * 1000 // 1 hour for driving routes
        : 24 * 60 * 60 * 1000; // 24 hours for other routes
    this.cacheExpiry = new Date(Date.now() + expiryTime);
  }

  // Calculate total statistics from segments
  if (this.segments && this.segments.length > 0) {
    this.statistics.totalDistance = this.segments.reduce(
      (total, segment) => total + segment.distance,
      0
    );
    this.statistics.totalDuration = this.segments.reduce(
      (total, segment) => total + segment.duration,
      0
    );

    // Calculate average speed
    if (this.statistics.totalDuration > 0) {
      this.statistics.averageSpeed =
        this.statistics.totalDistance /
        1000 /
        (this.statistics.totalDuration / 3600);
    }
  }

  // Sort waypoints by order
  if (this.waypoints && this.waypoints.length > 0) {
    this.waypoints.sort((a, b) => a.order - b.order);
  }

  // Set lastModifiedBy
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // This would be set by the calling code
  }

  next();
});

// Virtual for formatted duration
RouteSchema.virtual("formattedDuration").get(function () {
  const totalSeconds = this.statistics.totalDuration;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
});

// Virtual for formatted distance
RouteSchema.virtual("formattedDistance").get(function () {
  const totalMeters = this.statistics.totalDistance;

  if (totalMeters >= 1000) {
    return `${(totalMeters / 1000).toFixed(1)} km`;
  } else {
    return `${totalMeters} m`;
  }
});

// Virtual for cache status
RouteSchema.virtual("isExpired").get(function () {
  return new Date() > this.cacheExpiry;
});

// Virtual for total waypoints count
RouteSchema.virtual("totalWaypoints").get(function () {
  return (this.waypoints ? this.waypoints.length : 0) + 2; // +2 for origin and destination
});

// Static methods for common queries
RouteSchema.statics.findByTravelPlan = function (
  travelPlanId: Types.ObjectId,
  options: any = {}
) {
  return this.find({ travelPlan: travelPlanId, ...options })
    .sort({ scheduledDepartureTime: 1 })
    .populate("travelPlan day")
    .exec();
};

RouteSchema.statics.findExpired = function (batchSize: number = 100) {
  return this.find({
    cacheExpiry: { $lt: new Date() },
    status: { $ne: RouteStatus.CALCULATING },
  })
    .limit(batchSize)
    .sort({ cacheExpiry: 1 })
    .exec();
};

RouteSchema.statics.findSimilarRoutes = function (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  transportMode: TransportMode,
  radiusKm: number = 1
) {
  const radiusDegrees = radiusKm / 111.32; // Approximate conversion

  return this.find({
    transportMode,
    status: RouteStatus.CACHED,
    cacheExpiry: { $gt: new Date() },
    "origin.location.latitude": {
      $gte: originLat - radiusDegrees,
      $lte: originLat + radiusDegrees,
    },
    "origin.location.longitude": {
      $gte: originLng - radiusDegrees,
      $lte: originLng + radiusDegrees,
    },
    "destination.location.latitude": {
      $gte: destLat - radiusDegrees,
      $lte: destLat + radiusDegrees,
    },
    "destination.location.longitude": {
      $gte: destLng - radiusDegrees,
      $lte: destLng + radiusDegrees,
    },
  })
    .sort({ lastCalculated: -1 })
    .limit(5)
    .exec();
};

RouteSchema.statics.findPopularRoutes = function (
  transportMode?: TransportMode,
  limit: number = 20
) {
  const query: any = { isPublic: true };
  if (transportMode) query.transportMode = transportMode;

  return this.find(query)
    .sort({ "usage.useCount": -1, "usage.averageRating": -1 })
    .limit(limit)
    .populate("createdBy", "name avatar")
    .exec();
};

// Instance methods
RouteSchema.methods.isExpired = function (): boolean {
  return new Date() > this.cacheExpiry;
};

RouteSchema.methods.needsRecalculation = function (): boolean {
  return this.isExpired() || this.status === RouteStatus.FAILED;
};

RouteSchema.methods.addRealTimeUpdate = function (
  updateType: string,
  message: string,
  severity: string = "info",
  affectedSegments?: number[]
) {
  this.realTimeUpdates = this.realTimeUpdates || [];
  this.realTimeUpdates.push({
    timestamp: new Date(),
    updateType: updateType as any,
    message,
    severity: severity as any,
    affectedSegments,
  });

  // Keep only last 20 updates
  if (this.realTimeUpdates.length > 20) {
    this.realTimeUpdates = this.realTimeUpdates.slice(-20);
  }

  return this.save();
};

RouteSchema.methods.markAsUsed = function (userId?: Types.ObjectId) {
  this.usage = this.usage || {
    viewCount: 0,
    useCount: 0,
    shareCount: 0,
  };

  this.usage.useCount += 1;
  this.usage.lastUsed = new Date();

  return this.save();
};

RouteSchema.methods.addFeedback = function (
  userId: Types.ObjectId,
  rating: number,
  comment?: string
) {
  this.usage = this.usage || {
    viewCount: 0,
    useCount: 0,
    shareCount: 0,
    feedback: [],
  };

  this.usage.feedback = this.usage.feedback || [];

  // Remove existing feedback from this user
  this.usage.feedback = this.usage.feedback.filter(
    (f) => !f.userId.equals(userId)
  );

  // Add new feedback
  this.usage.feedback.push({
    userId,
    rating,
    comment,
    date: new Date(),
  });

  // Recalculate average rating
  const totalRating = this.usage.feedback.reduce((sum, f) => sum + f.rating, 0);
  this.usage.averageRating = totalRating / this.usage.feedback.length;

  return this.save();
};

RouteSchema.methods.calculateCarbonFootprint = function (): number {
  let totalFootprint = 0;

  for (const segment of this.segments) {
    const distanceKm = segment.distance / 1000;

    // Carbon emission factors (kg CO2 per km)
    const emissionFactors: Record<TransportMode, number> = {
      [TransportMode.DRIVING]: 0.2, // Average car
      [TransportMode.WALKING]: 0,
      [TransportMode.CYCLING]: 0,
      [TransportMode.TRANSIT]: 0.05, // Public transport
      [TransportMode.FLIGHT]: 0.25, // Domestic flight
      [TransportMode.TRAIN]: 0.03,
      [TransportMode.BUS]: 0.08,
      [TransportMode.FERRY]: 0.15,
      [TransportMode.RIDESHARE]: 0.15,
      [TransportMode.TAXI]: 0.2,
    };

    const factor = emissionFactors[segment.transportMode] || 0.1;
    totalFootprint += distanceKm * factor;
  }

  return Math.round(totalFootprint * 100) / 100; // Round to 2 decimal places
};

RouteSchema.methods.optimizeWaypoints = function (
  criteria: RouteOptimization[] = [RouteOptimization.FASTEST]
) {
  // This would integrate with external route optimization APIs
  // For now, we'll just record the optimization attempt

  const originalOrder = this.waypoints.map((w) => w.order);

  this.optimizationHistory = this.optimizationHistory || [];
  this.optimizationHistory.push({
    date: new Date(),
    criteria,
    result: {
      originalOrder,
      optimizedOrder: originalOrder, // Would be calculated by optimization algorithm
      timeSaved: 0,
      distanceSaved: 0,
      optimizationCriteria: criteria,
      confidence: 85,
    },
  });

  return this.save();
};

// Export the model
const Route = mongoose.model<IRoute>("Route", RouteSchema);
export default Route;
