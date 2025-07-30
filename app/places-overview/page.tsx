"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DemoNavigation from "@/components/navigation/DemoNavigation";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaGlobeAsia,
  FaDatabase,
  FaRocket,
  FaCode,
  FaCheckCircle,
  FaStar,
  FaLocationArrow,
  FaFilter,
  FaCog,
} from "react-icons/fa";

export default function PlacesOverview() {
  const features = [
    {
      icon: FaSearch,
      title: "Text Search",
      description: "Search attractions by name, description, and address",
      implemented: true,
      color: "blue",
    },
    {
      icon: FaLocationArrow,
      title: "Geographic Search",
      description:
        "Find attractions near specific coordinates with distance calculation",
      implemented: true,
      color: "green",
    },
    {
      icon: FaFilter,
      title: "Advanced Filtering",
      description: "Filter by category, rating, location radius, and more",
      implemented: true,
      color: "purple",
    },
    {
      icon: FaStar,
      title: "Rating-based Sorting",
      description: "Sort by rating, popularity, distance, and name",
      implemented: true,
      color: "yellow",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Map Visualization",
      description: "Interactive map showing attractions and search radius",
      implemented: true,
      color: "red",
    },
    {
      icon: FaDatabase,
      title: "MongoDB Geospatial",
      description: "Leverages MongoDB 2dsphere indexes for fast queries",
      implemented: true,
      color: "green",
    },
  ];

  const apiEndpoints = [
    {
      name: "getPlaces()",
      description: "Main search function with text and geospatial filtering",
      params: "query, filter, pagination",
    },
    {
      name: "getNearbyPlaces()",
      description: "Find attractions within radius of coordinates",
      params: "lat, lng, radius, limit",
    },
    {
      name: "getPlacesByCategory()",
      description: "Get attractions filtered by category",
      params: "category, limit",
    },
    {
      name: "getPopularPlaces()",
      description: "Get highly rated and popular attractions",
      params: "limit",
    },
    {
      name: "getPlaceById()",
      description: "Get detailed information for specific attraction",
      params: "id",
    },
  ];

  const databaseFeatures = [
    "2dsphere geospatial index for location queries",
    "Text indexes for full-text search",
    "Compound indexes for optimized filtering",
    "GeoJSON Point coordinates support",
    "Distance calculation with Haversine formula",
    "MongoDB aggregation pipeline queries",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <DemoNavigation />

        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <FaGlobeAsia size={40} />
                Places & Geographic Search System
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Complete geospatial search solution with MongoDB and Next.js
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  MongoDB 2dsphere
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  Geospatial Queries
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  Real-time Search
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  Advanced Filtering
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FaDatabase className="mx-auto mb-3 text-blue-500" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">1000+</h3>
              <p className="text-sm text-gray-600">Attractions in Database</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FaSearch className="mx-auto mb-3 text-green-500" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">5</h3>
              <p className="text-sm text-gray-600">Search API Functions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FaLocationArrow
                className="mx-auto mb-3 text-purple-500"
                size={32}
              />
              <h3 className="text-2xl font-bold text-gray-900">50km</h3>
              <p className="text-sm text-gray-600">Max Search Radius</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FaRocket className="mx-auto mb-3 text-red-500" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">&lt;100ms</h3>
              <p className="text-sm text-gray-600">Average Query Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Implemented Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`text-${feature.color}-500`} size={20} />
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      {feature.implemented && (
                        <FaCheckCircle className="text-green-500" size={14} />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* API Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCode className="text-blue-500" />
              API Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-blue-600 mb-1">
                        {endpoint.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {endpoint.description}
                      </p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Parameters: {endpoint.params}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaDatabase className="text-green-500" />
              Database Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">MongoDB Indexes:</h4>
                <ul className="space-y-2">
                  {databaseFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <FaCheckCircle
                        className="text-green-500 flex-shrink-0"
                        size={14}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Performance Benefits:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Fast geospatial proximity queries</li>
                  <li>• Efficient text search across multiple fields</li>
                  <li>• Optimized category and rating filtering</li>
                  <li>• Quick distance-based sorting</li>
                  <li>• Scalable for large datasets</li>
                  <li>• Real-time search capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Try It Out */}
        <Card>
          <CardHeader>
            <CardTitle>Try the Demos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/attraction-search-demo">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                >
                  <FaSearch size={20} />
                  <span className="text-sm">Basic Search Demo</span>
                </Button>
              </Link>
              <Link href="/geographic-search-demo">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                >
                  <FaGlobeAsia size={20} />
                  <span className="text-sm">Geographic Demo</span>
                </Button>
              </Link>
              <Link href="/api-demo">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                >
                  <FaDatabase size={20} />
                  <span className="text-sm">API Testing</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Built with Next.js, MongoDB, and modern web technologies
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Geographic search system for Vietnamese attractions and places
          </p>
        </div>
      </div>
    </div>
  );
}
