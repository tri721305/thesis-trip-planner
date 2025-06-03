// MongoDB Address Database Schema
// Collections: provinces, districts, wards, locations, administrative_units, administrative_regions

// Use the address_management database
use address_management;

// 1. Administrative Units Collection (Reference data)
db.createCollection("administrative_units");
db.administrative_units.insertMany([
    {
        _id: ObjectId(),
        fullName: "Thành phố Trung ương",
        fullNameEn: "Central City",
        shortName: "Thành phố",
        shortNameEn: "City",
        codeName: "thanh_pho",
        codeNameEn: "city",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        fullName: "Tỉnh",
        fullNameEn: "Province",
        shortName: "Tỉnh",
        shortNameEn: "Province",
        codeName: "tinh",
        codeNameEn: "province",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        fullName: "Quận",
        fullNameEn: "District",
        shortName: "Quận",
        shortNameEn: "District",
        codeName: "quan",
        codeNameEn: "district",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        fullName: "Huyện",
        fullNameEn: "County",
        shortName: "Huyện",
        shortNameEn: "County",
        codeName: "huyen",
        codeNameEn: "county",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        fullName: "Phường",
        fullNameEn: "Ward",
        shortName: "Phường",
        shortNameEn: "Ward",
        codeName: "phuong",
        codeNameEn: "ward",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        fullName: "Xã",
        fullNameEn: "Commune",
        shortName: "Xã",
        shortNameEn: "Commune",
        codeName: "xa",
        codeNameEn: "commune",
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

// 2. Administrative Regions Collection
db.createCollection("administrative_regions");
db.administrative_regions.insertMany([
    {
        _id: ObjectId(),
        name: "Đông Bắc Bộ",
        nameEn: "Northeast",
        codeName: "dong_bac_bo",
        codeNameEn: "northeast",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        name: "Đồng bằng sông Hồng",
        nameEn: "Red River Delta",
        codeName: "dong_bang_song_hong",
        codeNameEn: "red_river_delta",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        name: "Đông Nam Bộ",
        nameEn: "Southeast",
        codeName: "dong_nam_bo",
        codeNameEn: "southeast",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        name: "Đồng bằng sông Cửu Long",
        nameEn: "Mekong River Delta",
        codeName: "dong_bang_song_cuu_long",
        codeNameEn: "mekong_river_delta",
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

// 3. Provinces Collection
db.createCollection("provinces");

// Sample province data
const southeastRegion = db.administrative_regions.findOne({codeName: "dong_nam_bo"});
const cityUnit = db.administrative_units.findOne({codeName: "thanh_pho"});

db.provinces.insertOne({
    _id: ObjectId(),
    code: "79",
    name: "Hồ Chí Minh",
    nameEn: "Ho Chi Minh City",
    fullName: "Thành phố Hồ Chí Minh",
    fullNameEn: "Ho Chi Minh City",
    administrativeUnit: {
        id: cityUnit._id,
        name: cityUnit.fullName,
        nameEn: cityUnit.fullNameEn
    },
    administrativeRegion: {
        id: southeastRegion._id,
        name: southeastRegion.name,
        nameEn: southeastRegion.nameEn
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Statistics (can be updated via aggregation)
    stats: {
        districtCount: 0,
        wardCount: 0,
        locationCount: 0
    }
});

// 4. Districts Collection
db.createCollection("districts");

const hcmProvince = db.provinces.findOne({code: "79"});
const districtUnit = db.administrative_units.findOne({codeName: "quan"});

db.districts.insertMany([
    {
        _id: ObjectId(),
        code: "760",
        name: "Quận 1",
        nameEn: "District 1",
        fullName: "Quận 1",
        fullNameEn: "District 1",
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        administrativeUnit: {
            id: districtUnit._id,
            name: districtUnit.fullName,
            nameEn: districtUnit.fullNameEn
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
            wardCount: 0,
            locationCount: 0
        }
    },
    {
        _id: ObjectId(),
        code: "761",
        name: "Quận 2",
        nameEn: "District 2",
        fullName: "Quận 2",
        fullNameEn: "District 2",
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        administrativeUnit: {
            id: districtUnit._id,
            name: districtUnit.fullName,
            nameEn: districtUnit.fullNameEn
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
            wardCount: 0,
            locationCount: 0
        }
    },
    {
        _id: ObjectId(),
        code: "762",
        name: "Quận 3",
        nameEn: "District 3",
        fullName: "Quận 3",
        fullNameEn: "District 3",
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        administrativeUnit: {
            id: districtUnit._id,
            name: districtUnit.fullName,
            nameEn: districtUnit.fullNameEn
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
            wardCount: 0,
            locationCount: 0
        }
    }
]);

// 5. Wards Collection
db.createCollection("wards");

const district1 = db.districts.findOne({code: "760"});
const wardUnit = db.administrative_units.findOne({codeName: "phuong"});

db.wards.insertMany([
    {
        _id: ObjectId(),
        code: "26734",
        name: "Phường Bến Nghé",
        nameEn: "Ben Nghe Ward",
        fullName: "Phường Bến Nghé",
        fullNameEn: "Ben Nghe Ward",
        district: {
            id: district1._id,
            name: district1.name,
            nameEn: district1.nameEn,
            code: district1.code
        },
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        administrativeUnit: {
            id: wardUnit._id,
            name: wardUnit.fullName,
            nameEn: wardUnit.fullNameEn
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
            locationCount: 0
        }
    },
    {
        _id: ObjectId(),
        code: "26737",
        name: "Phường Bến Thành",
        nameEn: "Ben Thanh Ward",
        fullName: "Phường Bến Thành",
        fullNameEn: "Ben Thanh Ward",
        district: {
            id: district1._id,
            name: district1.name,
            nameEn: district1.nameEn,
            code: district1.code
        },
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        administrativeUnit: {
            id: wardUnit._id,
            name: wardUnit.fullName,
            nameEn: wardUnit.fullNameEn
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
            locationCount: 0
        }
    },
    {
        _id: ObjectId(),
        code: "26740",
        name: "Phường Cô Giang",
        nameEn: "Co Giang Ward",
        fullName: "Phường Cô Giang",
        fullNameEn: "Co Giang Ward",
        district: {
            id: district1._id,
            name: district1.name,
            nameEn: district1.nameEn,
            code: district1.code
        },
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        administrativeUnit: {
            id: wardUnit._id,
            name: wardUnit.fullName,
            nameEn: wardUnit.fullNameEn
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
            locationCount: 0
        }
    }
]);

// 6. Locations Collection
db.createCollection("locations");

const benNgheWard = db.wards.findOne({code: "26734"});
const benThanhWard = db.wards.findOne({code: "26737"});

db.locations.insertMany([
    {
        _id: ObjectId(),
        address: {
            line1: "Bitexco Financial Tower",
            line2: null,
            streetName: "Hải Triều",
            buildingName: "Bitexco Financial Tower",
            buildingNumber: "2",
            postalCode: "70000"
        },
        coordinates: {
            type: "Point",
            coordinates: [106.7019, 10.7717] // [longitude, latitude] for GeoJSON
        },
        ward: {
            id: benNgheWard._id,
            name: benNgheWard.name,
            nameEn: benNgheWard.nameEn,
            code: benNgheWard.code
        },
        district: {
            id: district1._id,
            name: district1.name,
            nameEn: district1.nameEn,
            code: district1.code
        },
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        locationType: "commercial",
        description: "Landmark skyscraper in District 1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Computed full address for search
        fullAddress: "2 Hải Triều, Bitexco Financial Tower, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
        fullAddressEn: "2 Hai Trieu, Bitexco Financial Tower, Ben Nghe Ward, District 1, Ho Chi Minh City"
    },
    {
        _id: ObjectId(),
        address: {
            line1: "Saigon Centre",
            line2: null,
            streetName: "Lê Lợi",
            buildingName: "Saigon Centre",
            buildingNumber: "65",
            postalCode: "70000"
        },
        coordinates: {
            type: "Point",
            coordinates: [106.7007, 10.7747]
        },
        ward: {
            id: benThanhWard._id,
            name: benThanhWard.name,
            nameEn: benThanhWard.nameEn,
            code: benThanhWard.code
        },
        district: {
            id: district1._id,
            name: district1.name,
            nameEn: district1.nameEn,
            code: district1.code
        },
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        locationType: "commercial",
        description: "Shopping and office complex",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        fullAddress: "65 Lê Lợi, Saigon Centre, Phường Bến Thành, Quận 1, Hồ Chí Minh",
        fullAddressEn: "65 Le Loi, Saigon Centre, Ben Thanh Ward, District 1, Ho Chi Minh City"
    },
    {
        _id: ObjectId(),
        address: {
            line1: "City Hall",
            line2: null,
            streetName: "Nguyễn Huệ",
            buildingName: "City Hall",
            buildingNumber: "86",
            postalCode: "70000"
        },
        coordinates: {
            type: "Point",
            coordinates: [106.7009, 10.7764]
        },
        ward: {
            id: benThanhWard._id,
            name: benThanhWard.name,
            nameEn: benThanhWard.nameEn,
            code: benThanhWard.code
        },
        district: {
            id: district1._id,
            name: district1.name,
            nameEn: district1.nameEn,
            code: district1.code
        },
        province: {
            id: hcmProvince._id,
            name: hcmProvince.name,
            nameEn: hcmProvince.nameEn,
            code: hcmProvince.code
        },
        locationType: "government",
        description: "Ho Chi Minh City Hall",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        fullAddress: "86 Nguyễn Huệ, City Hall, Phường Bến Thành, Quận 1, Hồ Chí Minh",
        fullAddressEn: "86 Nguyen Hue, City Hall, Ben Thanh Ward, District 1, Ho Chi Minh City"
    }
]);

// Create Indexes for Performance
// Provinces indexes
db.provinces.createIndex({ "code": 1 }, { unique: true });
db.provinces.createIndex({ "name": 1 });
db.provinces.createIndex({ "nameEn": 1 });
db.provinces.createIndex({ "isActive": 1 });

// Districts indexes
db.districts.createIndex({ "code": 1 }, { unique: true });
db.districts.createIndex({ "name": 1 });
db.districts.createIndex({ "province.id": 1 });
db.districts.createIndex({ "province.code": 1 });
db.districts.createIndex({ "isActive": 1 });

// Wards indexes
db.wards.createIndex({ "code": 1 }, { unique: true });
db.wards.createIndex({ "name": 1 });
db.wards.createIndex({ "district.id": 1 });
db.wards.createIndex({ "district.code": 1 });
db.wards.createIndex({ "province.id": 1 });
db.wards.createIndex({ "isActive": 1 });

// Locations indexes
db.locations.createIndex({ "coordinates": "2dsphere" }); // Geospatial index
db.locations.createIndex({ "ward.id": 1 });
db.locations.createIndex({ "district.id": 1 });
db.locations.createIndex({ "province.id": 1 });
db.locations.createIndex({ "address.postalCode": 1 });
db.locations.createIndex({ "locationType": 1 });
db.locations.createIndex({ "isActive": 1 });
db.locations.createIndex({ "fullAddress": "text", "fullAddressEn": "text" }); // Text search

// Compound indexes for common queries
db.locations.createIndex({ "province.code": 1, "district.code": 1, "ward.code": 1 });
db.locations.createIndex({ "isActive": 1, "locationType": 1 });

// Administrative units and regions indexes
db.administrative_units.createIndex({ "codeName": 1 });
db.administrative_regions.createIndex({ "codeName": 1 });

// Sample Queries and Aggregations

// 1. Find all locations in a specific province
function findLocationsByProvince(provinceName) {
    return db.locations.find({
        "province.name": { $regex: provinceName, $options: "i" },
        "isActive": true
    });
}

// 2. Search locations by address text
function searchLocationsByAddress(searchTerm) {
    return db.locations.find({
        $text: { $search: searchTerm },
        "isActive": true
    }).sort({ score: { $meta: "textScore" } });
}

// 3. Find locations within a radius (geospatial query)
function findLocationsNearby(longitude, latitude, maxDistanceMeters) {
    return db.locations.find({
        "coordinates": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistanceMeters
            }
        },
        "isActive": true
    });
}

// 4. Get complete administrative hierarchy
function getAdministrativeHierarchy() {
    return db.provinces.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: "districts",
                localField: "_id",
                foreignField: "province.id",
                as: "districts"
            }
        },
        {
            $unwind: {
                path: "$districts",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "wards",
                localField: "districts._id",
                foreignField: "district.id",
                as: "wards"
            }
        },
        {
            $unwind: {
                path: "$wards",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: {
                    provinceId: "$_id",
                    provinceName: "$name",
                    districtId: "$districts._id",
                    districtName: "$districts.name"
                },
                wards: { $push: "$wards" },
                locationCount: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: {
                    provinceId: "$_id.provinceId",
                    provinceName: "$_id.provinceName"
                },
                districts: {
                    $push: {
                        districtId: "$_id.districtId",
                        districtName: "$_id.districtName",
                        wards: "$wards",
                        locationCount: "$locationCount"
                    }
                }
            }
        }
    ]);
}

// 5. Update location statistics
function updateLocationStats() {
    // Update ward stats
    db.wards.aggregate([
        {
            $lookup: {
                from: "locations",
                localField: "_id",
                foreignField: "ward.id",
                as: "locations"
            }
        },
        {
            $addFields: {
                "stats.locationCount": { $size: "$locations" }
            }
        },
        { $out: "wards" }
    ]);

    // Update district stats
    db.districts.aggregate([
        {
            $lookup: {
                from: "wards",
                localField: "_id",
                foreignField: "district.id",
                as: "wards"
            }
        },
        {
            $lookup: {
                from: "locations",
                localField: "_id",
                foreignField: "district.id",
                as: "locations"
            }
        },
        {
            $addFields: {
                "stats.wardCount": { $size: "$wards" },
                "stats.locationCount": { $size: "$locations" }
            }
        },
        { $out: "districts" }
    ]);

    // Update province stats
    db.provinces.aggregate([
        {
            $lookup: {
                from: "districts",
                localField: "_id",
                foreignField: "province.id",
                as: "districts"
            }
        },
        {
            $lookup: {
                from: "wards",
                localField: "_id",
                foreignField: "province.id",
                as: "wards"
            }
        },
        {
            $lookup: {
                from: "locations",
                localField: "_id",
                foreignField: "province.id",
                as: "locations"
            }
        },
        {
            $addFields: {
                "stats.districtCount": { $size: "$districts" },
                "stats.wardCount": { $size: "$wards" },
                "stats.locationCount": { $size: "$locations" }
            }
        },
        { $out: "provinces" }
    ]);
}

// 6. Validation Schema (MongoDB 3.6+)
db.createCollection("locations_with_validation", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["address", "ward", "district", "province", "isActive"],
            properties: {
                address: {
                    bsonType: "object",
                    required: ["line1"],
                    properties: {
                        line1: { bsonType: "string", minLength: 1 },
                        line2: { bsonType: ["string", "null"] },
                        streetName: { bsonType: ["string", "null"] },
                        buildingName: { bsonType: ["string", "null"] },
                        buildingNumber: { bsonType: ["string", "null"] },
                        postalCode: { bsonType: ["string", "null"] }
                    }
                },
                coordinates: {
                    bsonType: "object",
                    required: ["type", "coordinates"],
                    properties: {
                        type: { enum: ["Point"] },
                        coordinates: {
                            bsonType: "array",
                            minItems: 2,
                            maxItems: 2,
                            items: { bsonType: "double" }
                        }
                    }
                },
                locationType: {
                    enum: ["residential", "commercial", "industrial", "government", "educational", "healthcare", "other"]
                },
                isActive: { bsonType: "bool" }
            }
        }
    }
});

// Example usage:
print("=== Sample Queries ===");
print("1. Find locations in Ho Chi Minh City:");
print(findLocationsByProvince("Hồ Chí Minh").count());

print("2. Search locations by text:");
print(searchLocationsByAddress("Bitexco").count());

print("3. Find locations within 1km of coordinates:");
print(findLocationsNearby(106.7019, 10.7717, 1000).count());

print("Database setup completed successfully!");
