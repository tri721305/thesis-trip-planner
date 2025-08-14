// Example usage of createPlanner function
import { createPlanner } from "@/lib/actions/planner.action";

// Sample data matching user's requirement
const samplePlannerData = {
  title: "Welcome to Hồ Chí Minh city",
  destination: {
    name: "thành phố Hồ Chí Minh",
    coordinates: [106.673, 10.853] as [number, number],
    type: "province" as const,
    provinceId: "29",
    wardId: "2687",
  },
  startDate: "2025-08-13T17:00:00.000Z",
  endDate: "2025-08-16T16:59:59.999Z",
  type: "public" as const,
};

// Usage example:
export async function createPlannerExample() {
  try {
    const result = await createPlanner(samplePlannerData);

    if (result.success) {
      console.log("✅ Planner created successfully!");
      console.log("Planner ID:", result.data?._id);
      console.log("Title:", result.data?.title);
      console.log("Destination:", result.data?.destination);
      console.log("Dates:", {
        start: result.data?.startDate,
        end: result.data?.endDate,
      });
      return result.data;
    } else {
      console.error("❌ Failed to create planner:");
      console.error(result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
}

// Example for province-type destination
export const exampleProvinceDestination = {
  title: "Explore Da Nang",
  destination: {
    name: "Đà Nẵng",
    coordinates: [108.2208, 16.0544] as [number, number],
    type: "province" as const,
    provinceId: "48",
  },
  startDate: "2025-09-01T17:00:00.000Z",
  endDate: "2025-09-05T16:59:59.999Z",
  type: "public" as const,
};

// Example for ward-type destination
export const exampleWardDestination = {
  title: "Visit District 1 attractions",
  destination: {
    name: "Quận 1, TP. Hồ Chí Minh",
    coordinates: [106.7017, 10.7769] as [number, number],
    type: "ward" as const,
    wardId: "76001",
  },
  startDate: "2025-10-15T17:00:00.000Z",
  endDate: "2025-10-18T16:59:59.999Z",
  type: "friend" as const,
};

// Private planner example
export const examplePrivatePlanner = {
  title: "Personal Sapa Trip",
  destination: {
    name: "Sapa, Lào Cai",
    coordinates: [103.8449, 22.3364] as [number, number],
    type: "province" as const,
    provinceId: "10",
  },
  startDate: "2025-12-01T17:00:00.000Z",
  endDate: "2025-12-07T16:59:59.999Z",
  type: "private" as const,
};
