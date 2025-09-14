"use client";

import UserSearch from "@/components/search/UserSearch";
import { useParams, useSearchParams } from "next/navigation";

export default function UserSearchWithPlanner() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Get plannerId from URL params (e.g., /planner/[plannerId]/add-tripmate)
  const plannerId =
    (params.plannerId as string) || searchParams.get("plannerId");

  const handleUserSelect = (user: any) => {
    console.log("User selected for planner:", user);
    // Optional: Thêm logic khác nếu cần
  };

  if (!plannerId) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">
            No plannerId found. Please make sure you access this page with a
            valid planner ID.
          </p>
          <p className="text-sm text-red-500 mt-2">
            Expected URL format: /planner/[plannerId]/add-tripmate or
            ?plannerId=xxx
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Add Tripmate to Planner</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">Current Planner ID:</h3>
        <code className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">
          {plannerId}
        </code>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Search and Add Tripmate
          </h2>
          <UserSearch
            onUserSelect={handleUserSelect}
            placeholder="Search users by email to add as tripmate..."
            plannerId={plannerId}
          />
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">How it works:</h3>
          <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Search for a user by their email address</li>
            <li>Select the user from the search results</li>
            <li>A tag will appear showing the selected user</li>
            <li>
              Click "Send Email" to add them as a tripmate to this planner
            </li>
            <li>The user will be added to the planner's tripmates list</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
