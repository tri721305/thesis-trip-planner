"use client";

import GuideContent from "@/components/GuideContent";
import GuideHeader from "@/components/GuideHeader";
import Map from "@/components/Map";
import SidebarDetail from "@/components/sidebar/SidebarDetail";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InputFile } from "@/components/upload/UploadImg";
import TravelGuide from "@/database/newguide.model";
import { createGuide } from "@/lib/actions/newguide.action";
import { testValidation } from "@/lib/actions/test-validation.action";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
const mockUpData = {
  title: "Hanoi Travel Guide",
  note: "A comprehensive guide to exploring Hanoi, Vietnam.",
  generalTips: "Essential tips for navigating Hanoi...",
  lodging: [
    {
      name: "Rex Hotel",
      address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh city",
      checkIn: "2024-12-15T14:00:00Z", // Changed to string
      checkOut: "2024-12-18T11:00:00Z", // Changed to string
      confirmation: "",
      notes:
        "Rex Hotel is a historic hotel known for its rooftop bar and central location.",
      cost: {
        type: "VND",
        value: 2000000,
      },
    },
  ],
  details: [
    {
      type: "route", // Đây là route
      name: "Day 1",
      index: 1,
      data: [
        // data chứa các items
        {
          type: "note",
          content:
            "Start your journey at Ben Thanh Market, a bustling hub of local culture and cuisine.",
        },
        {
          type: "checklist",
          items: ["bag", "passport", "camera"],
          completed: [false, false, false],
        },
        {
          type: "place",
          name: "Rex Hotel",
          address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City",
          description:
            "A historic hotel known for its rooftop bar and central location.",
          tags: ["hotel", "luxury", "central"],
          phone: "+84 28 3829 2185",
          images: ["https://example.com/rex-hotel-1.jpg"],
          website: "https://www.rexhotelvietnam.com/",
          location: {
            type: "Point",
            coordinates: [106.695, 10.776],
          },
          note: "The Rex Hotel is a landmark in Ho Chi Minh City, offering luxury accommodations and a rich history.",
        },
      ],
    },
    {
      type: "list", // Đây là list
      name: "Must-visit Places",
      index: 2,
      data: [
        // data có cùng structure với route
        {
          type: "place",
          name: "War Remnants Museum",
          address: "28 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City",
          description: "A museum dedicated to the history of the Vietnam War.",
          tags: ["museum", "history", "war"],
          phone: "+84 28 3930 5587",
          images: ["https://example.com/war-museum-1.jpg"],
          website: "https://warremnantsmuseum.com/",
          location: {
            type: "Point",
            coordinates: [106.688, 10.776],
          },
          note: "The War Remnants Museum provides a poignant insight into the Vietnam War.",
        },
      ],
    },
  ],
};
const page = () => {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    try {
      console.log("Testing mockUpData:", mockUpData);
      console.log("Client session:", session);
      console.log("Session status:", status);

      const result = await createGuide(mockUpData);
      console.log("createGuide result:", result);
      setTestResult(result);
    } catch (error) {
      console.error("Error in handleTest:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSimpleTest = async () => {
    try {
      const simpleData = {
        title: mockUpData.title,
        note: mockUpData.note,
      };

      const result = await testValidation(simpleData);
      setTestResult(result);
    } catch (error) {
      console.error("Error in simple test:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  return (
    <div className="overflow-y-auto flex px-6 border-none">
      {/* <div>
        <SidebarDetail />
      </div> */}
      <div className="flex-1">
        <GuideHeader />
        <GuideContent />
      </div>
      <div className="flex-1 hidden md:flex flex-col gap-4 p-4">
        {/* Session Status */}
        <div className="text-sm bg-blue-100 p-4 rounded border-l-4 border-blue-500">
          <h3 className="font-bold mb-2">🔐 Authentication Status</h3>
          <p>
            <strong>Session Status:</strong> {status}
          </p>
          <p>
            <strong>Has Session:</strong> {session ? "✅ Yes" : "❌ No"}
          </p>
          {session && (
            <>
              <p>
                <strong>User:</strong> {session.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {session.user?.email}
              </p>
              <p>
                <strong>ID:</strong> {session.user?.id}
              </p>
            </>
          )}
        </div>

        {/* Sign In Link if not authenticated */}
        {!session && status !== "loading" && (
          <div className="text-sm bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
            <p className="mb-2">
              ⚠️ You need to sign in to create guides (when auth is enabled)
            </p>
            <Link href="/sign-in">
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                🔑 Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Test Buttons */}
        <Button
          onClick={handleSimpleTest}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          🔥 Simple Test
        </Button>
        <Button
          onClick={handleTest}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          🧪 Full Test (Complete Guide) Alo Alo
        </Button>

        {/* Debug Info */}
        <div className="text-sm bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">📊 Mock Data Info</h3>
          <p>
            <strong>Title:</strong> {mockUpData.title}
          </p>
          <p>
            <strong>Details:</strong> {mockUpData.details.length} items
          </p>
          <p>
            <strong>Lodging:</strong> {mockUpData.lodging.length} hotels
          </p>
          <p>
            <strong>Status:</strong> Validation ready ✅
          </p>
        </div>

        {/* Test Results */}
        {testResult && (
          <div
            className={`text-sm p-4 rounded border-l-4 ${
              testResult.success
                ? "bg-green-100 border-green-500"
                : "bg-red-100 border-red-500"
            }`}
          >
            <h3 className="font-bold mb-2">
              {testResult.success ? "✅ Test Success!" : "❌ Test Failed"}
            </h3>
            <p>
              <strong>Success:</strong> {testResult.success ? "Yes" : "No"}
            </p>
            {testResult.message && (
              <p>
                <strong>Message:</strong> {testResult.message}
              </p>
            )}
            {testResult.data?.nextSteps && (
              <div className="mt-2">
                <strong>Next Steps:</strong>
                <ul className="list-disc ml-4 mt-1">
                  {testResult.data.nextSteps.map(
                    (step: string, index: number) => (
                      <li key={index} className="text-xs">
                        {step}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {testResult.error && (
              <p className="text-red-600">
                <strong>Error:</strong> {testResult.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
