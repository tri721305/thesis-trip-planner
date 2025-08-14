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
    timeStart: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: any) {
          // Accept formats: "10:00", "10:00 AM", "14:30", "Morning", etc.
          return (
            !v ||
            /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i.test(
              v
            )
          );
        },
        message:
          "Time format should be like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
      },
    },
    timeEnd: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: any) {
          // Accept formats: "10:00", "10:00 AM", "14:30", "Morning", etc.
          return (
            !v ||
            /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i.test(
              v
            )
          );
        },
        message:
          "Time format should be like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
      },
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

// 6. BƯỚC 6: Tạo Main Travel Plan Schema
const travelPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      validate: {
        validator: function (v: any) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Image must be a valid URL",
      },
    },
    note: {
      type: String,
      trim: true,
    },
    author: Types.ObjectId,
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
          validate: {
            validator: function (v: any) {
              return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Image must be a valid URL",
          },
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
      enum: ["planning", "confirmed", "ongoing", "completed", "cancelled"],
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
      validate: {
        validator: function (value: any) {
          // Start date should not be in the past (with some tolerance for time zones)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Start date cannot be in the past",
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: any, value: any) {
          // End date must be after start date
          return !this.startDate || !value || value >= this.startDate;
        },
        message: "End date must be after start date",
      },
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
  },
  {
    timestamps: true,
    collection: "travel_plans",
  }
);

// 7. BƯỚC 7: Đăng ký Discriminators

// Discriminators cho details (route vs list)
const detailsArray = travelPlanSchema.path("details") as any;
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
travelPlanSchema.index({ title: "text" });
travelPlanSchema.index({ "details.data.location": "2dsphere" }); // Cho geo queries
travelPlanSchema.index({ "destination.coordinates": "2dsphere" }); // Index for destination geolocation
travelPlanSchema.index({ "destination.name": "text" }); // Index for destination name search
travelPlanSchema.index({ "destination.provinceId": 1 }); // Index for province-based queries
travelPlanSchema.index({ "destination.wardId": 1 }); // Index for ward-based queries
travelPlanSchema.index({ "destination.type": 1 }); // Index for destination type queries
travelPlanSchema.index({ author: 1 });
travelPlanSchema.index({ state: 1 });
travelPlanSchema.index({ type: 1 }); // Index for plan visibility type
travelPlanSchema.index({ startDate: 1 });
travelPlanSchema.index({ endDate: 1 });
travelPlanSchema.index({ "tripmates.userId": 1 });

// Compound indexes for common queries
travelPlanSchema.index({ "destination.type": 1, "destination.provinceId": 1 }); // For province stats
travelPlanSchema.index({ "destination.type": 1, "destination.wardId": 1 }); // For ward stats
travelPlanSchema.index({ "destination.name": 1, state: 1 }); // For destination stats by state

// 9. BƯỚC 9: Middleware (optional)
travelPlanSchema.pre("save", function (next) {
  // Validate detail indices
  this.details.forEach((detail, index) => {
    if (!detail.index) {
      detail.index = index + 1;
    }
  });

  // Auto-update state based on dates
  const now = new Date();
  if (
    this.state === "confirmed" &&
    this.startDate <= now &&
    this.endDate >= now
  ) {
    this.state = "ongoing";
  } else if (this.state === "ongoing" && this.endDate < now) {
    this.state = "completed";
  }

  next();
});

// 10. BƯỚC 10: Thêm methods để tính toán expense split
travelPlanSchema.methods.calculateTotalExpenses = function () {
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

travelPlanSchema.methods.generateSettlement = function () {
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

travelPlanSchema.methods.getExpensesByPerson = function (personName: string) {
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

// 11. BƯỚC 11: Export model
const TravelPlan = models?.TravelPlan || model("TravelPlan", travelPlanSchema);
export default TravelPlan;

// 12. USAGE EXAMPLES:

/*
// Tạo travel plan mới với expense splitting:
const newPlan = new TravelPlan({
  title: "Hanoi Adventure Plan with Expense Splitting",
  image: "https://example.com/hanoi-plan-cover.jpg",
  note: "A detailed plan for exploring Hanoi with friends.",
  author: new Types.ObjectId("648f1f77bcf86cd799439013"),
  tripmates: [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      image: "https://example.com/alice.jpg",
      userId: new Types.ObjectId("648f1f77bcf86cd799439014")
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      userId: new Types.ObjectId("648f1f77bcf86cd799439015")
    },
    {
      name: "Charlie Brown",
      email: "charlie@example.com",
      userId: new Types.ObjectId("648f1f77bcf86cd799439016")
    }
  ],
  state: "planning",
  type: "friend", // Plan visible to friends only
  destination: {
    name: "Thành phố Hồ Chí Minh",
    coordinates: [106.6954, 10.7769], // [longitude, latitude] for Ho Chi Minh City
    type: "province",
    provinceId: "79", // Mã tỉnh TP.HCM
  },
  startDate: new Date("2024-12-15T00:00:00Z"),
  endDate: new Date("2024-12-18T23:59:59Z"),
  generalTips: "Essential tips for navigating Hanoi with a group...",
  lodging: [{
    name: "Hanoi Central Hotel",
    address: "123 Hoan Kiem, Hanoi",
    checkIn: new Date("2024-12-15T14:00:00Z"),
    checkOut: new Date("2024-12-18T11:00:00Z"),
    confirmation: "HTL123456",
    notes: "Central location near Old Quarter",
    cost: {
      type: "VND",
      value: 3000000,
      paidBy: "Alice Johnson",
      description: "3 nights shared hotel room",
      splitBetween: [
        {
          userId: new Types.ObjectId("648f1f77bcf86cd799439014"),
          name: "Alice Johnson",
          amount: 1000000,
          settled: false
        },
        {
          userId: new Types.ObjectId("648f1f77bcf86cd799439015"),
          name: "Bob Smith",
          amount: 1000000,
          settled: false
        },
        {
          userId: new Types.ObjectId("648f1f77bcf86cd799439016"),
          name: "Charlie Brown",
          amount: 1000000,
          settled: false
        }
      ]
    }
  }],
  details: [
    {
      type: "route",
      name: "Day 1 - Arrival",
      index: 1,
      data: [
        {
          type: "note",
          content: "Meet at Noi Bai Airport at 10:00 AM"
        },
        {
          type: "checklist",
          items: ["Check-in hotel", "Get SIM cards", "Currency exchange"],
          completed: [false, false, false]
        },
        {
          type: "place",
          name: "Hoan Kiem Lake",
          address: "Hoan Kiem District, Hanoi",
          description: "Scenic lake in the heart of Hanoi",
          tags: ["lake", "scenic", "walking"],
          location: {
            type: "Point",
            coordinates: [105.8523, 21.0285]
          },
          timeStart: "6:00 PM",
          timeEnd: "8:00 PM",
          cost: {
            type: "VND",
            value: 0,
            description: "Free activity"
          },
          note: "Perfect spot for evening walk"
        },
        {
          type: "place",
          name: "Fancy Group Dinner",
          address: "456 Food Street, Hanoi",
          description: "Welcome dinner for the group",
          tags: ["restaurant", "dinner", "group"],
          location: {
            type: "Point",
            coordinates: [105.8466, 21.0355]
          },
          timeStart: "7:00 PM",
          timeEnd: "9:00 PM",
          cost: {
            type: "VND",
            value: 1500000,
            paidBy: "Bob Smith",
            description: "Group welcome dinner",
            splitBetween: [
              {
                userId: new Types.ObjectId("648f1f77bcf86cd799439014"),
                name: "Alice Johnson",
                amount: 500000,
                settled: false
              },
              {
                userId: new Types.ObjectId("648f1f77bcf86cd799439015"),
                name: "Bob Smith",
                amount: 500000,
                settled: false
              },
              {
                userId: new Types.ObjectId("648f1f77bcf86cd799439016"),
                name: "Charlie Brown",
                amount: 500000,
                settled: false
              }
            ]
          },
          note: "Try the traditional Vietnamese cuisine"
        }
      ]
    },
    {
      type: "list",
      name: "Must-try Foods",
      index: 2,
      data: [
        {
          type: "place",
          name: "Pho Gia Truyen",
          address: "49 Bat Dan, Hoan Kiem, Hanoi",
          description: "Famous pho restaurant",
          tags: ["restaurant", "pho", "local"],
          location: {
            type: "Point",
            coordinates: [105.8466, 21.0355]
          },
          timeStart: "Morning",
          cost: {
            type: "VND",
            value: 150000,
            description: "Individual breakfast - everyone pays for themselves"
          },
          note: "Try the traditional beef pho"
        }
      ]
    }
  ]
});

await newPlan.save();

// Usage examples with new methods:

// Calculate total expenses for the trip
const totalExpenses = newPlan.calculateTotalExpenses();
console.log(`Total trip expenses: ${totalExpenses} VND`);

// Generate settlement report
const settlement = newPlan.generateSettlement();
console.log("Settlement report:", settlement);
// Output: { 
//   "Alice Johnson": 500000,   // Alice gets 500k back from others
//   "Bob Smith": 500000,       // Bob gets 500k back from others  
//   "Charlie Brown": -1000000  // Charlie owes 1M total (500k to Alice, 500k to Bob)
// }

// Get expenses for a specific person
const aliceExpenses = newPlan.getExpensesByPerson("Alice Johnson");
console.log("Alice's expenses:", aliceExpenses);

// Update settlement status when someone pays
await TravelPlan.updateOne(
  { 
    _id: newPlan._id,
    "lodging.cost.splitBetween.name": "Bob Smith"
  },
  {
    $set: {
      "lodging.$.cost.splitBetween.$.settled": true
    }
  }
);

// Query examples:

// Tìm tất cả plans đang planning
const planningPlans = await TravelPlan.find({ state: "planning" });

// Tìm plans có user tham gia
const userPlans = await TravelPlan.find({
  $or: [
    { author: userId },
    { "tripmates.userId": userId }
  ]
});

// Tìm plans với unsettled expenses
const plansWithUnsettledExpenses = await TravelPlan.find({
  $or: [
    { "lodging.cost.splitBetween.settled": false },
    { "details.data.cost.splitBetween.settled": false }
  ]
});

// Tìm plans trong khoảng thời gian
const upcomingPlans = await TravelPlan.find({
  startDate: { $gte: new Date() },
  state: { $in: ["planning", "confirmed"] }
});

// Tìm ongoing plans
const ongoingPlans = await TravelPlan.find({
  state: "ongoing",
  startDate: { $lte: new Date() },
  endDate: { $gte: new Date() }
});

// Tìm completed plans
const completedPlans = await TravelPlan.find({
  state: "completed",
  endDate: { $lt: new Date() }
});

// Geo query - tìm plans gần location
const nearbyPlans = await TravelPlan.find({
  'details.data.location': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [105.8523, 21.0285] // Hanoi coordinates
      },
      $maxDistance: 50000 // 50km
    }
  }
});

// Tìm public plans (có thể xem bởi tất cả mọi người)
const publicPlans = await TravelPlan.find({ type: "public" });

// Tìm private plans của user
const privatePlans = await TravelPlan.find({ 
  type: "private", 
  author: userId 
});

// Tìm friend plans mà user có thể xem (user là author hoặc trong tripmates)
const friendPlans = await TravelPlan.find({
  type: "friend",
  $or: [
    { author: userId },
    { "tripmates.userId": userId }
  ]
});

// Tìm tất cả plans mà user có thể xem
const visiblePlans = await TravelPlan.find({
  $or: [
    { type: "public" },
    { type: "private", author: userId },
    { 
      type: "friend", 
      $or: [
        { author: userId },
        { "tripmates.userId": userId }
      ]
    }
  ]
});

// Tìm plans theo destination name
const plansToHCM = await TravelPlan.find({
  "destination.name": { $regex: "Hồ Chí Minh", $options: "i" }
});

// Tìm plans theo province ID (cho dashboard thống kê)
const plansByProvince = await TravelPlan.find({
  "destination.type": "province",
  "destination.provinceId": "79" // TP.HCM
});

// Tìm plans theo ward ID (cho dashboard thống kê) 
const plansByWard = await TravelPlan.find({
  "destination.type": "ward",
  "destination.wardId": "26734" // Ví dụ mã phường
});

// Tìm plans theo destination type
const provinceLevelPlans = await TravelPlan.find({
  "destination.type": "province"
});

const wardLevelPlans = await TravelPlan.find({
  "destination.type": "ward"
});

// Aggregate thống kê theo tỉnh thành
const provinceStats = await TravelPlan.aggregate([
  {
    $match: { "destination.type": "province" }
  },
  {
    $group: {
      _id: "$destination.provinceId",
      destinationName: { $first: "$destination.name" },
      totalPlans: { $sum: 1 },
      publicPlans: { $sum: { $cond: [{ $eq: ["$type", "public"] }, 1, 0] } },
      privatePlans: { $sum: { $cond: [{ $eq: ["$type", "private"] }, 1, 0] } },
      friendPlans: { $sum: { $cond: [{ $eq: ["$type", "friend"] }, 1, 0] } },
      completedPlans: { $sum: { $cond: [{ $eq: ["$state", "completed"] }, 1, 0] } },
      coordinates: { $first: "$destination.coordinates" }
    }
  },
  {
    $sort: { totalPlans: -1 }
  }
]);

// Aggregate thống kê theo phường/xã
const wardStats = await TravelPlan.aggregate([
  {
    $match: { "destination.type": "ward" }
  },
  {
    $group: {
      _id: "$destination.wardId",
      destinationName: { $first: "$destination.name" },
      totalPlans: { $sum: 1 },
      publicPlans: { $sum: { $cond: [{ $eq: ["$type", "public"] }, 1, 0] } },
      privatePlans: { $sum: { $cond: [{ $eq: ["$type", "private"] }, 1, 0] } },
      friendPlans: { $sum: { $cond: [{ $eq: ["$type", "friend"] }, 1, 0] } },
      completedPlans: { $sum: { $cond: [{ $eq: ["$state", "completed"] }, 1, 0] } },
      coordinates: { $first: "$destination.coordinates" }
    }
  },
  {
    $sort: { totalPlans: -1 }
  }
]);

// Tìm plans gần một destination cụ thể (trong bán kính 50km)
const nearbyDestinationPlans = await TravelPlan.find({
  "destination.coordinates": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [106.6954, 10.7769] // Ho Chi Minh City coordinates
      },
      $maxDistance: 50000 // 50km radius
    }
  }
});

// Tìm top destinations được yêu thích nhất
const topDestinations = await TravelPlan.aggregate([
  {
    $group: {
      _id: {
        name: "$destination.name",
        type: "$destination.type",
        provinceId: "$destination.provinceId",
        wardId: "$destination.wardId"
      },
      totalPlans: { $sum: 1 },
      completedPlans: { $sum: { $cond: [{ $eq: ["$state", "completed"] }, 1, 0] } },
      avgCoordinates: { $avg: "$destination.coordinates" }
    }
  },
  {
    $addFields: {
      popularityScore: { 
        $add: [
          { $multiply: ["$totalPlans", 10] },
          { $multiply: ["$completedPlans", 5] }
        ]
      }
    }
  },
  {
    $sort: { popularityScore: -1 }
  },
  {
    $limit: 20
  }
]);

// Tìm plans trong một bounding box (ví dụ: khu vực Đông Nam Á)
const southeastAsiaPlans = await TravelPlan.find({
  "destination.coordinates": {
    $geoWithin: {
      $box: [
        [90, -10], // Southwest corner [longitude, latitude]
        [140, 30]  // Northeast corner [longitude, latitude]
      ]
    }
  }
});

// Update plan state
await TravelPlan.findByIdAndUpdate(planId, { state: "confirmed" });

// Add tripmate
await TravelPlan.findByIdAndUpdate(planId, {
  $push: {
    tripmates: {
      name: "David Wilson",
      email: "david@example.com",
      userId: new Types.ObjectId()
    }
  }
});
*/

// // filepath: /Users/mac/Desktop/HCMUT/Thesis/source/database/plan.model.ts
// // models/TravelPlan.js
// import mongoose, { model, models, Schema, Types, Document } from "mongoose";

// // 1. BƯỚC 1: Tạo Base Schema cho details
// // details sẽ có 2 type: 'route' và 'list'
// const baseDetailSchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       required: true,
//       enum: ["route", "list"], // Chỉ có 2 loại: route hoặc list
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     index: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//   },
//   {
//     discriminatorKey: "type", // MongoDB sẽ dùng field 'type' để phân biệt
//     _id: false,
//   }
// );

// // 2. BƯỚC 2: Tạo Base Schema cho data items (note, checklist, place)
// const baseDataItemSchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       required: true,
//       enum: ["note", "checklist", "place"],
//     },
//   },
//   {
//     discriminatorKey: "type",
//     _id: false,
//   }
// );

// // 3. BƯỚC 3: Tạo Schema cho từng loại data item

// // Schema cho type = 'note'
// const noteDataSchema = new mongoose.Schema(
//   {
//     content: {
//       type: String,
//       required: true,
//       minlength: 1,
//       trim: true,
//     },
//   },
//   { _id: false }
// );

// // Schema cho type = 'checklist'
// const checklistDataSchema = new mongoose.Schema(
//   {
//     items: [
//       {
//         type: String,
//         required: true,
//         trim: true,
//       },
//     ],
//     completed: [
//       {
//         type: Boolean,
//         default: false,
//       },
//     ],
//   },
//   { _id: false }
// );

// // Schema cho type = 'place'
// const placeDataSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     address: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     tags: [
//       {
//         type: String,
//         lowercase: true,
//         trim: true,
//       },
//     ],
//     phone: {
//       type: String,
//       trim: true,
//     },
//     images: [
//       {
//         type: String,
//         validate: {
//           validator: function (v: any) {
//             return /^https?:\/\/.+/.test(v);
//           },
//           message: "Image must be a valid URL",
//         },
//       },
//     ],
//     website: {
//       type: String,
//       validate: {
//         validator: function (v: any) {
//           return /^https?:\/\/.+/.test(v);
//         },
//         message: "Website must be a valid URL",
//       },
//     },
//     location: {
//       type: {
//         type: String,
//         enum: ["Point"],
//         default: "Point",
//       },
//       coordinates: {
//         type: [Number], // [longitude, latitude]
//         required: true,
//         validate: {
//           validator: function (v: any) {
//             return (
//               v.length === 2 &&
//               v[0] >= -180 &&
//               v[0] <= 180 && // longitude
//               v[1] >= -90 &&
//               v[1] <= 90
//             ); // latitude
//           },
//           message:
//             "Coordinates must be [longitude, latitude] within valid ranges",
//         },
//       },
//     },
//     timeStart: {
//       type: String,
//       trim: true,
//       validate: {
//         validator: function (v: any) {
//           // Accept formats: "10:00", "10:00 AM", "14:30", "Morning", etc.
//           return (
//             !v ||
//             /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i.test(
//               v
//             )
//           );
//         },
//         message:
//           "Time format should be like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
//       },
//     },
//     timeEnd: {
//       type: String,
//       trim: true,
//       validate: {
//         validator: function (v: any) {
//           // Accept formats: "10:00", "10:00 AM", "14:30", "Morning", etc.
//           return (
//             !v ||
//             /^([0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?|Morning|Afternoon|Evening|Night)$/i.test(
//               v
//             )
//           );
//         },
//         message:
//           "Time format should be like '10:00 AM', '14:30', or 'Morning/Afternoon/Evening/Night'",
//       },
//     },
//     cost: {
//       type: {
//         type: String,
//         enum: ["VND", "USD", "EUR"],
//         default: "VND",
//       },
//       value: {
//         type: Number,
//         min: 0,
//         default: 0,
//       },
//       paidBy: {
//         type: String, // Tên người trả tiền
//         trim: true,
//       },
//       description: {
//         type: String,
//         trim: true,
//         maxlength: 500,
//       },
//       splitBetween: [
//         {
//           userId: {
//             type: Types.ObjectId,
//             ref: "User",
//           },
//           name: {
//             type: String,
//             required: true,
//             trim: true,
//           },
//           amount: {
//             type: Number,
//             min: 0,
//             default: 0,
//           },
//           settled: {
//             type: Boolean,
//             default: false,
//           },
//         },
//       ],
//     },
//     note: {
//       type: String,
//       trim: true,
//     },
//   },
//   { _id: false }
// );

// // 4. BƯỚC 4: Tạo Schema cho route detail
// const routeDetailSchema = new mongoose.Schema(
//   {
//     data: [baseDataItemSchema], // Mảng chứa note, checklist, place
//   },
//   { _id: false }
// );

// // 5. BƯỚC 5: Tạo Schema cho list detail
// const listDetailSchema = new mongoose.Schema(
//   {
//     data: [baseDataItemSchema], // Cũng chứa note, checklist, place giống route
//   },
//   { _id: false }
// );

// // 6. BƯỚC 6: Tạo Main Travel Plan Schema
// const travelPlanSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200,
//     },
//     image: {
//       type: String,
//       validate: {
//         validator: function (v: any) {
//           return !v || /^https?:\/\/.+/.test(v);
//         },
//         message: "Image must be a valid URL",
//       },
//     },
//     note: {
//       type: String,
//       trim: true,
//     },
//     author: Types.ObjectId,
//     tripmates: [
//       {
//         name: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         email: {
//           type: String,
//           validate: {
//             validator: function (v: any) {
//               return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//             },
//             message: "Invalid email format",
//           },
//         },
//         image: {
//           type: String,
//           validate: {
//             validator: function (v: any) {
//               return !v || /^https?:\/\/.+/.test(v);
//             },
//             message: "Image must be a valid URL",
//           },
//         },
//         userId: {
//           type: Types.ObjectId,
//           ref: "User",
//         },
//       },
//     ],
//     state: {
//       type: String,
//       required: true,
//       enum: ["planning", "confirmed", "ongoing", "completed", "cancelled"],
//       default: "planning",
//     },
//     startDate: {
//       type: Date,
//       required: true,
//       validate: {
//         validator: function (value: any) {
//           // Start date should not be in the past (with some tolerance for time zones)
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           return value >= today;
//         },
//         message: "Start date cannot be in the past",
//       },
//     },
//     endDate: {
//       type: Date,
//       required: true,
//       validate: {
//         validator: function (this: any, value: any) {
//           // End date must be after start date
//           return !this.startDate || !value || value >= this.startDate;
//         },
//         message: "End date must be after start date",
//       },
//     },
//     generalTips: {
//       type: String,
//       trim: true,
//     },
//     lodging: [
//       {
//         name: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         address: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         checkIn: {
//           type: Date,
//         },
//         checkOut: {
//           type: Date,
//           validate: {
//             validator: function (this: any, value: any) {
//               // Nếu có cả checkIn và checkOut, checkOut phải sau checkIn
//               return !this.checkIn || !value || value >= this.checkIn;
//             },
//             message: "Check-out date must be after check-in date",
//           },
//         },
//         confirmation: {
//           type: String,
//           trim: true,
//         },
//         notes: {
//           type: String,
//           trim: true,
//         },
//         cost: {
//           type: {
//             type: String,
//             enum: ["VND", "USD", "EUR"],
//             default: "VND",
//           },
//           value: {
//             type: Number,
//             required: true,
//             min: 0,
//           },
//           paidBy: {
//             type: String, // Tên người trả tiền
//             trim: true,
//           },
//           description: {
//             type: String,
//             trim: true,
//             maxlength: 500,
//           },
//           splitBetween: [
//             {
//               userId: {
//                 type: Types.ObjectId,
//                 ref: "User",
//               },
//               name: {
//                 type: String,
//                 required: true,
//                 trim: true,
//               },
//               amount: {
//                 type: Number,
//                 min: 0,
//                 default: 0,
//               },
//               settled: {
//                 type: Boolean,
//                 default: false,
//               },
//             },
//           ],
//         },
//       },
//     ],
//     details: [baseDetailSchema], // Mảng chứa route và list
//   },
//   {
//     timestamps: true,
//     collection: "travel_plans",
//   }
// );

// // 7. BƯỚC 7: Đăng ký Discriminators

// // Discriminators cho details (route vs list)
// const detailsArray = travelPlanSchema.path("details") as any;
// detailsArray.discriminator("route", routeDetailSchema);
// detailsArray.discriminator("list", listDetailSchema);

// // Discriminators cho data items trong route
// const routeDataArray = routeDetailSchema.path("data") as any;
// routeDataArray.discriminator("note", noteDataSchema);
// routeDataArray.discriminator("checklist", checklistDataSchema);
// routeDataArray.discriminator("place", placeDataSchema);

// // Discriminators cho data items trong list (giống route)
// const listDataArray = listDetailSchema.path("data") as any;
// listDataArray.discriminator("note", noteDataSchema);
// listDataArray.discriminator("checklist", checklistDataSchema);
// listDataArray.discriminator("place", placeDataSchema);

// // 8. BƯỚC 8: Tạo indexes
// travelPlanSchema.index({ title: "text" });
// travelPlanSchema.index({ "details.data.location": "2dsphere" }); // Cho geo queries
// travelPlanSchema.index({ author: 1 });
// travelPlanSchema.index({ state: 1 });
// travelPlanSchema.index({ startDate: 1 });
// travelPlanSchema.index({ endDate: 1 });
// travelPlanSchema.index({ "tripmates.userId": 1 });

// // 9. BƯỚC 9: Middleware (optional)
// travelPlanSchema.pre("save", function (next) {
//   // Validate detail indices
//   this.details.forEach((detail, index) => {
//     if (!detail.index) {
//       detail.index = index + 1;
//     }
//   });

//   // Auto-update state based on dates
//   const now = new Date();
//   if (
//     this.state === "confirmed" &&
//     this.startDate <= now &&
//     this.endDate >= now
//   ) {
//     this.state = "ongoing";
//   } else if (this.state === "ongoing" && this.endDate < now) {
//     this.state = "completed";
//   }

//   next();
// });

// // 10. BƯỚC 10: Export model
// const TravelPlan = models?.TravelPlan || model("TravelPlan", travelPlanSchema);
// export default TravelPlan;

// // 11. USAGE EXAMPLES:

// /*
// // Tạo travel plan mới với cấu trúc đúng:
// const newPlan = new TravelPlan({
//   title: "Hanoi Adventure Plan",
//   image: "https://example.com/hanoi-plan-cover.jpg",
//   note: "A detailed plan for exploring Hanoi with friends.",
//   author: new Types.ObjectId("648f1f77bcf86cd799439013"),
//   tripmates: [
//     {
//       name: "Alice Johnson",
//       email: "alice@example.com",
//       image: "https://example.com/alice.jpg",
//       userId: new Types.ObjectId("648f1f77bcf86cd799439014")
//     },
//     {
//       name: "Bob Smith",
//       email: "bob@example.com",
//       userId: new Types.ObjectId("648f1f77bcf86cd799439015")
//     }
//   ],
//   state: "planning",
//   startDate: new Date("2024-12-15T00:00:00Z"),
//   endDate: new Date("2024-12-18T23:59:59Z"),
//   generalTips: "Essential tips for navigating Hanoi with a group...",
//   lodging: [{
//     name: "Hanoi Central Hotel",
//     address: "123 Hoan Kiem, Hanoi",
//     checkIn: new Date("2024-12-15T14:00:00Z"),
//     checkOut: new Date("2024-12-18T11:00:00Z"),
//     confirmation: "HTL123456",
//     notes: "Central location near Old Quarter",
//     cost: {
//       type: "VND",
//       value: 1500000
//     }
//   }],
//   details: [
//     {
//       type: "route",
//       name: "Day 1 - Arrival",
//       index: 1,
//       data: [
//         {
//           type: "note",
//           content: "Meet at Noi Bai Airport at 10:00 AM"
//         },
//         {
//           type: "checklist",
//           items: ["Check-in hotel", "Get SIM cards", "Currency exchange"],
//           completed: [false, false, false]
//         },
//         {
//           type: "place",
//           name: "Hoan Kiem Lake",
//           address: "Hoan Kiem District, Hanoi",
//           description: "Scenic lake in the heart of Hanoi",
//           tags: ["lake", "scenic", "walking"],
//           location: {
//             type: "Point",
//             coordinates: [105.8523, 21.0285]
//           },
//           note: "Perfect spot for evening walk"
//         }
//       ]
//     },
//     {
//       type: "list",
//       name: "Must-try Foods",
//       index: 2,
//       data: [
//         {
//           type: "place",
//           name: "Pho Gia Truyen",
//           address: "49 Bat Dan, Hoan Kiem, Hanoi",
//           description: "Famous pho restaurant",
//           tags: ["restaurant", "pho", "local"],
//           location: {
//             type: "Point",
//             coordinates: [105.8466, 21.0355]
//           },
//           note: "Try the traditional beef pho"
//         }
//       ]
//     }
//   ]
// });

// await newPlan.save();

// // Query examples:

// // Tìm tất cả plans đang planning
// const planningPlans = await TravelPlan.find({ state: "planning" });

// // Tìm plans có user tham gia
// const userPlans = await TravelPlan.find({
//   $or: [
//     { author: userId },
//     { "tripmates.userId": userId }
//   ]
// });

// // Tìm plans trong khoảng thời gian
// const upcomingPlans = await TravelPlan.find({
//   startDate: { $gte: new Date() },
//   state: { $in: ["planning", "confirmed"] }
// });

// // Tìm ongoing plans
// const ongoingPlans = await TravelPlan.find({
//   state: "ongoing",
//   startDate: { $lte: new Date() },
//   endDate: { $gte: new Date() }
// });

// // Tìm completed plans
// const completedPlans = await TravelPlan.find({
//   state: "completed",
//   endDate: { $lt: new Date() }
// });

// // Geo query - tìm plans gần location
// const nearbyPlans = await TravelPlan.find({
//   'details.data.location': {
//     $near: {
//       $geometry: {
//         type: 'Point',
//         coordinates: [105.8523, 21.0285] // Hanoi coordinates
//       },
//       $maxDistance: 50000 // 50km
//     }
//   }
// });

// // Update plan state
// await TravelPlan.findByIdAndUpdate(planId, { state: "confirmed" });

// // Add tripmate
// await TravelPlan.findByIdAndUpdate(planId, {
//   $push: {
//     tripmates: {
//       name: "Charlie Brown",
//       email: "charlie@example.com",
//       userId: new Types.ObjectId()
//     }
//   }
// });
// */
