"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DemoNavigation from "@/components/navigation/DemoNavigation";
import {
  getPlaces,
  getNearbyPlaces,
  getPlacesByCategory,
  getPopularPlaces,
} from "@/lib/actions/place.action";
import {
  FaCode,
  FaDatabase,
  FaMapMarkerAlt,
  FaStar,
  FaPlay,
} from "react-icons/fa";

export default function APIDemo() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<string>("");

  const runDemo = async (demoType: string, demoFn: () => Promise<any>) => {
    setIsLoading(true);
    setCurrentDemo(demoType);
    try {
      const result = await demoFn();
      setResults(result);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const demos = [
    {
      id: "text-search",
      name: "Text Search",
      description: "Search attractions by name and description",
      code: `await getPlaces({
  page: 1,
  pageSize: 10,
  query: "temple",
  filter: JSON.stringify({
    sort: "rating"
  })
})`,
      run: () =>
        getPlaces({
          page: 1,
          pageSize: 10,
          query: "temple",
          filter: JSON.stringify({ sort: "rating" }),
        }),
    },
    {
      id: "geo-search",
      name: "Geographic Search",
      description: "Find attractions near specific coordinates",
      code: `await getNearbyPlaces(
  21.0285, // Hanoi latitude
  105.8542, // Hanoi longitude
  5000, // 5km radius
  10 // max results
)`,
      run: () => getNearbyPlaces(21.0285, 105.8542, 5000, 10),
    },
    {
      id: "combined-filter",
      name: "Combined Filters",
      description: "Geographic search with category and rating filters",
      code: `await getPlaces({
  page: 1,
  pageSize: 15,
  filter: JSON.stringify({
    location: {
      latitude: 10.7769,
      longitude: 106.7009,
      radius: 10000
    },
    category: "museum",
    rating: { min: 4.0 },
    sort: "rating"
  })
})`,
      run: () =>
        getPlaces({
          page: 1,
          pageSize: 15,
          filter: JSON.stringify({
            location: {
              latitude: 10.7769,
              longitude: 106.7009,
              radius: 10000,
            },
            category: "museum",
            rating: { min: 4.0 },
            sort: "rating",
          }),
        }),
    },
    {
      id: "category-search",
      name: "Category Search",
      description: "Get attractions by category",
      code: `await getPlacesByCategory("temple", 8)`,
      run: () => getPlacesByCategory("temple", 8),
    },
    {
      id: "popular-places",
      name: "Popular Places",
      description: "Get highly rated attractions",
      code: `await getPopularPlaces(10)`,
      run: () => getPopularPlaces(10),
    },
  ];

  const renderResult = (data: any) => {
    if (!data) return null;

    if (data.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Error</h4>
          <p className="text-red-600 text-sm">{data.error}</p>
        </div>
      );
    }

    if (!data.success) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">API Response</h4>
          <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    const places = data.data?.places || [];
    const totalCount = data.data?.totalCount;
    const isNext = data.data?.isNext;

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Success ✅</h4>
          <div className="text-sm text-green-700">
            <p>
              Found: <strong>{places.length}</strong> attractions
            </p>
            {totalCount && (
              <p>
                Total in database: <strong>{totalCount}</strong>
              </p>
            )}
            {isNext !== undefined && (
              <p>
                Has more results: <strong>{isNext ? "Yes" : "No"}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {places.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Results:</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {places.map((place: any, index: number) => (
                <div
                  key={place._id || index}
                  className="border rounded-lg p-3 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{place.name}</h5>
                      {place.address?.fullAddress && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          <FaMapMarkerAlt className="inline mr-1" size={10} />
                          {place.address.fullAddress}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-500" size={10} />
                            <span className="text-xs">
                              {place.rating.toFixed(1)}
                            </span>
                            {place.numRatings && (
                              <span className="text-xs text-gray-500">
                                ({place.numRatings.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}
                        {place.categories?.[0] && (
                          <Badge variant="outline" className="text-xs py-0">
                            {place.categories[0]}
                          </Badge>
                        )}
                        {place.distance && (
                          <span className="text-xs text-green-600 font-medium">
                            {place.distance.toFixed(1)}km away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Response */}
        <details className="border rounded-lg">
          <summary className="p-3 bg-gray-50 cursor-pointer text-sm font-medium">
            View Raw API Response
          </summary>
          <div className="p-3 border-t">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <DemoNavigation />

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <FaDatabase className="text-blue-600" />
            Places API Demo
          </h1>
          <p className="text-gray-600">
            Interactive demonstration of geospatial search APIs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* API Demos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaCode className="text-purple-600" />
                API Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demos.map((demo) => (
                  <div key={demo.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{demo.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {demo.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => runDemo(demo.id, demo.run)}
                        disabled={isLoading}
                        className="ml-2"
                      >
                        <FaPlay size={10} className="mr-1" />
                        {isLoading && currentDemo === demo.id
                          ? "Running..."
                          : "Run"}
                      </Button>
                    </div>

                    <details className="mt-3">
                      <summary className="text-xs text-blue-600 cursor-pointer">
                        View Code
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                        {demo.code}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    Running API call: {currentDemo}
                  </p>
                </div>
              ) : results ? (
                renderResult(results)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaDatabase className="mx-auto mb-4" size={48} />
                  <p>Click "Run" on any API demo to see results here</p>
                  <p className="text-sm mt-1">
                    Real-time API responses from MongoDB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MongoDB Indexes Info */}
        <Card>
          <CardHeader>
            <CardTitle>MongoDB Geospatial Indexes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="indexes">
              <TabsList>
                <TabsTrigger value="indexes">Database Indexes</TabsTrigger>
                <TabsTrigger value="queries">Query Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="indexes" className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current Indexes:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <code>location: "2dsphere"</code>
                        <p className="text-xs text-blue-600 mt-1">
                          Enables geospatial queries
                        </p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <code>name: "text", description: "text"</code>
                        <p className="text-xs text-green-600 mt-1">
                          Full-text search
                        </p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <code>categories: 1</code>
                        <p className="text-xs text-purple-600 mt-1">
                          Category filtering
                        </p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <code>rating: -1</code>
                        <p className="text-xs text-orange-600 mt-1">
                          Rating sorting
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Performance Benefits:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Fast geospatial queries with $near</li>
                      <li>• Efficient text search with $text</li>
                      <li>• Quick category filtering</li>
                      <li>• Optimized sorting by rating</li>
                      <li>• Compound queries support</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="queries" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Example MongoDB Queries:
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-2">
                          Geospatial Near Query:
                        </h5>
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {`db.attractions.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [105.8542, 21.0285]
      },
      $maxDistance: 5000
    }
  }
})`}
                        </pre>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-2">
                          Combined Filter Query:
                        </h5>
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {`db.attractions.find({
  $and: [
    {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [106.7009, 10.7769] },
          $maxDistance: 10000
        }
      }
    },
    { categories: "museum" },
    { rating: { $gte: 4.0 } }
  ]
}).sort({ rating: -1 })`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
