"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { getUserByEmail } from "@/lib/actions/user.action";
import { FaUser, FaEnvelope } from "react-icons/fa";
import TruncateText from "../typography/TruncateText";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface UserSearchProps {
  onUserSelect?: (user: any) => void;
  placeholder?: string;
  maxResults?: number;
}

const UserSearch = ({
  onUserSelect,
  placeholder = "Search users by email address",
  maxResults = 5,
}: UserSearchProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null); // Track selected user
  const [justSelected, setJustSelected] = useState(false); // Track if user just selected an item
  const searchContainerRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle user selection
  const handleUserSelect = (user: any) => {
    const userData = {
      id: user._id,
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      image: user.image || "",
      location: user.location || "",
      portfolio: user.portfolio || "",
      reputation: user.reputation || 0,
      phone: user.phone || "",
    };

    console.log("handleUserSelect", userData);

    // Set selected user and update input with username or name
    setSelectedUser(userData);
    setSearch(userData.username || userData.name || userData.email);

    // Call parent callback if provided
    if (onUserSelect) {
      onUserSelect(userData);
    } else {
      // Default behavior: store in URL for other components to pick up
      const params = new URLSearchParams(searchParams);
      params.set("selectedUser", JSON.stringify(userData));
      params.set("action", "addUser");
      router.push(`?${params.toString()}`, { scroll: false });
    }

    // Close search and mark as just selected
    setIsOpen(false);
    setJustSelected(true);

    console.log("User selected:", userData);
  };

  // Handle input change - clear selected user when typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Clear selected user when user starts typing
    if (
      selectedUser &&
      value !== selectedUser.username &&
      value !== selectedUser.name &&
      value !== selectedUser.email
    ) {
      setSelectedUser(null);
    }

    if (!isOpen && value.trim()) setIsOpen(true);
    if (value === "" && isOpen) setIsOpen(false);
  };

  // Handle clear/remove selected user
  const handleClearUser = () => {
    setSelectedUser(null);
    setSearch("");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        // @ts-expect-error Property 'contains' does not exist on type 'EventTarget | null'.
        !searchContainerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        // Don't clear search if user is selected - keep their username/name in input
        if (!selectedUser) {
          setSearch("");
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!search.trim()) {
      setResult([]);
      setIsLoading(false);
      return;
    }

    // Reset just selected flag when user starts typing again
    if (justSelected) {
      setJustSelected(false);
    }

    // Don't search if user is selected and input matches user info
    if (
      selectedUser &&
      (search === selectedUser.username ||
        search === selectedUser.name ||
        search === selectedUser.email)
    ) {
      setResult([]);
      setIsLoading(false);
      return;
    }

    // Basic email validation check before making API call
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(search)) {
      setResult([]);
      setIsLoading(false);
      return;
    }

    setResult([]);
    setIsLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const userResponse: any = await getUserByEmail({
          email: search,
        });

        if (userResponse?.success && userResponse?.data) {
          setResult([userResponse.data]); // Single user result
        } else {
          setResult([]);
        }
      } catch (error) {
        console.error("💥 Error searching user:", error);
        setResult([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Slightly longer delay for email lookup

    return () => clearTimeout(delayDebounceFn);
  }, [search, justSelected, selectedUser]);

  const renderUserItem = (user: any) => (
    <div
      key={user._id}
      className="cursor-pointer hover:bg-slate-200 flex items-start gap-3 rounded-md p-3 transition-colors"
      onClick={() => handleUserSelect(user)}
    >
      <div className="flex-shrink-0">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUser size={16} className="text-blue-600" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-gray-900 truncate">
          {user.name}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <FaEnvelope size={12} className="text-gray-400" />
          <TruncateText
            text={user.email}
            className="text-xs text-gray-600"
            maxLength={40}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-[600px]" ref={searchContainerRef}>
      {/* Selected User Display */}

      {/* Input Field */}
      <div className="relative">
        <Input
          type="email"
          value={search}
          placeholder={
            selectedUser ? "Search for another user..." : placeholder
          }
          className={`bg-[#f3f4f5] text-black h-[56px] border-none outline-none no-focus pr-10 ${
            selectedUser ? "bg-gray-50" : ""
          }`}
          onChange={handleInputChange}
        />
      </div>
      {selectedUser && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {selectedUser.image ? (
              <img
                src={selectedUser.image}
                alt={selectedUser.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <FaUser size={12} className="text-blue-600" />
            )}
            <span className="font-medium">
              {selectedUser.username || selectedUser.name}
            </span>
            <button
              onClick={handleClearUser}
              className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
              type="button"
            >
              ×
            </button>
          </div>
          <Textarea
            defaultValue={
              "Check out my trip plan on Traveler! We can collaborate in real time, have all our travel reservations in one place, and so much more. Let’s plan the best trip ever!"
            }
            rows={5}
          />
          <div className="w-full flex justify-end items-end">
            <Button
              onClick={() => {
                console.log("Update tripmate ");
              }}
              className="bg-primary-500 text-white hover:bg-[#fe9a4d]"
            >
              Send Email
            </Button>
          </div>
        </div>
      )}
      {/* Dropdown Results */}
      {isOpen && search.trim() && !justSelected && (
        <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-white py-2 shadow-lg border border-gray-200 dark:bg-dark-400 dark:border-dark-300">
          {isLoading ? (
            <div className="flex-center flex-col px-5 py-8">
              <ReloadIcon className="my-2 h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-600 text-sm">Searching users...</p>
            </div>
          ) : result.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  User found
                </p>
              </div>
              <div className="py-1">{result.map(renderUserItem)}</div>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <FaUser size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">
                No user found for "{search}"
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Try entering a complete, valid email address
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
