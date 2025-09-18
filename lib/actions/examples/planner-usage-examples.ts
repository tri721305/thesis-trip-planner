// Examples of how to use the new planner functions

import { getPlannerByUserId, getRecentPlanners } from "../planner.action";

/**
 * Example 1: Get all planners for current user
 */
export async function getAllMyPlanners() {
  const result = await getPlannerByUserId({
    // No userId provided - will use current user from session
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (result.success) {
    console.log(`Found ${result.data.total} total planners`);
    console.log(`Showing ${result.data.planners.length} planners`);
    console.log(`Has more: ${result.data.hasMore}`);
    return result.data.planners;
  } else {
    console.error("Error:", result.error?.message);
    return [];
  }
}

/**
 * Example 2: Get only ongoing planners for current user
 */
export async function getMyOngoingPlanners() {
  const result = await getPlannerByUserId({
    state: "ongoing",
    sortBy: "startDate",
    sortOrder: "asc",
  });

  if (result.success) {
    return result.data.planners;
  } else {
    console.error("Error:", result.error?.message);
    return [];
  }
}

/**
 * Example 3: Get planners for a specific user (admin use case)
 */
export async function getPlannersForUser(userId: string) {
  const result = await getPlannerByUserId({
    userId,
    limit: 10,
    sortBy: "title",
    sortOrder: "asc",
  });

  if (result.success) {
    return result.data.planners;
  } else {
    console.error("Error:", result.error?.message);
    return [];
  }
}

/**
 * Example 4: Get recent planners for dashboard
 */
export async function getDashboardPlanners() {
  const result = await getRecentPlanners({
    limit: 5,
  });

  if (result.success) {
    return result.data;
  } else {
    console.error("Error:", result.error?.message);
    return [];
  }
}

/**
 * Example 5: Pagination example
 */
export async function getPaginatedPlanners(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  
  const result = await getPlannerByUserId({
    limit: pageSize,
    offset,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (result.success) {
    return {
      planners: result.data.planners,
      total: result.data.total,
      hasMore: result.data.hasMore,
      currentPage: page,
      totalPages: Math.ceil(result.data.total / pageSize),
    };
  } else {
    throw new Error(result.error?.message || "Failed to fetch planners");
  }
}

/**
 * Example 6: Filter planners by multiple criteria
 */
export async function getFilteredPlanners(filters: {
  state?: "planning" | "ongoing" | "completed" | "cancelled";
  sortBy?: "createdAt" | "startDate" | "title";
  sortOrder?: "asc" | "desc";
}) {
  const result = await getPlannerByUserId({
    state: filters.state,
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
    limit: 20,
  });

  if (result.success) {
    return result.data.planners;
  } else {
    console.error("Error:", result.error?.message);
    return [];
  }
}
