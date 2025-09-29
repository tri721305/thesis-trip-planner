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
    // Basic place information
    id: {
      type: String,
      trim: true,
    },
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

    // Categories and tags
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // Contact information
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },

    // Images and media
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    imageKeys: [
      {
        type: String,
        trim: true,
      },
    ],

    // Ratings and reviews
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    numRatings: {
      type: Number,
      min: 0,
    },

    // External references
    attractionId: {
      type: Number,
    },
    priceLevel: {
      type: mongoose.Schema.Types.Mixed, // Can be null, number, or string
    },

    // Opening hours
    openingPeriods: [
      {
        open: {
          day: {
            type: Number,
            min: 0,
            max: 6, // 0 = Sunday, 6 = Saturday
          },
          time: {
            type: String,
            trim: true, // Remove regex validation
          },
        },
        close: {
          day: {
            type: Number,
            min: 0,
            max: 6,
          },
          time: {
            type: String,
            trim: true, // Remove regex validation
          },
        },
        _id: false,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false, // Make it optional to avoid validation errors
      },
    },
    timeStart: {
      type: String,
      trim: true,
    },
    timeEnd: {
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
        min: 0,
        default: 0,
      },
      paidBy: {
        type: String, // Tên người trả tiền
        trim: true,
      },
      description: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      splitBetween: [
        {
          userId: {
            type: String,
            trim: true,
            required: true,
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          amount: {
            type: Number,
            min: 0,
            default: 0,
          },
          settled: {
            type: Boolean,
            default: false,
          },
          selected: {
            type: Boolean,
            default: false,
          },
        },
      ],
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
    // Không định nghĩa field "type" ở đây vì nó đã được định nghĩa trong baseDetailSchema
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
    data: [mongoose.Schema.Types.Mixed], // Temporarily use Mixed instead of discriminator
  },
  { _id: false }
);

// 5. BƯỚC 5: Tạo Schema cho list detail
const listDetailSchema = new mongoose.Schema(
  {
    // Không định nghĩa field "type" ở đây vì nó đã được định nghĩa trong baseDetailSchema
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
    data: [mongoose.Schema.Types.Mixed], // Temporarily use Mixed instead of discriminator
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
    image: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripmates: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          validate: {
            validator: function (v: any) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Invalid email format",
          },
        },
        image: {
          type: String,
          trim: true,
        },
        userId: {
          type: Types.ObjectId,
          ref: "User",
        },
      },
    ],
    state: {
      type: String,
      required: true,
      enum: ["planning", "ongoing", "completed", "cancelled"],
      default: "planning",
    },
    type: {
      type: String,
      required: true,
      enum: ["public", "private", "friend"],
      default: "public",
    },
    destination: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      type: {
        type: String,
        enum: ["province", "ward"],
        required: true,
      },
      provinceId: {
        type: String,
        required: function (this: any) {
          return this.destination?.type === "province";
        },
        trim: true,
        validate: {
          validator: function (this: any, value: any) {
            // provinceId is required when type is "province"
            if (this.destination?.type === "province") {
              return !!value;
            }
            return true;
          },
          message: "provinceId is required when destination type is 'province'",
        },
      },
      wardId: {
        type: String,
        required: function (this: any) {
          return this.destination?.type === "ward";
        },
        trim: true,
        validate: {
          validator: function (this: any, value: any) {
            // wardId is required when type is "ward"
            if (this.destination?.type === "ward") {
              return !!value;
            }
            return true;
          },
          message: "wardId is required when destination type is 'ward'",
        },
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
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
          paidBy: {
            type: String, // Tên người trả tiền
            trim: true,
          },
          description: {
            type: String,
            trim: true,
            maxlength: 500,
          },
          splitBetween: [
            {
              userId: {
                type: Types.ObjectId,
                ref: "User",
              },
              name: {
                type: String,
                required: true,
                trim: true,
              },
              amount: {
                type: Number,
                min: 0,
                default: 0,
              },
              settled: {
                type: Boolean,
                default: false,
              },
            },
          ],
        },
      },
    ],
    details: [baseDetailSchema], // Mảng chứa route và list

    // NEW ENGAGEMENT FIELDS FOR GUIDE
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
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

// 8. BƯỚC 8: Tạo indexes
travelGuideSchema.index({ title: "text" });
travelGuideSchema.index({ "details.data.location": "2dsphere" }); // Cho geo queries
travelGuideSchema.index({ "destination.coordinates": "2dsphere" }); // Index for destination geolocation
travelGuideSchema.index({ "destination.name": "text" }); // Index for destination name search
travelGuideSchema.index({ "destination.provinceId": 1 }); // Index for province-based queries
travelGuideSchema.index({ "destination.wardId": 1 }); // Index for ward-based queries
travelGuideSchema.index({ "destination.type": 1 }); // Index for destination type queries
travelGuideSchema.index({ author: 1 });
travelGuideSchema.index({ state: 1 });
travelGuideSchema.index({ type: 1 }); // Index for guide visibility type
travelGuideSchema.index({ startDate: 1 });
travelGuideSchema.index({ endDate: 1 });
travelGuideSchema.index({ "tripmates.userId": 1 });

// NEW INDEXES FOR ENGAGEMENT FIELDS
travelGuideSchema.index({ upvotes: -1 }); // For sorting by most upvoted
travelGuideSchema.index({ views: -1 }); // For sorting by most viewed
travelGuideSchema.index({ comments: -1 }); // For sorting by most commented
travelGuideSchema.index({ createdAt: -1 }); // For sorting by newest

// Compound indexes for common queries
travelGuideSchema.index({ "destination.type": 1, "destination.provinceId": 1 }); // For province stats
travelGuideSchema.index({ "destination.type": 1, "destination.wardId": 1 }); // For ward stats
travelGuideSchema.index({ "destination.name": 1, state: 1 }); // For destination stats by state
travelGuideSchema.index({ type: 1, upvotes: -1 }); // For public guides sorted by upvotes
travelGuideSchema.index({ type: 1, views: -1 }); // For public guides sorted by views

// 9. BƯỚC 9: Middleware (optional)
travelGuideSchema.pre("save", function (next) {
  // Validate detail indices
  this.details.forEach((detail, index) => {
    if (!detail.index) {
      detail.index = index + 1;
    }
  });

  // Auto-update state based on dates
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
  const startOfStartDate = new Date(
    this.startDate.getFullYear(),
    this.startDate.getMonth(),
    this.startDate.getDate()
  ); // Start of startDate

  // Automatically change from planning to ongoing when startDate is today or in the past
  if (this.state === "planning" && startOfStartDate <= today) {
    this.state = "ongoing";
  }

  next();
});

// 10. BƯỚC 10: Thêm methods để tính toán expense split
travelGuideSchema.methods.calculateTotalExpenses = function () {
  let total = 0;

  // Tính lodging expenses
  this.lodging.forEach((lodge: any) => {
    if (lodge.cost?.value) {
      total += lodge.cost.value;
    }
  });

  // Tính place expenses
  this.details.forEach((detail: any) => {
    detail.data.forEach((item: any) => {
      if (item.type === "place" && item.cost?.value) {
        total += item.cost.value;
      }
    });
  });

  return total;
};

travelGuideSchema.methods.generateSettlement = function () {
  const expenses: any[] = [];

  // Collect all expenses with splitBetween
  this.lodging.forEach((lodge: any) => {
    if (lodge.cost?.splitBetween?.length > 0) {
      expenses.push({
        type: "lodging",
        name: lodge.name,
        totalAmount: lodge.cost.value,
        paidBy: lodge.cost.paidBy,
        splits: lodge.cost.splitBetween,
      });
    }
  });

  this.details.forEach((detail: any) => {
    detail.data.forEach((item: any) => {
      if (item.type === "place" && item.cost?.splitBetween?.length > 0) {
        expenses.push({
          type: "place",
          name: item.name,
          totalAmount: item.cost.value,
          paidBy: item.cost.paidBy,
          splits: item.cost.splitBetween,
        });
      }
    });
  });

  // Calculate who owes what to whom
  const balances: { [key: string]: number } = {};

  expenses.forEach((expense) => {
    expense.splits.forEach((split: any) => {
      if (!balances[split.name]) balances[split.name] = 0;
      if (!balances[expense.paidBy]) balances[expense.paidBy] = 0;

      // Person who paid gets positive balance
      balances[expense.paidBy] += split.amount;
      // Person who owes gets negative balance
      balances[split.name] -= split.amount;
    });
  });

  return balances;
};

travelGuideSchema.methods.getExpensesByPerson = function (personName: string) {
  const expenses: any[] = [];

  // Lodging expenses
  this.lodging.forEach((lodge: any) => {
    if (
      lodge.cost?.paidBy === personName ||
      lodge.cost?.splitBetween?.some((split: any) => split.name === personName)
    ) {
      expenses.push({
        type: "lodging",
        name: lodge.name,
        totalAmount: lodge.cost.value,
        paidBy: lodge.cost.paidBy,
        userAmount:
          lodge.cost.splitBetween?.find(
            (split: any) => split.name === personName
          )?.amount || 0,
        settled:
          lodge.cost.splitBetween?.find(
            (split: any) => split.name === personName
          )?.settled || false,
      });
    }
  });

  // Place expenses
  this.details.forEach((detail: any) => {
    detail.data.forEach((item: any) => {
      if (
        item.type === "place" &&
        (item.cost?.paidBy === personName ||
          item.cost?.splitBetween?.some(
            (split: any) => split.name === personName
          ))
      ) {
        expenses.push({
          type: "place",
          name: item.name,
          totalAmount: item.cost.value,
          paidBy: item.cost.paidBy,
          userAmount:
            item.cost.splitBetween?.find(
              (split: any) => split.name === personName
            )?.amount || 0,
          settled:
            item.cost.splitBetween?.find(
              (split: any) => split.name === personName
            )?.settled || false,
        });
      }
    });
  });

  return expenses;
};

// NEW METHODS FOR ENGAGEMENT
travelGuideSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

travelGuideSchema.methods.incrementComments = function () {
  this.comments += 1;
  return this.save();
};

travelGuideSchema.methods.decrementComments = function () {
  if (this.comments > 0) {
    this.comments -= 1;
  }
  return this.save();
};

// 11. BƯỚC 11: Export model
const Guide = models?.Guide || model("Guide", travelGuideSchema);
export default Guide;
