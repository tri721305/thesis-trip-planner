"use client";

import React, { useState } from "react";
import { getUserByEmail } from "@/lib/actions/user.action";
import { testUserConnection } from "@/lib/actions/test-db.action";
import { checkEnvironment } from "@/lib/actions/check-env.action";

const TestUserSearch = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEnvironment = async () => {
    setLoading(true);
    console.log("🔧 Testing environment...");

    try {
      const response = await checkEnvironment();
      console.log("🔧 Environment Response:", response);
      setResult({ type: "environment", ...response });
    } catch (error) {
      console.error("💥 Environment Error:", error);
      setResult({ type: "environment", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    console.log("🧪 Testing database connection...");

    try {
      const response = await testUserConnection();
      console.log("🔌 Database Test Response:", response);
      setResult({ type: "database", ...response });
    } catch (error) {
      console.error("💥 Database Error:", error);
      setResult({ type: "database", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    console.log("🧪 Testing getUserByEmail with admin@gmail.com...");

    try {
      const response = await getUserByEmail({
        email: "admin@gmail.com",
      });

      console.log("📧 Full Response:", response);
      setResult({ type: "userSearch", ...response });
    } catch (error) {
      console.error("💥 Error:", error);
      setResult({ type: "userSearch", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Test User Search</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={testEnvironment}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Environment"}
        </button>

        <button
          onClick={testDatabase}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Database"}
        </button>

        <button
          onClick={testSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test getUserByEmail"}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-semibold mb-2">
            Result ({result.type || "unknown"}):
          </h3>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestUserSearch;
