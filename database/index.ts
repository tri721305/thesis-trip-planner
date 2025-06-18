// Database Models Index
// This file exports all database models for the Wanderlog-like travel platform

// User and Authentication
export { default as User } from "./user.model";
export { default as Follow } from "./follow.model";

// Travel Planning
export { default as TravelPlan } from "./travel-plan.model";
export { default as Day } from "./day.model";
export { default as Place } from "./place.model";
export { default as Route } from "./route.model";

// Accommodation and Transportation
export { default as Accommodation } from "./accommodation.model";
export { default as Transportation } from "./transportation.model";

// Booking and Reservations
export { default as Booking } from "./booking.model";
export { default as EmailIntegration } from "./email-integration.model";

// Financial Management
export { default as Expense } from "./expense.model";
export { default as ExpenseSplit } from "./expense-split.model";

// Content and Guides
export { default as Guide } from "./guide.model";
export { default as Tag } from "./tag.model";
export { default as Comment } from "./comment.model";

// Social Features
export { default as Review } from "./review.model";
export { default as Photo } from "./photo.model";
export { default as Activity } from "./activity.model";

// Collaboration and Communication
export { default as Collaboration } from "./collaboration.model";
export { default as Notification } from "./notification.model";

// Location and Places
export { default as Location } from "./location.model";

// Utility
export { default as Checklist } from "./checklist.model";

// Type exports for better TypeScript support
export type { IUser } from "./user.model";
export type { IFollow } from "./follow.model";
export type { ITravelPlan } from "./travel-plan.model";
export type { IDay } from "./day.model";
export type { IPlace } from "./place.model";
export type { IRoute } from "./route.model";
export type { IAccommodation } from "./accommodation.model";
export type { ITransportation } from "./transportation.model";
export type { IBooking } from "./booking.model";
export type { IEmailIntegration } from "./email-integration.model";
export type { IExpense } from "./expense.model";
export type { IExpenseSplit } from "./expense-split.model";
export type { IGuide } from "./guide.model";
export type { IReview } from "./review.model";
export type { IPhoto } from "./photo.model";
export type { IActivity } from "./activity.model";
export type { ICollaboration } from "./collaboration.model";
export type { INotification } from "./notification.model";
export type { ILocation } from "./location.model";

// Enum exports for consistency across the application
export { UserRole, AccountType, TravelStyle } from "./user.model";
export { PlanVisibility, PlanStatus, TripType } from "./travel-plan.model";
export { PlaceType, PlaceStatus } from "./place.model";
export {
  TransportationType,
  TransportationStatus,
  SeatClass,
} from "./transportation.model";
export {
  BookingType,
  BookingStatus,
  BookingSource,
  CancellationPolicy,
} from "./booking.model";
export {
  EmailProvider,
  ProcessingStatus,
  EmailType,
  ConfidenceLevel,
} from "./email-integration.model";
export { ExpenseCategory, PaymentMethod, ExpenseStatus } from "./expense.model";
export { SplitMethod, SplitStatus } from "./expense-split.model";
export {
  GuideType,
  GuideStatus,
  DifficultyLevel,
  GuideVisibility,
} from "./guide.model";
export { ReviewType, ReviewStatus } from "./review.model";
export { ActivityType, ActivityStatus } from "./activity.model";
export {
  CollaborationRole,
  CollaborationStatus,
  PermissionLevel,
} from "./collaboration.model";
export {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from "./notification.model";
export {
  LocationType,
  PlaceCategory,
  AccessibilityLevel,
} from "./location.model";
export {
  TransportMode,
  RouteOptimization,
  RouteStatus,
  TrafficCondition,
} from "./route.model";

// Database connection utilities
export { connectToDatabase, disconnectFromDatabase } from "./connection";

// Database validation schemas (if needed)
export * as ValidationSchemas from "./validation-schemas";

// Common database utilities and helpers
export * as DatabaseUtils from "./utils";

/**
 * Database Models Overview:
 *
 * USER MANAGEMENT:
 * - User: Core user profiles with social features, travel preferences, and settings
 * - Follow: User following relationships for social features
 *
 * TRAVEL PLANNING:
 * - TravelPlan: Main travel itineraries with collaboration and sharing features
 * - Day: Daily itinerary items with places, routes, and timing
 * - Place: Points of interest with detailed information and reviews
 * - Route: Cached route calculations with optimization and real-time data
 *
 * BOOKING MANAGEMENT:
 * - Booking: Comprehensive reservation management across all travel services
 * - Accommodation: Hotel and lodging bookings with detailed information
 * - Transportation: Flight, train, bus, and other transport bookings
 * - EmailIntegration: Automated email parsing for booking imports
 *
 * FINANCIAL TRACKING:
 * - Expense: Individual expense tracking with categorization
 * - ExpenseSplit: Bill splitting functionality for group travel
 *
 * CONTENT & GUIDES:
 * - Guide: Comprehensive travel guides with itineraries and collaboration
 * - Tag: Categorization system for content organization
 * - Comment: User comments and discussions
 *
 * SOCIAL FEATURES:
 * - Review: Reviews and ratings for places, guides, and services
 * - Photo: Media management with EXIF data and engagement tracking
 * - Activity: Social activity feed for user interactions
 *
 * COLLABORATION:
 * - Collaboration: Trip collaboration with role-based permissions
 * - Notification: Multi-channel notification system
 *
 * LOCATION DATA:
 * - Location: Comprehensive places database with rich metadata
 *
 * UTILITIES:
 * - Checklist: Task management for travel preparation
 *
 * Key Features Supported:
 * ✅ Collaborative trip planning
 * ✅ Comprehensive booking management
 * ✅ Expense tracking and bill splitting
 * ✅ Travel guide creation and sharing
 * ✅ Social features (following, reviews, photos)
 * ✅ Real-time collaboration
 * ✅ Email integration for booking imports
 * ✅ Route optimization and caching
 * ✅ Multi-currency support
 * ✅ Advanced search and filtering
 * ✅ Notification system
 * ✅ Analytics and engagement tracking
 * ✅ SEO optimization
 * ✅ Content moderation
 * ✅ AI/ML integration support
 */
