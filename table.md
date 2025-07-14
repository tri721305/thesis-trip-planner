# Hướng dẫn thiết kế MongoDB cho hệ thống Places

## 1. Tổng quan thiết kế

### Vấn đề ban đầu

- Có 3 bảng riêng biệt: hotels, restaurants, attractions
- Cần search trên cả 3 bảng → Performance kém
- Cấu trúc không tối ưu cho việc tìm kiếm chung

### Giải pháp được chọn: Hybrid Approach

- **Bảng chính `places`**: Chứa thông tin chung cho tất cả địa điểm
- **Bảng chi tiết**: hotels, restaurants, attractions với reference đến places
- **Ưu điểm**: Search nhanh + Structure rõ ràng

## 2. Cấu trúc Models

### 2.1 Place Model (Bảng chính)

```javascript
// models/Place.js
const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên địa điểm là bắt buộc"],
      trim: true,
      maxlength: [255, "Tên không được vượt quá 255 ký tự"],
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Tọa độ là bắt buộc"],
      },
    },
    type: {
      type: String,
      enum: ["hotel", "restaurant", "attraction"],
      required: [true, "Loại địa điểm là bắt buộc"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Mô tả không được vượt quá 2000 ký tự"],
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [String],
    slug: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes tối ưu cho MongoDB
placeSchema.index({ location: "2dsphere" }); // Geospatial
placeSchema.index({ type: 1, status: 1 }); // Compound index
placeSchema.index({ name: "text", description: "text", tags: "text" }); // Full text search
placeSchema.index({ slug: 1 }, { unique: true }); // Unique slug
placeSchema.index({ "rating.average": -1 }); // Sort by rating
placeSchema.index({ createdAt: -1 }); // Sort by date
placeSchema.index({ type: 1, location: "2dsphere" }); // Location + type
```

### 2.2 Hotel Model (Bảng chi tiết)

```javascript
// models/Hotel.js
const hotelSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      unique: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "parking",
          "pool",
          "gym",
          "spa",
          "restaurant",
          "bar",
          "roomService",
          "laundry",
          "concierge",
          "elevator",
          "airConditioner",
          "businessCenter",
          "conference",
          "petFriendly",
        ],
      },
    ],
    roomTypes: [
      {
        name: String,
        description: String,
        price: Number,
        currency: { type: String, default: "VND" },
        capacity: {
          adults: Number,
          children: Number,
        },
        amenities: [String],
        images: [String],
        available: { type: Boolean, default: true },
      },
    ],
    policies: {
      checkIn: { type: String, default: "14:00" },
      checkOut: { type: String, default: "12:00" },
      cancellation: String,
      petPolicy: String,
      smokingPolicy: String,
    },
    priceRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: "VND" },
    },
  },
  { timestamps: true }
);

// Indexes
hotelSchema.index({ place: 1 });
hotelSchema.index({ stars: 1 });
hotelSchema.index({ "priceRange.min": 1, "priceRange.max": 1 });
```

### 2.3 Restaurant Model

```javascript
// models/Restaurant.js
const restaurantSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      unique: true,
    },
    cuisineType: [
      {
        type: String,
        enum: [
          "vietnamese",
          "chinese",
          "japanese",
          "korean",
          "thai",
          "italian",
          "french",
          "american",
          "indian",
          "mexican",
          "mediterranean",
          "seafood",
          "vegetarian",
          "vegan",
          "bbq",
          "fastfood",
          "cafe",
          "bakery",
        ],
        required: true,
      },
    ],
    priceRange: {
      type: String,
      enum: ["budget", "moderate", "expensive", "luxury"],
      required: true,
    },
    averagePrice: {
      type: Number,
      required: true,
    },
    capacity: Number,
    openingHours: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
    ],
    features: [
      {
        type: String,
        enum: [
          "delivery",
          "takeout",
          "dineIn",
          "reservation",
          "wifi",
          "parking",
          "outdoor",
          "bar",
          "liveMusic",
          "karaoke",
          "buffet",
          "privateRoom",
        ],
      },
    ],
    menu: [
      {
        category: String,
        items: [
          {
            name: String,
            description: String,
            price: Number,
            image: String,
            available: { type: Boolean, default: true },
            spicyLevel: { type: Number, min: 0, max: 5 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
```

### 2.4 Attraction Model

```javascript
// models/Attraction.js
const attractionSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: [
        "museum",
        "park",
        "temple",
        "beach",
        "mountain",
        "historical",
        "shopping",
        "entertainment",
        "cultural",
        "nature",
        "adventure",
        "family",
        "nightlife",
        "market",
        "zoo",
        "aquarium",
      ],
      required: true,
    },
    ticketPrice: {
      adult: Number,
      child: Number,
      senior: Number,
      student: Number,
      free: { type: Boolean, default: false },
      currency: { type: String, default: "VND" },
    },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
    ],
    duration: {
      recommended: Number, // in hours
      minimum: Number,
    },
    bestTimeToVisit: {
      season: [String],
      timeOfDay: [String],
    },
    activities: [String],
    facilities: [
      {
        type: String,
        enum: [
          "parking",
          "restroom",
          "cafe",
          "giftShop",
          "audioGuide",
          "wheelchairAccess",
          "petFriendly",
          "wifi",
          "lockers",
        ],
      },
    ],
    ageGroup: [String],
  },
  { timestamps: true }
);
```

## 3. Database Connection

```javascript
// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

## 4. API Examples

### 4.1 Search API - Tìm kiếm chung

```javascript
// pages/api/places/index.js
import connectDB from "../../../lib/mongodb";
import Place from "../../../models/Place";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const {
        search = "",
        type = "",
        page = 1,
        limit = 10,
        sort = "-createdAt",
        lat,
        lng,
        radius = 10000, // 10km
      } = req.query;

      // Build query
      let query = { status: "active" };

      // Search by name or description
      if (search) {
        query.$text = { $search: search };
      }

      // Filter by type
      if (type && ["hotel", "restaurant", "attraction"].includes(type)) {
        query.type = type;
      }

      // Location-based search
      if (lat && lng) {
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseInt(radius),
          },
        };
      }

      // Execute query with pagination
      const places = await Place.find(query)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();

      const total = await Place.countDocuments(query);

      res.status(200).json({
        success: true,
        data: places,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
```

### 4.2 Detail API - Chi tiết địa điểm

```javascript
// pages/api/places/[id].js
export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      // Get place info
      const place = await Place.findById(id)
        .populate("createdBy", "name email")
        .lean();

      if (!place) {
        return res.status(404).json({
          success: false,
          error: "Không tìm thấy địa điểm",
        });
      }

      // Get detailed info based on type
      let detailData = null;
      switch (place.type) {
        case "hotel":
          detailData = await Hotel.findOne({ place: id }).lean();
          break;
        case "restaurant":
          detailData = await Restaurant.findOne({ place: id }).lean();
          break;
        case "attraction":
          detailData = await Attraction.findOne({ place: id }).lean();
          break;
      }

      res.status(200).json({
        success: true,
        data: {
          ...place,
          details: detailData,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
```

## 5. Tối ưu MongoDB

### 5.1 Geospatial Queries

```javascript
// Tìm địa điểm gần nhất
const nearbyPlaces = await Place.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 10000, // 10km
    },
  },
  type: "restaurant",
  status: "active",
}).limit(10);

// Tìm trong vùng polygon
const placesInArea = await Place.find({
  location: {
    $geoWithin: {
      $polygon: [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x1, y1],
      ],
    },
  },
});
```

### 5.2 Aggregation Pipelines

```javascript
// Thống kê theo loại địa điểm
const stats = await Place.aggregate([
  { $match: { status: "active" } },
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 },
      avgRating: { $avg: "$rating.average" },
    },
  },
  { $sort: { count: -1 } },
]);

// Faceted search
const facetedResults = await Place.aggregate([
  { $match: { $text: { $search: "hotel" } } },
  {
    $facet: {
      byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
      byRating: [
        {
          $bucket: {
            groupBy: "$rating.average",
            boundaries: [0, 2, 3, 4, 5],
            default: "other",
          },
        },
      ],
    },
  },
]);
```

### 5.3 Text Search

```javascript
// Full text search
const searchResults = await Place.find(
  {
    $text: { $search: "khách sạn biển nha trang" },
  },
  {
    score: { $meta: "textScore" },
  }
).sort({ score: { $meta: "textScore" } });

// Search với filter
const filteredSearch = await Place.find({
  $and: [
    { $text: { $search: "hotel" } },
    { type: "hotel" },
    { "rating.average": { $gte: 4 } },
  ],
});
```

## 6. Service Layer

```javascript
// utils/placesService.js
export class PlacesService {
  static async searchPlaces(options = {}) {
    await connectDB();

    const {
      search = "",
      type = "",
      page = 1,
      limit = 10,
      sort = "-createdAt",
      lat,
      lng,
      radius = 10000,
    } = options;

    let query = { status: "active" };

    if (search) {
      query.$text = { $search: search };
    }

    if (type) {
      query.type = type;
    }

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      };
    }

    const places = await Place.find(query)
      .populate("createdBy", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Place.countDocuments(query);

    return {
      data: places,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getPlaceDetails(id) {
    await connectDB();

    const place = await Place.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!place) {
      throw new Error("Không tìm thấy địa điểm");
    }

    let detailData = null;
    switch (place.type) {
      case "hotel":
        detailData = await Hotel.findOne({ place: id }).lean();
        break;
      case "restaurant":
        detailData = await Restaurant.findOne({ place: id }).lean();
        break;
      case "attraction":
        detailData = await Attraction.findOne({ place: id }).lean();
        break;
    }

    return {
      ...place,
      details: detailData,
    };
  }

  static async createPlace(type, placeData, detailData) {
    await connectDB();

    const place = new Place({
      ...placeData,
      type,
    });
    await place.save();

    let detail = null;
    switch (type) {
      case "hotel":
        detail = new Hotel({ ...detailData, place: place._id });
        break;
      case "restaurant":
        detail = new Restaurant({ ...detailData, place: place._id });
        break;
      case "attraction":
        detail = new Attraction({ ...detailData, place: place._id });
        break;
    }

    if (detail) {
      await detail.save();
    }

    return { place, detail };
  }
}
```

## 7. Frontend Component Example

```javascript
// components/PlacesList.js
import { useState, useEffect } from "react";

export default function PlacesList() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    fetchPlaces();
  }, [search, type]);

  const fetchPlaces = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (type) params.append("type", type);

      const response = await fetch(`/api/places?${params}`);
      const data = await response.json();

      if (data.success) {
        setPlaces(data.data);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm địa điểm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Tất cả loại</option>
          <option value="hotel">Khách sạn</option>
          <option value="restaurant">Nhà hàng</option>
          <option value="attraction">Điểm tham quan</option>
        </select>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {places.map((place) => (
            <div key={place._id} className="border rounded p-4">
              <h3 className="font-bold">{place.name}</h3>
              <p className="text-gray-600">{place.address}</p>
              <p className="text-sm text-blue-600">{place.type}</p>
              <p className="text-yellow-500">
                ⭐ {place.rating.average} ({place.rating.count} reviews)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 8. Ưu điểm của MongoDB

### 8.1 So sánh với SQL

| Aspect          | SQL (MySQL/PostgreSQL)    | MongoDB                    |
| --------------- | ------------------------- | -------------------------- |
| Search chung    | UNION 3 tables (chậm)     | Query 1 collection (nhanh) |
| Geospatial      | Cần extension             | Native support             |
| Flexible schema | Cần ALTER TABLE           | Thay đổi tự do             |
| JSON handling   | Cần serialize/deserialize | Native JSON                |
| Scaling         | Vertical scaling          | Horizontal scaling         |

### 8.2 Performance Benefits

1. **Không cần JOIN**: Reference bằng ObjectId
2. **Geospatial native**: Tìm kiếm địa lý cực mạnh
3. **Flexible schema**: Dễ thêm field mới
4. **Horizontal scaling**: Dễ scale khi lớn
5. **JSON native**: Không cần ORM phức tạp

### 8.3 Queries tối ưu

```javascript
// Tìm kiếm với nhiều điều kiện
const complexSearch = await Place.find({
  $and: [
    { $text: { $search: "khách sạn" } },
    { type: "hotel" },
    { "rating.average": { $gte: 4 } },
    {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [106.7, 10.8] },
          $maxDistance: 5000,
        },
      },
    },
  ],
}).populate("createdBy", "name");

// Aggregation cho dashboard
const dashboard = await Place.aggregate([
  { $match: { status: "active" } },
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 },
      avgRating: { $avg: "$rating.average" },
      totalReviews: { $sum: "$rating.count" },
    },
  },
  { $sort: { count: -1 } },
]);
```

## 9. Cấu trúc thư mục đề xuất

```
project/
├── models/
│   ├── Place.js
│   ├── Hotel.js
│   ├── Restaurant.js
│   ├── Attraction.js
│   └── User.js
├── lib/
│   └── mongodb.js
├── pages/api/
│   ├── places/
│   │   ├── index.js
│   │   ├── [id].js
│   │   └── nearby.js
│   ├── hotels/
│   ├── restaurants/
│   └── attractions/
├── utils/
│   └── placesService.js
├── components/
│   └── PlacesList.js
└── .env.local
```

## 10. Environment Variables

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/places_db
# hoặc MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/places_db

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 11. Kết luận

Hybrid approach với MongoDB là giải pháp tối ưu cho hệ thống places vì:

1. **Search performance**: Chỉ query 1 collection thay vì 3
2. **Geospatial power**: MongoDB rất mạnh cho location-based search
3. **Flexible schema**: Dễ mở rộng và thay đổi
4. **Maintainability**: Code đơn giản hơn, dễ maintain
5. **Scalability**: Sẵn sàng cho scale lớn

Cấu trúc này giúp bạn có:

- ✅ Search nhanh trên tất cả địa điểm
- ✅ Chi tiết rõ ràng cho từng loại
- ✅ Geospatial search mạnh mẽ
- ✅ Code dễ maintain và extend
- ✅ Performance tốt cho cả development và production
