// Example usage of updatePlanner function
import {
  updatePlanner,
  partialUpdatePlanner,
  addTripmate,
  addLodging,
} from "@/lib/actions/planner.action";

// Example 1: Update basic information only
export const updateBasicInfo = async (plannerId: string) => {
  try {
    const result = await updatePlanner({
      plannerId,
      title: "Updated Trip to Ho Chi Minh City",
      note: "Added some new notes about the trip",
      generalTips: "Remember to bring sunscreen and comfortable shoes",
    });

    if (result.success) {
      console.log("✅ Planner updated successfully!");
      console.log("Updated title:", result.data?.title);
      return result.data;
    } else {
      console.error("❌ Failed to update planner:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 2: Update dates and regenerate route details
export const updateDatesAndDetails = async (plannerId: string) => {
  try {
    const result = await updatePlanner({
      plannerId,
      startDate: "2025-09-01T17:00:00.000Z",
      endDate: "2025-09-07T16:59:59.999Z",
      details: [
        {
          type: "route",
          name: "Day 1 - Arrival",
          index: 1,
          data: [
            {
              type: "note",
              content: "Arrive at Tan Son Nhat Airport at 2:00 PM",
            },
            {
              type: "checklist",
              items: ["Pick up luggage", "Get taxi to hotel", "Check in"],
              completed: [false, false, false],
            },
          ],
        },
        {
          type: "route",
          name: "Day 2 - City Exploration",
          index: 2,
          data: [
            {
              type: "place",
              name: "Independence Palace",
              address:
                "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
              description: "Historical landmark and former presidential palace",
            },
          ],
        },
      ],
    });

    if (result.success) {
      console.log("✅ Dates and details updated successfully!");
      return result.data;
    } else {
      console.error("❌ Failed to update:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 3: Update tripmates
export const updateTripmates = async (plannerId: string) => {
  try {
    const result = await updatePlanner({
      plannerId,
      tripmates: [
        {
          name: "Alice Johnson",
          email: "alice@example.com",
          image: "https://example.com/alice.jpg",
          userId: "64a7b8c9d0e1f2a3b4c5d6e7",
        },
        {
          name: "Bob Smith",
          email: "bob@example.com",
          userId: "64a7b8c9d0e1f2a3b4c5d6e8",
        },
        {
          name: "Charlie Brown",
          email: "charlie@example.com",
        },
      ],
    });

    if (result.success) {
      console.log("✅ Tripmates updated successfully!");
      console.log("Number of tripmates:", result.data?.tripmates?.length);
      return result.data;
    } else {
      console.error("❌ Failed to update tripmates:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 4: Update lodging information
export const updateLodging = async (plannerId: string) => {
  try {
    const result = await updatePlanner({
      plannerId,
      lodging: [
        {
          name: "Sheraton Saigon Hotel & Towers",
          address: "88 Đồng Khởi, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
          checkIn: "2025-09-01T14:00:00.000Z",
          checkOut: "2025-09-07T12:00:00.000Z",
          confirmation: "SHE123456789",
          notes: "Executive floor room with city view",
          cost: {
            type: "VND",
            value: 4500000,
          },
        },
        {
          name: "Backup Hotel Option",
          address: "Alternative location",
          notes: "In case first hotel is unavailable",
        },
      ],
    });

    if (result.success) {
      console.log("✅ Lodging updated successfully!");
      console.log("Number of accommodations:", result.data?.lodging?.length);
      return result.data;
    } else {
      console.error("❌ Failed to update lodging:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 5: Complete update with all information
export const updateFullPlanner = async (plannerId: string) => {
  try {
    const result = await updatePlanner({
      plannerId,
      title: "Complete Ho Chi Minh City Adventure",
      image: "https://example.com/updated-hcmc-cover.jpg",
      note: "Comprehensive travel plan with all details updated",
      generalTips:
        "Best time to visit is during dry season. Try local street food!",
      destination: {
        name: "Thành phố Hồ Chí Minh",
        coordinates: [106.6297, 10.8231],
        type: "province",
        provinceId: "79",
      },
      startDate: "2025-10-01T17:00:00.000Z",
      endDate: "2025-10-05T16:59:59.999Z",
      type: "public",
      state: "confirmed",
      tripmates: [
        {
          name: "Updated Tripmate",
          email: "updated@example.com",
        },
      ],
      lodging: [
        {
          name: "Updated Hotel",
          address: "Updated Address",
          cost: {
            type: "VND",
            value: 2000000,
          },
        },
      ],
      details: [
        {
          type: "route",
          name: "Updated Day 1",
          index: 1,
          data: [
            {
              type: "note",
              content: "Updated arrival instructions",
            },
          ],
        },
      ],
    });

    if (result.success) {
      console.log("✅ Complete planner update successful!");
      console.log("Updated planner:", {
        id: result.data?._id,
        title: result.data?.title,
        state: result.data?.state,
        triplates: result.data?.tripmates?.length,
        lodging: result.data?.lodging?.length,
        details: result.data?.details?.length,
      });
      return result.data;
    } else {
      console.error("❌ Failed to update planner:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 6: Update state only (useful for workflow management)
export const updatePlannerState = async (
  plannerId: string,
  newState: "planning" | "confirmed" | "ongoing" | "completed" | "cancelled"
) => {
  try {
    const result = await updatePlanner({
      plannerId,
      state: newState,
    });

    if (result.success) {
      console.log(`✅ Planner state updated to: ${newState}`);
      return result.data;
    } else {
      console.error("❌ Failed to update state:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Additional examples for helper functions
// Example 7: Partial update - only title and note
export const updateTitleAndNote = async (plannerId: string) => {
  try {
    const result = await partialUpdatePlanner({
      plannerId,
      title: "Quick Updated Title",
      note: "Just updating the note without affecting other fields",
    });

    if (result.success) {
      console.log("✅ Title and note updated successfully!");
      return result.data;
    } else {
      console.error("❌ Failed to partial update:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 8: Add single tripmate without affecting existing ones
export const addSingleTripmate = async (plannerId: string) => {
  try {
    const result = await addTripmate({
      plannerId,
      tripmate: {
        name: "New Travel Buddy",
        email: "newbuddy@example.com",
        userId: "64a7b8c9d0e1f2a3b4c5d6e9",
      },
    });

    if (result.success) {
      console.log("✅ New tripmate added successfully!");
      console.log("Total tripmates:", result.data?.tripmates?.length);
      return result.data;
    } else {
      console.error("❌ Failed to add tripmate:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 9: Add single lodging without affecting existing ones
export const addSingleLodging = async (plannerId: string) => {
  try {
    const result = await addLodging({
      plannerId,
      lodging: {
        name: "Additional Hotel Option",
        address: "123 Backup Street, District 3, Ho Chi Minh City",
        checkIn: "2025-09-01T15:00:00.000Z",
        checkOut: "2025-09-07T11:00:00.000Z",
        notes: "Backup accommodation option",
        cost: {
          type: "VND",
          value: 2500000,
        },
      },
    });

    if (result.success) {
      console.log("✅ New lodging added successfully!");
      console.log("Total lodging options:", result.data?.lodging?.length);
      return result.data;
    } else {
      console.error("❌ Failed to add lodging:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 10: Update only the planner state (workflow management)
export const markPlannerAsConfirmed = async (plannerId: string) => {
  try {
    const result = await partialUpdatePlanner({
      plannerId,
      state: "confirmed",
    });

    if (result.success) {
      console.log("✅ Planner marked as confirmed!");
      return result.data;
    } else {
      console.error("❌ Failed to confirm planner:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

// Example 11: Update only destination
export const updateDestination = async (plannerId: string) => {
  try {
    const result = await partialUpdatePlanner({
      plannerId,
      destination: {
        name: "Updated Destination Name",
        coordinates: [106.6297, 10.8231],
        type: "province",
        provinceId: "79",
      },
    });

    if (result.success) {
      console.log("✅ Destination updated successfully!");
      console.log("New destination:", result.data?.destination);
      return result.data;
    } else {
      console.error("❌ Failed to update destination:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};
