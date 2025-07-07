import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

/**
 * Ward Service - Location-based services for travel planning
 *
 * This service provides ward-level location functionality for the travel application
 * Built on top of the imported Vietnamese administrative ward database (3,251 wards)
 */

export class WardService {
  /**
   * Initialize database connection
   */
  static async initialize() {
    await dbConnect();
  }

  /**
   * Search wards by name with autocomplete support
   */
  static async searchWards(query: string, limit: number = 10) {
    return await Ward.find({
      $or: [
        { tenhc: { $regex: query, $options: "i" } },
        { tentinh: { $regex: query, $options: "i" } },
      ],
    })
      .select("tenhc tentinh ma matinh kinhdo vido")
      .limit(limit)
      .lean();
  }

  /**
   * Get ward by ID with full details
   */
  static async getWardById(wardId: string) {
    return await Ward.findById(wardId).lean();
  }

  /**
   * Get wards by province
   */
  static async getWardsByProvince(provinceName: string) {
    return await Ward.find({ tentinh: provinceName })
      .select("tenhc ma kinhdo vido dientichkm2 dansonguoi")
      .sort({ tenhc: 1 })
      .lean();
  }

  /**
   * Find wards near a location (requires geometry)
   */
  static async findNearbyWards(
    longitude: number,
    latitude: number,
    maxDistanceKm: number = 10
  ) {
    return await Ward.find({
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceKm * 1000, // Convert to meters
        },
      },
    })
      .select("tenhc tentinh ma kinhdo vido")
      .limit(20)
      .lean();
  }

  /**
   * Get ward by coordinates (point-in-polygon lookup)
   */
  static async getWardByLocation(longitude: number, latitude: number) {
    return await Ward.findOne({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
    })
      .select("tenhc tentinh ma matinh kinhdo vido")
      .lean();
  }

  /**
   * Get all provinces with ward counts
   */
  static async getProvinceStats() {
    return await Ward.aggregate([
      {
        $group: {
          _id: "$tentinh",
          wardCount: { $sum: 1 },
          avgArea: { $avg: "$dientichkm2" },
          totalPopulation: { $sum: "$dansonguoi" },
        },
      },
      { $sort: { wardCount: -1 } },
    ]);
  }

  /**
   * Get ward hierarchy (province -> wards)
   */
  static async getWardHierarchy() {
    const provinces = await Ward.distinct("tentinh");
    const hierarchy = [];

    for (const province of provinces) {
      const wards = await Ward.find({ tentinh: province })
        .select("tenhc ma")
        .sort({ tenhc: 1 })
        .lean();

      hierarchy.push({
        province,
        wards,
      });
    }

    return hierarchy;
  }

  /**
   * Validate if coordinates are within Vietnam
   */
  static async isLocationInVietnam(
    longitude: number,
    latitude: number
  ): Promise<boolean> {
    const ward = await this.getWardByLocation(longitude, latitude);
    return ward !== null;
  }

  /**
   * Get statistics for dashboard
   */
  static async getDashboardStats() {
    const totalWards = await Ward.countDocuments();
    const wardsWithGeometry = await Ward.countDocuments({
      geometry: { $exists: true, $ne: null },
    });
    const provinces = await Ward.distinct("tentinh");

    return {
      totalWards,
      wardsWithGeometry,
      wardsWithoutGeometry: totalWards - wardsWithGeometry,
      geometryCoverage: ((wardsWithGeometry / totalWards) * 100).toFixed(2),
      totalProvinces: provinces.length,
    };
  }
}

export default WardService;
