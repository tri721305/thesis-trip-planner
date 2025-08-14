/**
 * Utility functions for handling destination data in travel plans
 */

export interface LocationData {
  displayName?: string;
  ten?: string;
  tenhc?: string;
  coordinates?: [number, number];
  tinh?: string;
  ma_tinh?: string;
  ma_huyen?: string;
  ma_xa?: string;
  [key: string]: any;
}

export interface DestinationInfo {
  name: string;
  coordinates: [number, number];
  type: "province" | "ward";
  provinceId?: string;
  wardId?: string;
}

/**
 * Normalize destination name for consistent searching and statistics
 */
export const normalizeDestinationName = (name: string): string => {
  if (!name) return "";

  return (
    name
      .toLowerCase()
      .trim()
      // Replace common variations
      .replace(/thành phố/gi, "tp")
      .replace(/tỉnh/gi, "")
      .replace(/hồ chí minh|ho chi minh|hcmc/gi, "hcm")
      .replace(/hà nội|ha noi|hanoi/gi, "hanoi")
      .replace(/đà nẵng|da nang|danang/gi, "danang")
      .replace(/cần thơ|can tho/gi, "cantho")
      .replace(/hải phòng|hai phong/gi, "haiphong")
      .replace(/nha trang/gi, "nhatrang")
      .replace(/vũng tàu|vung tau/gi, "vungtau")
      .replace(/phú quốc|phu quoc/gi, "phuquoc")
      .replace(/sapa|sa pa/gi, "sapa")
      .replace(/đà lạt|da lat/gi, "dalat")
      .replace(/hội an|hoi an/gi, "hoian")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      .trim()
  );
};

/**
 * Extract location information from ProvinceWardSearch result
 */
export const extractLocationInfo = (place: LocationData): DestinationInfo => {
  const name =
    place.displayName || place.ten || place.tenhc || "Unknown Location";
  const coordinates: [number, number] = place.coordinates || [0, 0];

  let provinceId: string | undefined;
  let wardId: string | undefined;
  let type: "province" | "ward" = "province"; // Default to province

  // Determine type and IDs based on available data
  if (place.ma_xa) {
    // If has ward code, it's a ward-level location
    wardId = place.ma_xa;
    type = "ward";
  } else if (place.ma_huyen) {
    // If has district code, it's a ward-level location
    wardId = place.ma_huyen;
    type = "ward";
  } else if (place.ma_tinh || place.tinh) {
    // If only has province code, it's a province-level location
    provinceId = place.ma_tinh || place.tinh;
    type = "province";
  }

  return {
    name,
    coordinates,
    type,
    provinceId,
    wardId,
  };
};

/**
 * Create search-friendly destination query
 */
export const createDestinationQuery = (searchTerm: string) => {
  const normalizedTerm = normalizeDestinationName(searchTerm);

  return {
    $or: [
      { "destination.name": { $regex: searchTerm, $options: "i" } },
      { "destination.name": { $regex: normalizedTerm, $options: "i" } },
    ],
  };
};

/**
 * Get popular destination variations for a given location
 */
export const getDestinationVariations = (location: string): string[] => {
  const variations: { [key: string]: string[] } = {
    hcm: [
      "hồ chí minh",
      "ho chi minh",
      "hcmc",
      "saigon",
      "sài gòn",
      "thành phố hồ chí minh",
    ],
    hanoi: ["hà nội", "ha noi", "thủ đô", "thu do"],
    danang: ["đà nẵng", "da nang"],
    cantho: ["cần thơ", "can tho"],
    haiphong: ["hải phòng", "hai phong"],
    nhatrang: ["nha trang"],
    vungtau: ["vũng tàu", "vung tau"],
    phuquoc: ["phú quốc", "phu quoc"],
    sapa: ["sa pa"],
    dalat: ["đà lạt", "da lat"],
    hoian: ["hội an", "hoi an"],
  };

  const normalized = normalizeDestinationName(location);
  return variations[normalized] || [location];
};

/**
 * Format destination for display
 */
export const formatDestinationDisplay = (destination: any): string => {
  if (!destination) return "Unknown Destination";

  // Simple format: just the destination name
  return destination.name || "Unknown Destination";
};

/**
 * Calculate distance between two coordinates (in km)
 */
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (coordinates: [number, number]): boolean => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }

  const [longitude, latitude] = coordinates;
  return (
    longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
  );
};

/**
 * Get Vietnam province mapping for common destinations
 */
export const getVietnamProvinceMapping = (): {
  [key: string]: { id: string; name: string };
} => {
  return {
    hcm: { id: "79", name: "Thành phố Hồ Chí Minh" },
    hanoi: { id: "01", name: "Thành phố Hà Nội" },
    danang: { id: "48", name: "Thành phố Đà Nẵng" },
    cantho: { id: "92", name: "Thành phố Cần Thơ" },
    haiphong: { id: "31", name: "Thành phố Hải Phòng" },
    // Add more mappings as needed
  };
};
