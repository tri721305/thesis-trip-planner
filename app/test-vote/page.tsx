"use client";

import { Suspense, useEffect, useState } from "react";
import { VoteButtons, VoteStats } from "@/components/votes";
import AuthDebug from "@/components/debug/AuthDebug";

// Mock guide data - will be replaced with real data from API
const mockGuide = {
  _id: "test-guide-id-replace-me",
  title: "Test Guide for Voting",
  upvotes: 5,
  downvotes: 2,
  views: 123,
  comments: 8,
};

export default function VoteTestPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedGuide, setSelectedGuide] = useState(mockGuide);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixingGuides, setFixingGuides] = useState(false);
  const [fixMessage, setFixMessage] = useState<string | null>(null);

  // Fix guides without author
  const handleFixGuides = async () => {
    setFixingGuides(true);
    setFixMessage(null);

    try {
      const response = await fetch("/api/test/fix-guides-author", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setFixMessage(`✅ ${result.message}`);
        // Refresh guides after fixing
        fetchGuides();
      } else {
        setFixMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setFixMessage(`❌ Failed to fix guides: ${error}`);
    } finally {
      setFixingGuides(false);
    }
  };

  // Fetch guides from API
  const fetchGuides = async () => {
    try {
      const response = await fetch("/api/test/guides");
      const data = await response.json();

      if (data.success && data.guides.length > 0) {
        setGuides(data.guides);
        setSelectedGuide(data.guides[0]); // Use first guide as default
      } else {
        setError("No guides found in database");
      }
    } catch (err) {
      setError("Failed to fetch guides");
      console.error("Error fetching guides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guides for testing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Vote System Test</h1>
          <p className="text-gray-600">
            Testing the voting functionality for guides
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              Make sure you have guides in your database or create one first.
            </p>
          </div>
        )}

        {/* Fix Message */}
        {fixMessage && (
          <div
            className={`border p-4 rounded-lg ${fixMessage.startsWith("✅") ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            <p
              className={
                fixMessage.startsWith("✅") ? "text-green-700" : "text-red-700"
              }
            >
              {fixMessage}
            </p>
          </div>
        )}

        {/* Fix Guides Button */}
        <div className=" p-4 rounded-lg">
          <h3 className="text-yellow-800 font-semibold mb-2">
            Database Maintenance
          </h3>
          <p className="text-yellow-700 mb-3">
            If you're getting "Content does not have an author" errors, click
            below to fix guides without authors:
          </p>
          <button
            onClick={handleFixGuides}
            disabled={fixingGuides}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              fixingGuides
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {fixingGuides ? "Fixing..." : "Fix Guides Without Author"}
          </button>
        </div>

        {guides.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Available Guides ({guides.length})
              </h2>
              <select
                value={selectedGuide._id}
                onChange={(e) => {
                  const guide = guides.find((g) => g._id === e.target.value);
                  if (guide) setSelectedGuide(guide);
                }}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {guides.map((guide) => (
                  <option key={guide._id} value={guide._id}>
                    {guide.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Guide: {selectedGuide.title}
                </h3>
                <div className="text-sm text-gray-600 mb-4">
                  Guide ID:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {selectedGuide._id}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  Vote Statistics (Read-only)
                </h3>
                <VoteStats
                  upvotes={selectedGuide.upvotes}
                  downvotes={selectedGuide.downvotes}
                  views={selectedGuide.views}
                  comments={selectedGuide.comments}
                  showLabels={true}
                  className="p-4 bg-gray-50 rounded-lg"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Interactive Voting</h3>
                <div className="p-4 border rounded-lg">
                  <Suspense fallback={<div>Loading vote buttons...</div>}>
                    <VoteButtons
                      targetId={selectedGuide._id}
                      targetType="guide"
                      upvotes={selectedGuide.upvotes}
                      downvotes={selectedGuide.downvotes}
                      className=""
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Debug */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
          <AuthDebug />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Testing Instructions
          </h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Make sure you're logged in to test voting functionality</li>
            <li>• Select a guide from the dropdown above</li>
            <li>• Click upvote/downvote buttons to test the voting system</li>
            <li>• Vote counts should update in real-time</li>
            <li>
              • You can change your vote or remove it by clicking the same
              button
            </li>
            <li>• Check the database to verify vote records are created</li>
            <li>• Use GuideForm page for testing with guides you're editing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
