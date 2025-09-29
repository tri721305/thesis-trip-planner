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

export const GetUserByEmailSchema = z.object({
  email: z.string().min(1, { message: "Email is required." }).email({
    message: "Please provide a valid email address.",
  }),
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

export const PaginatedSearchParamsHotelSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  filter: z.object({}).optional(),
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
          imageKeys: z.array(z.string()).optional(),

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

export const SearchHotelSChema = z.object({
  location: z.string().min(1, { message: "Location is required." }),
  checkInDate: z.string().min(1, { message: "Check-in date is required." }),
  checkOutDate: z.string().min(1, { message: "Check-out date is required." }),
  guests: z.number().default(1).optional(),
  rooms: z.number().int().positive().default(1).optional(),
});

export const CreatePlannerSchema = z.object({
  plannerName: z.string().min(1, { message: "Planner name is required." }),
});

export const PlannerSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(200, { message: "Title cannot exceed 200 characters." })
    .optional(),

  // image: z.string().url({ message: "Image must be a valid URL." }).optional(),
  image: z.string().optional().or(z.literal("")),
  note: z.string().optional(),
  type: z.string().optional(),
  author: z.string().optional(), // ObjectId as string

  tripmates: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Tripmate name is required." })
          .optional(),
        email: z
          .string()
          .email({ message: "Invalid email format." })
          .optional(),
        image: z.string().optional().or(z.literal("")),
        userId: z.string().optional(), // ObjectId as string
      })
    )
    .optional(),

  state: z
    .enum(["planning", "ongoing", "completed", "cancelled"])
    .default("planning")
    .optional(),

  startDate: z
    .string()
    .datetime({ message: "Start date must be a valid ISO date." })
    .or(z.date())
    .optional(),

  endDate: z
    .string()
    .datetime({ message: "End date must be a valid ISO date." })
    .or(z.date())
    .optional(),
  destination: z
    .object({
      name: z
        .string()
        .min(1, { message: "Destination name is required." })
        .max(200, {
          message: "Destination name cannot exceed 200 characters.",
        }),

      coordinates: z
        .array(z.number())
        .length(2, { message: "Coordinates must be [longitude, latitude]." })
        .refine(
          (coords) =>
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          { message: "Invalid coordinates range." }
        ),

      type: z.enum(["province", "ward"], {
        message: "Destination type must be 'province' or 'ward'.",
      }),

      provinceId: z.string().optional(),

      wardId: z.string().optional(),
    })
    .refine(
      (data) => {
        // provinceId is required when type is "province"
        if (data.type === "province" && !data.provinceId) {
          return false;
        }
        // wardId is required when type is "ward"
        if (data.type === "ward" && !data.wardId) {
          return false;
        }
        return true;
      },
      {
        message:
          "provinceId is required for province type, wardId is required for ward type",
        path: ["provinceId", "wardId"],
      }
    ),

  generalTips: z.string().optional(),

  lodging: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Lodging name is required." })
          .optional(),
        address: z
          .string()
          .min(1, { message: "Address is required." })
          .optional(),
        checkIn: z
          .string()
          .datetime({ message: "Check-in must be a valid ISO date." })
          .or(z.date())
          .optional(),
        checkOut: z
          .string()
          .datetime({ message: "Check-out must be a valid ISO date." })
          .or(z.date())
          .optional(),
        confirmation: z.string().optional(),
        notes: z.string().optional(),
        cost: z
          .object({
            type: z.enum(["VND", "USD", "EUR"]),
            value: z.number().positive({ message: "Cost must be positive." }),
            paidBy: z.string().optional(),
            description: z
              .string()
              .max(500, {
                message: "Cost description cannot exceed 500 characters.",
              })
              .optional(),
          })
          .optional(),
      })
    )
    .optional(),

  details: z
    .array(
      z.object({
        type: z.enum(["route", "list"]),
        name: z.string().min(1, { message: "Detail name is required." }),
        index: z.number().int().positive(),
        data: z.array(
          z.discriminatedUnion("type", [
            // Note type
            z.object({
              type: z.literal("note"),
              content: z
                .string()
                .min(1, { message: "Note content is required." }),
            }),
            // Checklist type
            z.object({
              type: z.literal("checklist"),
              items: z.array(z.string()).min(1, {
                message: "At least one checklist item is required.",
              }),
              completed: z.array(z.boolean()).optional(),
            }),
            // Place type
            z.object({
              type: z.literal("place"),
              name: z.string().optional(),
              address: z.string().optional(),
              description: z.string().optional(),
              tags: z.array(z.string()).optional(),
              phone: z.string().optional(),
              images: z
                .array(
                  z.string().url({ message: "Image must be a valid URL." })
                )
                .optional(),
              imageKeys: z.array(z.string()).optional(),

              website: z
                .string()
                .url({ message: "Website must be a valid URL." })
                .optional(),
              location: z
                .object({
                  type: z.literal("Point"),
                  coordinates: z
                    .array(z.number())
                    .length(2, {
                      message: "Coordinates must be [longitude, latitude].",
                    })
                    .refine(
                      (coords) =>
                        coords[0] >= -180 &&
                        coords[0] <= 180 &&
                        coords[1] >= -90 &&
                        coords[1] <= 90,
                      { message: "Invalid coordinates range." }
                    ),
                })
                .optional(),
              note: z.string().optional(),
              timeStart: z
                .string()
                .regex(
                  /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i,
                  {
                    message:
                      "Invalid time format. Use formats like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
                  }
                )
                .optional(),
              timeEnd: z
                .string()
                .regex(
                  /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i,
                  {
                    message:
                      "Invalid time format. Use formats like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
                  }
                )
                .optional(),
              cost: z
                .object({
                  type: z.enum(["VND", "USD", "EUR"]),
                  value: z
                    .number()
                    .min(0, { message: "Cost must be non-negative." }),
                  paidBy: z.string().optional(),
                  description: z
                    .string()
                    .max(500, {
                      message: "Cost description cannot exceed 500 characters.",
                    })
                    .optional(),
                  splitBetween: z.array(z.object({})).optional(),
                })
                .optional(),
            }),
          ])
        ),
      })
    )
    .optional(),
  timeStart: z
    .string()
    .regex(
      /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i,
      {
        message:
          "Invalid time format. Use formats like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
      }
    )
    .optional(),
});
// Removed date validations - allow any start/end dates and past dates

// Schema for creating a new travel planner with basic info
export const CreateTravelPlannerSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(200, { message: "Title cannot exceed 200 characters." }),

  destination: z
    .object({
      name: z
        .string()
        .min(1, { message: "Destination name is required." })
        .max(200, {
          message: "Destination name cannot exceed 200 characters.",
        }),

      coordinates: z
        .array(z.number())
        .length(2, { message: "Coordinates must be [longitude, latitude]." })
        .refine(
          (coords) =>
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          { message: "Invalid coordinates range." }
        ),

      type: z.enum(["province", "ward"], {
        message: "Destination type must be 'province' or 'ward'.",
      }),

      provinceId: z.string().optional(),

      wardId: z.string().optional(),
    })
    .refine(
      (data) => {
        // provinceId is required when type is "province"
        if (data.type === "province" && !data.provinceId) {
          return false;
        }
        // wardId is required when type is "ward"
        if (data.type === "ward" && !data.wardId) {
          return false;
        }
        return true;
      },
      {
        message:
          "provinceId is required for province type, wardId is required for ward type",
        path: ["provinceId", "wardId"],
      }
    ),

  startDate: z
    .string()
    .datetime({ message: "Start date must be a valid ISO date." })
    .or(z.date()),

  endDate: z
    .string()
    .datetime({ message: "End date must be a valid ISO date." })
    .or(z.date()),

  type: z.enum(["public", "private", "friend"], {
    message: "Plan type must be 'public', 'private', or 'friend'.",
  }),
  details: z.array(z.object({})).optional(),
});
// Removed date validation - allow any start/end dates

// Schema for updating travel planner with all information
export const UpdateTravelPlannerSchema = z.object({
  plannerId: z.string().min(1, { message: "Planner ID is required." }),

  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(200, { message: "Title cannot exceed 200 characters." })
    .optional(),

  image: z.string().optional().or(z.literal("")),

  note: z.string().optional(),

  generalTips: z.string().optional(),

  destination: z
    .object({
      name: z
        .string()
        .min(1, { message: "Destination name is required." })
        .max(200, {
          message: "Destination name cannot exceed 200 characters.",
        }),

      coordinates: z
        .array(z.number())
        .length(2, { message: "Coordinates must be [longitude, latitude]." })
        .refine(
          (coords) =>
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          { message: "Invalid coordinates range." }
        ),

      type: z.enum(["province", "ward"], {
        message: "Destination type must be 'province' or 'ward'.",
      }),

      provinceId: z.string().optional(),
      wardId: z.string().optional(),
    })
    .optional(),

  startDate: z.union([z.string(), z.date()]).optional(),

  endDate: z.union([z.string(), z.date()]).optional(),

  type: z
    .enum(["public", "private", "friend"], {
      message: "Plan type must be 'public', 'private', or 'friend'.",
    })
    .optional(),

  state: z
    .enum(["planning", "ongoing", "completed", "cancelled"], {
      message: "State must be one of the valid states.",
    })
    .optional(),

  tripmates: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Name is required." }),
        email: z
          .string()
          .email({ message: "Invalid email format." })
          .optional(),
        image: z.string().optional().or(z.literal("")),
        userId: z.string().optional(),
      })
    )
    .optional(),

  lodging: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Lodging name is required." }),
        address: z.string().optional(),
        checkIn: z.date().or(z.string()).optional(),
        checkOut: z.date().or(z.string()).optional(),
        confirmation: z.string().optional(),
        notes: z.string().optional(),
        cost: z
          .object({
            type: z.string(),
            value: z.number().min(0),
          })
          .optional(),
      })
    )
    .optional(),

  details: z
    .array(
      z.object({
        type: z.enum(["route", "list"]),
        name: z.string().min(1, { message: "Detail name is required." }),
        index: z.number().int().min(1),
        data: z.array(
          z.object({
            type: z.enum(["place", "note", "checklist"]),
            // Note fields
            content: z.string().optional(),
            // Checklist fields
            items: z.array(z.string()).optional(),
            completed: z.array(z.boolean()).optional(),
            // Place fields - Basic info
            id: z.string().optional(),
            name: z.string().optional(),
            address: z.string().optional(),
            description: z.string().optional(),
            // Place fields - Categories and tags
            categories: z.array(z.string()).optional(),
            tags: z.array(z.string()).optional(),
            // Place fields - Contact info
            phone: z.string().optional(),
            website: z.string().optional(),
            // Place fields - Images
            images: z.array(z.string()).optional(),
            imageKeys: z.array(z.string()).optional(),
            // Place fields - Ratings
            rating: z.number().min(0).max(5).optional(),
            numRatings: z.number().min(0).optional(),
            // Place fields - External references
            attractionId: z.number().optional(),
            priceLevel: z.any().optional(), // Can be null, number, or string
            // Place fields - Opening hours
            openingPeriods: z
              .array(
                z.object({
                  open: z.object({
                    day: z.number().min(0).max(6),
                    time: z.string(),
                  }),
                  close: z.object({
                    day: z.number().min(0).max(6),
                    time: z.string(),
                  }),
                })
              )
              .optional(),
            // Place fields - Location
            location: z
              .object({
                type: z.literal("Point"),
                coordinates: z.array(z.number()).length(2, {
                  message: "Coordinates must be an array of two numbers.",
                }),
              })
              .optional(),
            // Place fields - Time and cost
            timeStart: z.string().optional(),
            timeEnd: z.string().optional(),
            cost: z
              .object({
                type: z.string().optional(),
                value: z.number().min(0).optional(),
                paidBy: z.string().optional(),
                description: z.string().optional(),
                splitBetween: z.array(z.any()).optional(),
              })
              .optional(),
            // Place fields - Notes
            note: z.string().optional(),
          })
        ),
      })
    )
    .optional(),
});
// .refine(
//   (data) => {
//     // Validate destination constraints if destination is provided
//     if (data.destination) {
//       const { type, provinceId, wardId } = data.destination;
//       if (type === "province" && !provinceId) {
//         return false;
//       }
//       if (type === "ward" && !wardId) {
//         return false;
//       }
//     }
//     return true;
//   },
//   {
//     message:
//       "provinceId is required for province type, wardId is required for ward type",
//     path: ["destination"],
//   }
// );
// Removed date validation - allow any start/end dates

export const GetHotelDetailByIdSchema = z.object({
  hotelId: z.string(),
});

export const GetHotelOfferByIdSchema = z.object({
  hotelId: z.number(),
});

// Vote schemas
export const CreateVoteSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  targetType: z.enum(["guide", "comment"], {
    message: "Invalid target type. Must be 'guide' or 'comment'.",
  }),
  voteType: z.enum(["upvote", "downvote"], {
    message: "Invalid vote type. Must be 'upvote' or 'downvote'.",
  }),
});

export const UpdateVoteCountSchema = CreateVoteSchema.extend({
  change: z
    .number()
    .int()
    .min(-1, "Change must be -1 (decrement) or 1 (increment)")
    .max(1, "Change must be -1 (decrement) or 1 (increment)"),
});

export const HasVotedSchema = CreateVoteSchema.pick({
  targetId: true,
  targetType: true,
});

// Comment schemas
export const CommentServerSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment content is required." })
    .max(2000, { message: "Comment cannot exceed 2000 characters." }),
  guideId: z.string().min(1, { message: "Guide ID is required." }),
  parentComment: z.string().optional(), // For replies
});

export const GetCommentsSchema = z.object({
  guideId: z.string().min(1, { message: "Guide ID is required." }),
  page: z.number().int().positive().default(1).optional(),
  pageSize: z.number().int().positive().default(10).optional(),
  filter: z.enum(["latest", "oldest", "popular"]).default("latest").optional(),
});

export const DeleteCommentSchema = z.object({
  commentId: z.string().min(1, { message: "Comment ID is required." }),
});

export const UpdateCommentSchema = z.object({
  commentId: z.string().min(1, { message: "Comment ID is required." }),
  content: z
    .string()
    .min(1, { message: "Comment content is required." })
    .max(2000, { message: "Comment cannot exceed 2000 characters." }),
});

export const GetRepliesSchema = z.object({
  parentCommentId: z
    .string()
    .min(1, { message: "Parent comment ID is required." }),
  page: z.number().int().positive().default(1).optional(),
  pageSize: z.number().int().positive().default(5).optional(),
});
