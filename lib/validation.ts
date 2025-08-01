import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Please provide a valid email address",
  }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, {
      message: "Password must not exceed 100 characters",
    }),
});

// export const SignUpSchema = z.object({
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters long." })
//     .max(30, { message: "Username cannot exceed 30 characters." })
//     .regex(/^[a-zA-Z0-9_]+$/, {
//       message: "Username can only contain letters, numbers, and underscores.",
//     }),

//   name: z
//     .string()
//     .min(1, { message: "Name is required." })
//     .max(50, { message: "Name cannot exceed 50 characters." })
//     .regex(/^[a-zA-Z\s]+$/, {
//       message: "Name can only contain letters and spaces.",
//     }),

//   email: z
//     .string()
//     .min(1, { message: "Email is required." })
//     .email({ message: "Please provide a valid email address." }),

//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters long." })
//     .max(100, { message: "Password cannot exceed 100 characters." })
//     .regex(/[A-Z]/, {
//       message: "Password must contain at least one uppercase letter.",
//     })
//     .regex(/[a-z]/, {
//       message: "Password must contain at least one lowercase letter.",
//     })
//     .regex(/[0-9]/, { message: "Password must contain at least one number." })
//     .regex(/[^a-zA-Z0-9]/, {
//       message: "Password must contain at least one special character.",
//     }),
//   // phone: z
//   //   .string()
//   //   .min(1, { message: "Phone number is required." })
//   //   .regex(/^\d{9,10}$/, {
//   //     message: "Phone number must be 9-10 digits long.",
//   //   }),
// });

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),

  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});
export const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long.",
  }),
  email: z.string().email({
    message: "Please provide a valid email address.",
  }),
  bio: z.string().optional(),
  image: z
    .string()
    .url({
      message: "Please provide a valid image URL.",
    })
    .optional(),
  location: z.string().optional(),
  portfolio: z
    .string()
    .url({
      message: "Please provide a valid portfolio URL.",
    })
    .optional(),
  reputation: z.number().optional(),
});
export const AccountSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  image: z.string().url({ message: "Image must be a valid URL." }).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
});
export const SignInWithOAuthSchema = z.object({
  provider: z.enum(["google", "github", "facebook"]),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
  user: z.object({
    name: z.string().min(1, { message: "Name is required." }),
    username: z.string().min(3, {
      message: "Username must be at least 3 characters long.",
    }),
    email: z.string().email({
      message: "Please provide a valid email address.",
    }),
    image: z
      .string()
      .url({
        message: "Please provide a valid image URL.",
      })
      .optional(),
  }),
});

export const GuideSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),

  content: z.string().min(1, { message: "Content is required." }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag is required." })
        .max(30, { message: "Tag cannot exceed 30 characters." })
    )
    .min(1, { message: "At least one tag is required." })
    .max(3, { message: "Cannot add more than 3 tags." }),
  images1: z.array(z.any()).optional().default([]),
});

export const HotelSchema = z.object({
  name: z.string().min(5, { message: "Name is required." }).max(100, {
    message: "Name cannot exceed 100 characters.",
  }),
  address: z.string(),
  checkin: z.string(),
  checkout: z.string(),
  confirmation: z.string(),
  note: z.string(),
  cost: z.object({
    type: z.string(),
    number: z.string(),
  }),
});

export const ItemGuideSchema = z.object({
  type: z.enum(["route", "list"]),
  title: z.string().min(1, { message: "Title is required." }),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      type: z.enum(["place", "note", "checklist"]),
      data: z.object({
        info: z.object({}) || z.string() || z.array(z.string()),
      }),
    })
  ),
});

export const NewItemGuideSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  type: z.enum(["route", "list"]),
  index: z.number().int().nonnegative().optional(),
  data: z.array(
    z.object({
      type: z.enum(["place", "note", "checklist"]),
      content: z.string().optional(),
      items: z.array(z.string()).optional(),
      completed: z.array(z.boolean()).optional(),
      name: z.string().optional(),
      address: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      phone: z.string().optional(),
      images: z.array(z.string()).optional(),
      website: z.string().url().optional(),
      imageKeys: z.array(z.string()).optional(),
      location: z
        .object({
          type: z.literal("Point"),
          coordinates: z.array(z.number()).length(2, {
            message: "Coordinates must be an array of two numbers.",
          }),
        })
        .optional(),
      note: z.string().optional(),
    })
  ),
});

export const FlightSchema = z.object({
  airline: z.string().min(1, { message: "Airline is required." }),
  flightNumber: z.string().min(1, { message: "Flight number is required." }),
  departure: z.object({
    airport: z.string().min(1, { message: "Departure airport is required." }),
    city: z.string().min(1, { message: "Departure city is required." }),
    date: z.string().min(1, { message: "Departure date is required." }),
    time: z.string().min(1, { message: "Departure time is required." }),
  }),
  arrival: z.object({
    airport: z.string().min(1, { message: "Arrival airport is required." }),
    city: z.string().min(1, { message: "Arrival city is required." }),
    date: z.string().min(1, { message: "Arrival date is required." }),
    time: z.string().min(1, { message: "Arrival time is required." }),
  }),
  seat: z.string().optional(),
  confirmation: z
    .string()
    .min(1, { message: "Confirmation code is required." }),
  note: z.string().optional(),
  cost: z.object({
    type: z.string(),
    number: z.string(),
  }),
});

export const ActivitySchema = z.object({
  name: z.string().min(1, { message: "Activity name is required." }).max(100, {
    message: "Name cannot exceed 100 characters.",
  }),
  location: z.string().min(1, { message: "Location is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  time: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  confirmation: z.string().optional(),
  contact: z.string().optional(),
  note: z.string().optional(),
  cost: z.object({
    type: z.string(),
    number: z.string(),
  }),
});

export const RestaurantSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Restaurant name is required." })
    .max(100, {
      message: "Name cannot exceed 100 characters.",
    }),
  address: z.string().min(1, { message: "Address is required." }),
  cuisine: z.string().optional(),
  date: z.string().min(1, { message: "Reservation date is required." }),
  time: z.string().min(1, { message: "Reservation time is required." }),
  guests: z.string().optional(),
  confirmation: z.string().optional(),
  contact: z.string().optional(),
  note: z.string().optional(),
  cost: z.object({
    type: z.string(),
    number: z.string(),
  }),
});

export const TransportSchema = z.object({
  type: z.enum(["car_rental", "train", "bus", "taxi", "uber", "other"], {
    message: "Please select a transport type.",
  }),
  provider: z.string().min(1, { message: "Provider is required." }),
  pickupLocation: z
    .string()
    .min(1, { message: "Pickup location is required." }),
  dropoffLocation: z.string().optional(),
  pickupDate: z.string().min(1, { message: "Pickup date is required." }),
  pickupTime: z.string().min(1, { message: "Pickup time is required." }),
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  confirmation: z.string().optional(),
  vehicleDetails: z.string().optional(),
  note: z.string().optional(),
  cost: z.object({
    type: z.string(),
    number: z.string(),
  }),
});

export const AttractionSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Attraction name is required." })
    .max(100, {
      message: "Name cannot exceed 100 characters.",
    }),
  address: z.string().min(1, { message: "Address is required." }),
  category: z.string().optional(),
  visitDate: z.string().optional(),
  visitTime: z.string().optional(),
  duration: z.string().optional(),
  ticketInfo: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  cost: z.object({
    type: z.string(),
    number: z.string(),
  }),
});

export const GetWardByProvinceIdSchema = z.object({
  provinceId: z.string().min(1, { message: "Province ID is required." }),
});

export const GetWardAndPolygonByIdSchema = z.object({
  wardId: z.string().min(1, { message: "Ward ID is required." }),
});

export const GetWardByNameSchema = z.object({
  wardName: z.string().min(1, { message: "Ward name is required." }),
});

export const createBlogSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()),
  lodging: z.array(z.object({})),
});

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});

export const NewGuideSchema = z.object({
  title: z.string().min(5, { message: "Title is required." }).max(100, {
    message: "Title cannot exceed 100 characters.",
  }),
  note: z.string().min(1, { message: "Note is required." }),
  details: z.array(
    z.object({
      name: z.string().min(1, { message: "Name is required." }),
      type: z.enum(["route", "list"]),
      index: z.number().int().nonnegative(),
      data: z.array(
        z.object({
          type: z.enum(["place", "note", "checklist"]),
          content: z.string().optional(),
          items: z.array(z.string()).optional(),
          completed: z.array(z.boolean()).optional(),
          name: z.string().optional(),
          address: z.string().optional(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          phone: z.string().optional(),
          images: z.array(z.string()).optional(),
          website: z.string().url().optional(),
          location: z
            .object({
              type: z.literal("Point"),
              coordinates: z.array(z.number()).length(2, {
                message: "Coordinates must be an array of two numbers.",
              }),
            })
            .optional(),
          note: z.string().optional(),
        })
      ),
    })
  ),
  generalTips: z.string().optional(),
  lodging: z.array(
    z.object({
      name: z.string().min(1, { message: "Lodging name is required." }),
      address: z.string().min(1, { message: "Address is required." }),
      checkIn: z.string().min(1, { message: "Check-in date is required." }),
      checkOut: z.string().min(1, { message: "Check-out date is required." }),
      confirmation: z.string().optional(),
      notes: z.string().optional(),
      cost: z.object({
        type: z.string(),
        value: z.number().positive(),
      }),
    })
  ),
});
