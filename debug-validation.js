// Debug script để test validation
const { z } = require("zod");

// Copy NewGuideSchema từ validation.ts
const NewGuideSchema = z.object({
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

// Copy mockUpData từ page.tsx
const mockUpData = {
  title: "Hanoi Travel Guide",
  note: "A comprehensive guide to exploring Hanoi, Vietnam.",
  generalTips: "Essential tips for navigating Hanoi...",
  lodging: [
    {
      name: "Rex Hotel",
      address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh city",
      checkIn: "2024-12-15T14:00:00Z", // Changed to string
      checkOut: "2024-12-18T11:00:00Z", // Changed to string
      confirmation: "",
      notes:
        "Rex Hotel is a historic hotel known for its rooftop bar and central location.",
      cost: {
        type: "VND",
        value: 2000000,
      },
    },
  ],
  details: [
    {
      type: "route", // Đây là route
      name: "Day 1",
      index: 1,
      data: [
        // data chứa các items
        {
          type: "note",
          content:
            "Start your journey at Ben Thanh Market, a bustling hub of local culture and cuisine.",
        },
        {
          type: "checklist",
          items: ["bag", "passport", "camera"],
          completed: [false, false, false],
        },
        {
          type: "place",
          name: "Rex Hotel",
          address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City",
          description:
            "A historic hotel known for its rooftop bar and central location.",
          tags: ["hotel", "luxury", "central"],
          phone: "+84 28 3829 2185",
          images: ["https://example.com/rex-hotel-1.jpg"],
          website: "https://www.rexhotelvietnam.com/",
          location: {
            type: "Point",
            coordinates: [106.695, 10.776],
          },
          note: "The Rex Hotel is a landmark in Ho Chi Minh City, offering luxury accommodations and a rich history.",
        },
      ],
    },
    {
      type: "list", // Đây là list
      name: "Must-visit Places",
      index: 2,
      data: [
        // data có cùng structure với route
        {
          type: "place",
          name: "War Remnants Museum",
          address: "28 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City",
          description: "A museum dedicated to the history of the Vietnam War.",
          tags: ["museum", "history", "war"],
          phone: "+84 28 3930 5587",
          images: ["https://example.com/war-museum-1.jpg"],
          website: "https://warremnantsmuseum.com/",
          location: {
            type: "Point",
            coordinates: [106.688, 10.776],
          },
          note: "The War Remnants Museum provides a poignant insight into the Vietnam War.",
        },
      ],
    },
  ],
};

// Test validation
try {
  console.log("Testing validation...");
  const result = NewGuideSchema.parse(mockUpData);
  console.log("✅ Validation passed!", result);
} catch (error) {
  console.log("❌ Validation failed:");
  if (error.errors) {
    error.errors.forEach((err, index) => {
      console.log(`${index + 1}. Path: ${err.path.join(".")}`);
      console.log(`   Message: ${err.message}`);
      console.log(`   Code: ${err.code}`);
      console.log(`   Expected: ${err.expected || "N/A"}`);
      console.log(`   Received: ${err.received || "N/A"}`);
      console.log("---");
    });
  } else {
    console.error(error);
  }
}
