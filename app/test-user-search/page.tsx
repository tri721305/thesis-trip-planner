"use client";

import UserSearch from "@/components/search/UserSearch";
import { useState } from "react";

export default function TestUserSearchPage() {
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const handleUserSelect = (user: any) => {
    console.log("User selected:", user);
    // Thêm user vào danh sách nếu chưa có
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (!exists) {
        return [...prev, user];
      }
      return prev;
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test UserSearch Component</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">
            UserSearch with Tag Selection
          </h2>
          <UserSearch
            onUserSelect={handleUserSelect}
            placeholder="Search users by email..."
          />
        </div>

        {/* Display selected users list */}
        {selectedUsers.length > 0 && (
          <div>
            <h3 className="text-md font-medium mb-3">Selected Users:</h3>
            <div className="space-y-2">
              {selectedUsers.map((user, index) => (
                <div
                  key={user.id || index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {user.name} (@{user.username || "no-username"})
                    </div>
                    <div className="text-xs text-gray-600">{user.email}</div>
                  </div>

                  <button
                    onClick={() => removeUser(user.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">
            Testing Instructions:
          </h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Type a valid email address in the search box</li>
            <li>Select a user from the dropdown</li>
            <li>
              Notice the username appears in the input and a tag is shown above
            </li>
            <li>
              Try typing in the input again - it should clear the selection
            </li>
            <li>Use the "×" button to remove the selected user tag</li>
            <li>Test with multiple user selections</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
