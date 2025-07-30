"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceMap from "@/components/maps/PlaceMap";
import DemoNavigation from "@/components/navigation/DemoNavigation";
import { getNearbyPlaces, getPlaces } from "@/lib/actions/place.action";
import {
  FaLocationArrow,
  FaMapMarkerAlt,
  FaStar,
  FaRulerCombined,
  FaFilter,
  FaSearch,
  FaGlobeAsia,
} from "react-icons/fa";

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export default function GeographicSearchDemo() {
  // Location states
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [customLocation, setCustomLocation] = useState({ lat: "", lng: "" });
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  // Search states
  const [radius, setRadius] = useState(5000);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [nearbyResults, setNearbyResults] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // UI states
  const [activeTab, setActiveTab] = useState("nearby");

  // Vietnamese cities with coordinates
  const vietnamCities = [
    { name: "Hà Nội - Hoàn Kiếm", lat: 21.0285, lng: 105.8542 },
    { name: "TP.HCM - Quận 1", lat: 10.7769, lng: 106.7009 },
    { name: "Đà Nẵng - Hải Châu", lat: 16.0471, lng: 108.2068 },
    { name: "Hội An - Phố Cổ", lat: 15.8801, lng: 108.335 },
    { name: "Huế - Kinh Thành", lat: 16.4637, lng: 107.5909 },
    { name: "Sapa - Thị Trấn", lat: 22.338, lng: 103.8442 },
    { name: "Đà Lạt - Trung Tâm", lat: 11.9404, lng: 108.4583 },
    { name: "Nha Trang - Trung Tâm", lat: 12.2388, lng: 109.1967 },
    { name: "Phú Quốc - Dương Đông", lat: 10.2201, lng: 103.9671 },
    { name: "Vũng Tàu - Thành Phố", lat: 10.346, lng: 107.0843 },
  ];

  // Categories for filtering
  const categories = [
    "all",
    "museum",
    "temple",
    "park",
    "market",
    "beach",
    "historical",
    "cultural",
    "entertainment",
    "shopping",
  ];

  // Get current location
  const getCurrentLocation = () => {
    setIsGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Your Current Location",
          };
          setUserLocation(location);
          searchNearbyPlaces(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Could not get your location. Please try a predefined city or custom coordinates."
          );
          setIsGeoLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGeoLoading(false);
    }
  };

  // Use predefined city
  const useCity = (city: Location) => {
    setUserLocation({ ...city });
    searchNearbyPlaces(city);
  };

  // Use custom coordinates
  const useCustomLocation = () => {
    const lat = parseFloat(customLocation.lat);
    const lng = parseFloat(customLocation.lng);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      alert(
        "Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180)"
      );
      return;
    }

    const location = {
      lat,
      lng,
      name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    };
    setUserLocation(location);
    searchNearbyPlaces(location);
  };

  // Search nearby places
  const searchNearbyPlaces = async (location: Location) => {
    setIsGeoLoading(true);
    try {
      const result = await getNearbyPlaces(
        location.lat,
        location.lng,
        radius,
        50
      );
      if (result.success && result.data?.places) {
        const placesWithDistance = result.data.places.map((place: any) => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            place.location.coordinates[1],
            place.location.coordinates[0]
          );
          return { ...place, distance };
        });

        // Apply filters
        let filteredPlaces = placesWithDistance;

        if (categoryFilter !== "all") {
          filteredPlaces = filteredPlaces.filter((place: any) =>
            place.categories?.includes(categoryFilter)
          );
        }

        if (parseFloat(minRating) > 0) {
          filteredPlaces = filteredPlaces.filter(
            (place: any) => (place.rating || 0) >= parseFloat(minRating)
          );
        }

        setNearbyResults(filteredPlaces);
      } else {
        setNearbyResults([]);
      }
    } catch (error) {
      console.error("Error searching nearby places:", error);
      setNearbyResults([]);
    } finally {
      setIsGeoLoading(false);
    }
  };

  // Search with location filter
  const searchWithLocationFilter = async () => {
    if (!userLocation) return;

    setIsGeoLoading(true);
    try {
      const filterObj: any = {
        location: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius,
        },
      };

      if (categoryFilter !== "all") {
        filterObj.category = categoryFilter;
      }

      if (parseFloat(minRating) > 0) {
        filterObj.rating = { min: parseFloat(minRating) };
      }

      const result = await getPlaces({
        page: 1,
        pageSize: 50,
        filter: JSON.stringify(filterObj),
      });

      if (result.success && result.data?.places) {
        const placesWithDistance = result.data.places.map((place: any) => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            place.location.coordinates[1],
            place.location.coordinates[0]
          );
          return { ...place, distance };
        });
        setSearchResults(placesWithDistance);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching with location filter:", error);
      setSearchResults([]);
    } finally {
      setIsGeoLoading(false);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Auto-search when filters change
  useEffect(() => {
    if (userLocation) {
      if (activeTab === "nearby") {
        searchNearbyPlaces(userLocation);
      } else {
        searchWithLocationFilter();
      }
    }
  }, [radius, categoryFilter, minRating, activeTab]);

  const renderPlacesList = (places: any[], title: string) => (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-500" />
        {title} ({places.length})
      </h4>
      {places.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaMapMarkerAlt className="mx-auto mb-2" size={24} />
          <p>No attractions found with current filters</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {places.map((place) => (
            <div
              key={place._id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{place.name}</h5>
                  {place.address?.fullAddress && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
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
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <FaRulerCombined size={10} />
                    <span className="text-xs font-medium">
                      {place.distance?.toFixed(1)}km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <DemoNavigation />

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <FaGlobeAsia className="text-blue-600" />
            Geographic Search Demo
          </h1>
          <p className="text-gray-600">
            Advanced location-based attraction discovery with MongoDB geospatial
            queries
          </p>
        </div>

        {/* Location Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaLocationArrow className="text-green-600" />
              Choose Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">Current Location</TabsTrigger>
                <TabsTrigger value="cities">Vietnam Cities</TabsTrigger>
                <TabsTrigger value="custom">Custom Coordinates</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="mt-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={getCurrentLocation}
                    disabled={isGeoLoading}
                    className="flex items-center gap-2"
                  >
                    <FaLocationArrow size={14} />
                    {isGeoLoading
                      ? "Getting Location..."
                      : "Use My Current Location"}
                  </Button>
                  <p className="text-sm text-gray-600">
                    Uses browser geolocation API to detect your current position
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="cities" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {vietnamCities.map((city) => (
                    <Button
                      key={city.name}
                      variant="outline"
                      size="sm"
                      onClick={() => useCity(city)}
                      className="text-xs"
                    >
                      📍 {city.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Latitude:</label>
                    <Input
                      type="number"
                      placeholder="21.0285"
                      value={customLocation.lat}
                      onChange={(e) =>
                        setCustomLocation((prev) => ({
                          ...prev,
                          lat: e.target.value,
                        }))
                      }
                      className="w-24"
                      step="0.000001"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Longitude:</label>
                    <Input
                      type="number"
                      placeholder="105.8542"
                      value={customLocation.lng}
                      onChange={(e) =>
                        setCustomLocation((prev) => ({
                          ...prev,
                          lng: e.target.value,
                        }))
                      }
                      className="w-24"
                      step="0.000001"
                    />
                  </div>
                  <Button onClick={useCustomLocation} size="sm">
                    Use Location
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter latitude and longitude coordinates (e.g., Hanoi:
                  21.0285, 105.8542)
                </p>
              </TabsContent>
            </Tabs>

            {/* Current Location Display */}
            {userLocation && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <FaMapMarkerAlt size={14} />
                  <span className="font-medium">
                    Selected Location: {userLocation.name}
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Coordinates: {userLocation.lat.toFixed(6)},{" "}
                  {userLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Filters & Results */}
        {userLocation && (
          <>
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaFilter className="text-purple-600" />
                  Search Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Radius:</label>
                    <Select
                      value={radius.toString()}
                      onValueChange={(value) => setRadius(Number(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1km</SelectItem>
                        <SelectItem value="2000">2km</SelectItem>
                        <SelectItem value="5000">5km</SelectItem>
                        <SelectItem value="10000">10km</SelectItem>
                        <SelectItem value="20000">20km</SelectItem>
                        <SelectItem value="50000">50km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Category:</label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat === "all"
                              ? "All Categories"
                              : cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Min Rating:</label>
                    <Select value={minRating} onValueChange={setMinRating}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="3">3.0+</SelectItem>
                        <SelectItem value="3.5">3.5+</SelectItem>
                        <SelectItem value="4">4.0+</SelectItem>
                        <SelectItem value="4.5">4.5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Map Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <PlaceMap
                  center={userLocation}
                  places={
                    activeTab === "nearby" ? nearbyResults : searchResults
                  }
                  radius={radius}
                />
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaSearch className="text-blue-600" />
                  Search Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="nearby">Nearby Search</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Query</TabsTrigger>
                  </TabsList>

                  <TabsContent value="nearby" className="mt-4">
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>MongoDB Query:</strong> Using <code>$near</code>{" "}
                        operator with 2dsphere index
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Returns attractions sorted by distance from your
                        location
                      </p>
                    </div>
                    {isGeoLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">
                          Searching nearby attractions...
                        </p>
                      </div>
                    ) : (
                      renderPlacesList(nearbyResults, "Nearby Attractions")
                    )}
                  </TabsContent>

                  <TabsContent value="advanced" className="mt-4">
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>Advanced Query:</strong> Combined geolocation
                        with category and rating filters
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Uses complex MongoDB aggregation pipeline for
                        multi-criteria search
                      </p>
                    </div>
                    <Button
                      onClick={searchWithLocationFilter}
                      disabled={isGeoLoading}
                      className="mb-4"
                    >
                      Run Advanced Search
                    </Button>
                    {isGeoLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">
                          Running advanced query...
                        </p>
                      </div>
                    ) : (
                      renderPlacesList(searchResults, "Filtered Results")
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
