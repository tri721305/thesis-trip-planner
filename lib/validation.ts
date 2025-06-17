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
