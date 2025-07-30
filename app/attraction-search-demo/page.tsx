"use client";

import React, { useState } from "react";
import PlaceSearch from "@/components/search/PlaceSearch";
import { usePlaceSelection } from "@/hooks/usePlaceSelection";
import PlaceMap from "@/components/maps/PlaceMap";
import DemoNavigation from "@/components/navigation/DemoNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FaMapMarkerAlt,
  FaStar,
  FaGlobe,
  FaPhone,
  FaClock,
  FaLocationArrow,
  FaRulerCombined,
} from "react-icons/fa";
import { getNearbyPlaces } from "@/lib/actions/place.action";

export default function AttractionSearchDemo() {
  const [selectedAttractions, setSelectedAttractions] = useState<any[]>([]);
  const { clearPlaceSelection, getSelectedPlace } = usePlaceSelection();

  // Geographic search state
  const [geoSearchResults, setGeoSearchResults] = useState<any[]>([]);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(5000); // 5km default

  // Auto-detect place selection from URL
  React.useEffect(() => {
    const selectedPlace = getSelectedPlace();
    if (selectedPlace) {
      // Add to our list
      setSelectedAttractions((prev) => {
        // Check if already exists
        const exists = prev.some((attr) => attr.id === selectedPlace.id);
        if (!exists) {
          return [...prev, selectedPlace];
        }
        return prev;
      });

      // Clear URL params
      clearPlaceSelection();
    }
  }, [getSelectedPlace, clearPlaceSelection]);

  const handlePlaceSelect = (place: any) => {
    // Direct selection from component
    setSelectedAttractions((prev) => {
      const exists = prev.some((attr) => attr.id === place.id);
      if (!exists) {
        return [...prev, place];
      }
      return prev;
    });
  };

  const removeAttraction = (id: string) => {
    setSelectedAttractions((prev) => prev.filter((attr) => attr.id !== id));
  };

  const clearAll = () => {
    setSelectedAttractions([]);
  };

  // Predefined locations for easy testing
  const predefinedLocations = [
    { name: "Hà Nội Old Quarter", lat: 21.0285, lng: 105.8542 },
    { name: "TP.HCM District 1", lat: 10.7769, lng: 106.7009 },
    { name: "Hội An Ancient Town", lat: 15.8801, lng: 108.335 },
    { name: "Sapa Town Center", lat: 22.338, lng: 103.8442 },
    { name: "Đà Lạt City Center", lat: 11.9404, lng: 108.4583 },
  ];

  // Get current location
  const getCurrentLocation = () => {
    setIsGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          searchNearbyPlaces(latitude, longitude, selectedRadius);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please try manual coordinates.");
          setIsGeoLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGeoLoading(false);
    }
  };

  // Search nearby places
  const searchNearbyPlaces = async (
    lat: number,
    lng: number,
    radius: number
  ) => {
    setIsGeoLoading(true);
    try {
      const result = await getNearbyPlaces(lat, lng, radius, 20);
      if (result.success && result.data?.places) {
        // Calculate distances for display
        const placesWithDistance = result.data.places.map((place: any) => {
          const distance = calculateDistance(
            lat,
            lng,
            place.location.coordinates[1], // latitude
            place.location.coordinates[0] // longitude
          );
          return { ...place, distance };
        });
        setGeoSearchResults(placesWithDistance);
      } else {
        setGeoSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching nearby places:", error);
      setGeoSearchResults([]);
    } finally {
      setIsGeoLoading(false);
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Use predefined location
  const usePredefinedLocation = (location: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    searchNearbyPlaces(location.lat, location.lng, selectedRadius);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <DemoNavigation />

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attraction Search Demo
          </h1>
          <p className="text-gray-600">
            Search and select attractions using our Places API
          </p>
        </div>

        {/* Search Component */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Search Attractions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlaceSearch
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search for museums, parks, temples, beaches..."
              maxResults={8}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 Try searching for:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Temple of Literature</Badge>
                <Badge variant="outline">Hanoi Old Quarter</Badge>
                <Badge variant="outline">Ben Thanh Market</Badge>
                <Badge variant="outline">Hoi An Ancient Town</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Location Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaLocationArrow className="text-green-600" />
              Geographic Location Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Location */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGeoLoading}
                  className="flex items-center gap-2"
                >
                  <FaLocationArrow size={14} />
                  {isGeoLoading ? "Getting Location..." : "Use My Location"}
                </Button>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Radius:</label>
                  <Select
                    value={selectedRadius.toString()}
                    onValueChange={(value) => {
                      const newRadius = Number(value);
                      setSelectedRadius(newRadius);
                      if (userLocation) {
                        searchNearbyPlaces(
                          userLocation.lat,
                          userLocation.lng,
                          newRadius
                        );
                      }
                    }}
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
              </div>

              {/* Predefined Locations */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Or try these locations:
                </p>
                <div className="flex flex-wrap gap-2">
                  {predefinedLocations.map((location) => (
                    <Button
                      key={location.name}
                      variant="outline"
                      size="sm"
                      onClick={() => usePredefinedLocation(location)}
                      className="text-xs"
                    >
                      📍 {location.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Location Display */}
              {userLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <FaMapMarkerAlt size={14} />
                    <span className="font-medium">
                      Current Search Location:
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Latitude: {userLocation.lat.toFixed(6)}, Longitude:{" "}
                    {userLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Searching within {(selectedRadius / 1000).toFixed(1)}km
                    radius
                  </p>
                </div>
              )}

              {/* Results */}
              {isGeoLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    Searching nearby attractions...
                  </p>
                </div>
              ) : geoSearchResults.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3">
                    Found {geoSearchResults.length} nearby attractions:
                  </h4>

                  {/* Map Visualization */}
                  <div className="mb-6">
                    <PlaceMap
                      center={userLocation!}
                      places={geoSearchResults}
                      radius={selectedRadius}
                      className="mb-4"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {geoSearchResults.map((place) => (
                      <div
                        key={place._id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handlePlaceSelect(place)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">
                              {place.name}
                            </h5>
                            {place.address?.fullAddress && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {place.address.fullAddress}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {place.rating && (
                                <div className="flex items-center gap-1">
                                  <FaStar
                                    className="text-yellow-500"
                                    size={10}
                                  />
                                  <span className="text-xs">
                                    {place.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              {place.categories?.[0] && (
                                <Badge
                                  variant="outline"
                                  className="text-xs py-0"
                                >
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
                </div>
              ) : userLocation ? (
                <div className="text-center py-4 text-gray-500">
                  <FaMapMarkerAlt className="mx-auto mb-2" size={24} />
                  <p className="text-sm">
                    No attractions found within{" "}
                    {(selectedRadius / 1000).toFixed(1)}km
                  </p>
                  <p className="text-xs mt-1">
                    Try increasing the search radius
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <FaLocationArrow className="mx-auto mb-2" size={24} />
                  <p className="text-sm">
                    Click "Use My Location" or select a predefined location to
                    start
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Attractions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Selected Attractions ({selectedAttractions.length})
            </CardTitle>
            {selectedAttractions.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedAttractions.length === 0 ? (
              <div className="text-center py-8">
                <FaMapMarkerAlt
                  className="mx-auto text-gray-300 mb-4"
                  size={48}
                />
                <p className="text-gray-500">No attractions selected yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Use the search above to find and select attractions
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {selectedAttractions.map((attraction) => (
                  <Card key={attraction.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {attraction.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttraction(attraction.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </Button>
                      </div>

                      {attraction.address && (
                        <p className="text-gray-600 text-sm mb-3 flex items-start gap-2">
                          <FaMapMarkerAlt
                            className="text-gray-400 mt-0.5 flex-shrink-0"
                            size={12}
                          />
                          <span className="line-clamp-2">
                            {attraction.address}
                          </span>
                        </p>
                      )}

                      {attraction.description && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                          {attraction.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {attraction.rating && (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                            <FaStar className="text-yellow-500" size={12} />
                            <span className="text-sm font-medium">
                              {attraction.rating.toFixed(1)}
                            </span>
                            {attraction.numRatings && (
                              <span className="text-xs text-gray-500">
                                ({attraction.numRatings.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}

                        {attraction.categories &&
                          attraction.categories.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {attraction.categories[0]}
                            </Badge>
                          )}
                      </div>

                      <div className="flex gap-3 text-xs text-gray-500">
                        {attraction.website && (
                          <div className="flex items-center gap-1">
                            <FaGlobe size={10} />
                            <span>Website</span>
                          </div>
                        )}
                        {attraction.phone && (
                          <div className="flex items-center gap-1">
                            <FaPhone size={10} />
                            <span>Phone</span>
                          </div>
                        )}
                        {attraction.openingPeriods &&
                          attraction.openingPeriods.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FaClock size={10} />
                              <span>Hours</span>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle>API Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Search Capabilities:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Text search by name, description</li>
                  <li>• Filter by category, city, rating</li>
                  <li>• 📍 Geographic location search (NEW!)</li>
                  <li>• Geolocation with distance calculation</li>
                  <li>• Radius-based proximity search</li>
                  <li>• Sort by rating, popularity, distance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Geographic Features:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Auto-detect user location</li>
                  <li>• Predefined popular locations</li>
                  <li>• Distance calculation (Haversine)</li>
                  <li>• Adjustable search radius (1-50km)</li>
                  <li>• Real-time nearby attractions</li>
                  <li>• MongoDB 2dsphere index support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Available:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Name, description, address</li>
                  <li>• Categories and ratings</li>
                  <li>• Location coordinates</li>
                  <li>• Opening hours, price levels</li>
                  <li>• Images, reviews, website</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
