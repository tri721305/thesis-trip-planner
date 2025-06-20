import React, { useState } from "react";
import { FaPlus, FaCalendarDay, FaMapMarkerAlt } from "react-icons/fa";
import { BiSolidHotel, BiRestaurant, BiCamera } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Place {
  id: string;
  name: string;
  type: "attraction" | "restaurant" | "hotel" | "activity";
  address?: string;
  time?: string;
  duration?: string;
  notes?: string;
  rating?: number;
  image?: string;
  coordinates?: { lat: number; lng: number };
}

interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
  places: Place[];
  notes?: string;
}

const mockDays: DayPlan[] = [
  {
    dayNumber: 1,
    date: "Dec 10",
    title: "Arrival in Hanoi",
    places: [
      {
        id: "1",
        name: "Noi Bai International Airport",
        type: "attraction",
        address: "Hanoi, Vietnam",
        time: "10:00 AM",
        duration: "1 hour",
      },
      {
        id: "2",
        name: "Hanoi Old Quarter",
        type: "attraction",
        address: "Hoan Kiem District, Hanoi",
        time: "2:00 PM",
        duration: "3 hours",
        rating: 4.5,
      },
      {
        id: "3",
        name: "Bun Cha Huong Lien",
        type: "restaurant",
        address: "24 Le Van Huu, Hanoi",
        time: "6:00 PM",
        duration: "1 hour",
        rating: 4.8,
      },
    ],
  },
  {
    dayNumber: 2,
    date: "Dec 11",
    title: "Cultural Exploration",
    places: [
      {
        id: "4",
        name: "Temple of Literature",
        type: "attraction",
        address: "58 Quoc Tu Giam, Hanoi",
        time: "9:00 AM",
        duration: "2 hours",
        rating: 4.3,
      },
      {
        id: "5",
        name: "Vietnam Museum of Ethnology",
        type: "attraction",
        address: "Nguyen Van Huyen, Hanoi",
        time: "11:30 AM",
        duration: "2.5 hours",
        rating: 4.6,
      },
    ],
  },
  {
    dayNumber: 3,
    date: "Dec 12",
    title: "Day Trip",
    places: [],
  },
];

const getPlaceIcon = (type: Place["type"]) => {
  switch (type) {
    case "hotel":
      return <BiSolidHotel className="w-4 h-4" />;
    case "restaurant":
      return <BiRestaurant className="w-4 h-4" />;
    case "attraction":
      return <FaMapMarkerAlt className="w-4 h-4" />;
    case "activity":
      return <BiCamera className="w-4 h-4" />;
    default:
      return <FaMapMarkerAlt className="w-4 h-4" />;
  }
};

const getPlaceColor = (type: Place["type"]) => {
  switch (type) {
    case "hotel":
      return "bg-blue-100 text-blue-800";
    case "restaurant":
      return "bg-orange-100 text-orange-800";
    case "attraction":
      return "bg-green-100 text-green-800";
    case "activity":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const TripPlannerLayout = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeView, setActiveView] = useState<"itinerary" | "map">(
    "itinerary"
  );

  const currentDay = mockDays.find((day) => day.dayNumber === selectedDay);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Days Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Trip to Hanoi</h1>
          <p className="text-sm text-gray-600">Dec 10-12, 2024 • 3 days</p>
        </div>

        {/* Days List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {mockDays.map((day) => (
              <Card
                key={day.dayNumber}
                className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedDay === day.dayNumber
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedDay(day.dayNumber)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCalendarDay className="w-4 h-4 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-sm">
                          Day {day.dayNumber}
                        </h3>
                        <p className="text-xs text-gray-600">{day.date}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {day.places.length} places
                    </Badge>
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">
                    {day.title}
                  </h4>
                </CardHeader>

                {day.places.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {day.places.slice(0, 2).map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <div
                            className={`p-1 rounded ${getPlaceColor(place.type)}`}
                          >
                            {getPlaceIcon(place.type)}
                          </div>
                          <span className="truncate">{place.name}</span>
                        </div>
                      ))}
                      {day.places.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{day.places.length - 2} more places
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Add Day Button */}
            <Button
              variant="outline"
              className="w-full mt-2 border-dashed"
              onClick={() => {
                /* Add new day logic */
              }}
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Add Day
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                Day {selectedDay}: {currentDay?.title}
              </h2>
              <Badge variant="outline">{currentDay?.date}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "itinerary" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("itinerary")}
              >
                Itinerary
              </Button>
              <Button
                variant={activeView === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("map")}
              >
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === "itinerary" ? (
            <ItineraryView day={currentDay} />
          ) : (
            <MapView day={currentDay} />
          )}
        </div>
      </div>
    </div>
  );
};

// Itinerary View Component
const ItineraryView = ({ day }: { day: DayPlan | undefined }) => {
  if (!day) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Day Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Day {day.dayNumber}: {day.title}
          </h1>
          <p className="text-gray-600">{day.date}</p>
        </div>

        {/* Places Timeline */}
        <div className="space-y-4">
          {day.places.map((place, index) => (
            <Card key={place.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Time & Icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`p-2 rounded-full ${getPlaceColor(place.type)}`}
                    >
                      {getPlaceIcon(place.type)}
                    </div>
                    {place.time && (
                      <span className="text-xs font-medium mt-2">
                        {place.time}
                      </span>
                    )}
                    {index < day.places.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{place.name}</h3>
                        {place.address && (
                          <p className="text-sm text-gray-600 mt-1">
                            {place.address}
                          </p>
                        )}
                        {place.duration && (
                          <p className="text-sm text-blue-600 mt-1">
                            Duration: {place.duration}
                          </p>
                        )}
                        {place.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">
                              {place.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>

                    {place.notes && (
                      <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded">
                        {place.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Place Button */}
          <Card className="border-dashed border-2 hover:bg-gray-50 cursor-pointer">
            <CardContent className="p-8 text-center">
              <FaPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-medium text-gray-600">Add a place</h3>
              <p className="text-sm text-gray-500">
                Add restaurants, attractions, hotels, and more
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};

// Map View Component
const MapView = ({ day }: { day: DayPlan | undefined }) => {
  return (
    <div className="h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <FaMapMarkerAlt className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Map View</h3>
        <p className="text-gray-500">
          Map integration will be implemented here
        </p>
      </div>
    </div>
  );
};

export default TripPlannerLayout;
