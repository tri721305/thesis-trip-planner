// models/TravelGuide.js
import mongoose, { model, models, Schema, Types, Document } from "mongoose";

// 1. BƯỚC 1: Tạo Base Schema cho details
// details sẽ có 2 type: 'route' và 'list'
const baseDetailSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["route", "list"], // Chỉ có 2 loại: route hoặc list
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    index: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    discriminatorKey: "type", // MongoDB sẽ dùng field 'type' để phân biệt
    _id: false,
  }
);

// 2. BƯỚC 2: Tạo Base Schema cho data items (note, checklist, place)
const baseDataItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["note", "checklist", "place"],
    },
  },
  {
    discriminatorKey: "type",
    _id: false,
  }
);

// 3. BƯỚC 3: Tạo Schema cho từng loại data item

// Schema cho type = 'note'
const noteDataSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
    },
  },
  { _id: false }
);

// Schema cho type = 'checklist'
const checklistDataSchema = new mongoose.Schema(
  {
    items: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    completed: [
      {
        type: Boolean,
        default: false,
      },
    ],
  },
  { _id: false }
);

// Schema cho type = 'place'
const placeDataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    phone: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v: any) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Image must be a valid URL",
        },
      },
    ],
    website: {
      type: String,
      validate: {
        validator: function (v: any) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Website must be a valid URL",
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (v: any) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 && // longitude
              v[1] >= -90 &&
              v[1] <= 90
            ); // latitude
          },
          message:
            "Coordinates must be [longitude, latitude] within valid ranges",
        },
      },
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// 4. BƯỚC 4: Tạo Schema cho route detail
const routeDetailSchema = new mongoose.Schema(
  {
    data: [baseDataItemSchema], // Mảng chứa note, checklist, place
  },
  { _id: false }
);

// 5. BƯỚC 5: Tạo Schema cho list detail
const listDetailSchema = new mongoose.Schema(
  {
    data: [baseDataItemSchema], // Cũng chứa note, checklist, place giống route
  },
  { _id: false }
);

// 6. BƯỚC 6: Tạo Main Travel Guide Schema
const travelGuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    note: {
      type: String,
      trim: true,
    },
    // author: {
    //   name: {
    //     type: String,
    //     required: true,
    //     trim: true,
    //   },
    //   image: {
    //     type: String,
    //     validate: {
    //       validator: function (v: any) {
    //         return !v || /^https?:\/\/.+/.test(v);
    //       },
    //       message: "Author image must be a valid URL",
    //     },
    //   },
    // },
    author: Types.ObjectId,
    generalTips: {
      type: String,
      trim: true,
    },
    lodging: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        address: {
          type: String,
          required: true,
          trim: true,
        },
        checkIn: {
          type: Date,
        },
        checkOut: {
          type: Date,
          validate: {
            validator: function (this: any, value: any) {
              // Nếu có cả checkIn và checkOut, checkOut phải sau checkIn
              return !this.checkIn || !value || value >= this.checkIn;
            },
            message: "Check-out date must be after check-in date",
          },
        },
        confirmation: {
          type: String,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
        },
        cost: {
          type: {
            type: String,
            enum: ["VND", "USD", "EUR"],
            default: "VND",
          },
          value: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      },
    ],
    details: [baseDetailSchema], // Mảng chứa route và list
  },
  {
    timestamps: true,
    collection: "travel_guides",
  }
);

// 7. BƯỚC 7: Đăng ký Discriminators

// Discriminators cho details (route vs list)
const detailsArray = travelGuideSchema.path("details") as any;
detailsArray.discriminator("route", routeDetailSchema);
detailsArray.discriminator("list", listDetailSchema);

// Discriminators cho data items trong route
const routeDataArray = routeDetailSchema.path("data") as any;
routeDataArray.discriminator("note", noteDataSchema);
routeDataArray.discriminator("checklist", checklistDataSchema);
routeDataArray.discriminator("place", placeDataSchema);

// Discriminators cho data items trong list (giống route)
const listDataArray = listDetailSchema.path("data") as any;
listDataArray.discriminator("note", noteDataSchema);
listDataArray.discriminator("checklist", checklistDataSchema);
listDataArray.discriminator("place", placeDataSchema);

// 8. BƯỚC 8: Tạo indexes
travelGuideSchema.index({ title: "text" });
travelGuideSchema.index({ "details.data.location": "2dsphere" }); // Cho geo queries
// travelGuideSchema.index({ "author.name": 1 });

// 9. BƯỚC 9: Middleware (optional)
travelGuideSchema.pre("save", function (next) {
  // Validate detail indices
  this.details.forEach((detail, index) => {
    if (!detail.index) {
      detail.index = index + 1;
    }
  });
  next();
});

// 10. BƯỚC 10: Export model
// export default mongoose.models.TravelGuide ||
//   mongoose.model("TravelGuide", travelGuideSchema);
const TravelGuide =
  models?.TravelGuide || model("TravelGuide", travelGuideSchema);
export default TravelGuide;
// 11. USAGE EXAMPLES:

/*
// Tạo travel guide mới với cấu trúc đúng:
const newGuide = new TravelGuide({
  title: "Hanoi Travel Guide",
  note: "A comprehensive guide to exploring Hanoi, Vietnam.",
  author: {
    name: "Minh Trí",
    image: "https://example.com/author-image.jpg"
  },
  generalTips: "Essential tips for navigating Hanoi...",
  lodging: [{
    name: "Rex Hotel",
    address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh city",
    checkIn: new Date("2024-12-15T14:00:00Z"),      // ISO Date format
    checkOut: new Date("2024-12-18T11:00:00Z"),     // ISO Date format
    confirmation: "",
    notes: "Rex Hotel is a historic hotel known for its rooftop bar and central location.",
    cost: {
      type: "VND",
      value: 2000000
    }
  }],
  details: [
    {
      type: "route",        // Đây là route
      name: "Day 1",
      index: 1,
      data: [               // data chứa các items
        {
          type: "note",
          content: "Start your journey at Ben Thanh Market, a bustling hub of local culture and cuisine."
        },
        {
          type: "checklist",
          items: ["bag", "passport", "camera"],
          completed: [false, false, false]
        },
        {
          type: "place",
          name: "Rex Hotel",
          address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City",
          description: "A historic hotel known for its rooftop bar and central location.",
          tags: ["hotel", "luxury", "central"],
          phone: "+84 28 3829 2185",
          images: ["https://example.com/rex-hotel-1.jpg"],
          website: "https://www.rexhotelvietnam.com/",
          location: {
            type: "Point",
            coordinates: [106.695, 10.776]
          },
          note: "The Rex Hotel is a landmark in Ho Chi Minh City, offering luxury accommodations and a rich history."
        }
      ]
    },
    {
      type: "list",         // Đây là list
      name: "Must-visit Places",
      index: 2,
      data: [               // data có cùng structure với route
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
            coordinates: [106.688, 10.776]
          },
          note: "The War Remnants Museum provides a poignant insight into the Vietnam War."
        }
      ]
    }
  ]
});

await newGuide.save();

// Query examples:

// Tìm tất cả routes
const routesOnly = await TravelGuide.findOne()
  .populate('details', null, { type: 'route' });

// Tìm tất cả lists  
const listsOnly = await TravelGuide.findOne()
  .populate('details', null, { type: 'list' });

// Tìm tất cả places trong routes hoặc lists
const allPlaces = await TravelGuide.find({
  'details.data.type': 'place'
});

// Tìm routes có chứa specific place
const routesWithPlace = await TravelGuide.find({
  'details.type': 'route',
  'details.data.type': 'place',
  'details.data.name': /Rex Hotel/i
});

// Geo query - tìm places gần location
const nearbyPlaces = await TravelGuide.find({
  'details.data.location': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [106.695, 10.776]
      },
      $maxDistance: 1000 // 1km
    }
  }
});

// Tìm guide có route cụ thể
const guideWithDay1 = await TravelGuide.find({
  'details.type': 'route',
  'details.name': 'Day 1'
});
*/
