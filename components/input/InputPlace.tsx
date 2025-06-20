import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { BiSolidHotel, BiRestaurant, BiCamera } from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AddPlaceModal = ({
  dayNumber,
  onAddPlace,
}: {
  dayNumber: number;
  onAddPlace: (place: any) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: FaMapMarkerAlt },
    { id: "attractions", label: "Attractions", icon: FaMapMarkerAlt },
    { id: "restaurants", label: "Restaurants", icon: BiRestaurant },
    { id: "hotels", label: "Hotels", icon: BiSolidHotel },
    { id: "activities", label: "Activities", icon: BiCamera },
  ];

  const samplePlaces = [
    {
      id: "sample1",
      name: "Hoan Kiem Lake",
      type: "attraction",
      address: "Hoan Kiem District, Hanoi",
      rating: 4.5,
      category: "attractions",
      image: "/api/placeholder/300/200",
    },
    {
      id: "sample2",
      name: "Pho Gia Truyen",
      type: "restaurant",
      address: "49 Bat Dan, Hanoi",
      rating: 4.7,
      category: "restaurants",
      image: "/api/placeholder/300/200",
    },
    {
      id: "sample3",
      name: "JW Marriott Hanoi",
      type: "hotel",
      address: "8 Do Duc Duc, Hanoi",
      rating: 4.8,
      category: "hotels",
      image: "/api/placeholder/300/200",
    },
  ];

  const filteredPlaces = samplePlaces.filter((place) => {
    const matchesSearch = place.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="border-dashed border-2 hover:bg-gray-50 cursor-pointer">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <FaMapMarkerAlt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-700 mb-1">Add a place</h3>
            <p className="text-sm text-gray-500">
              Add restaurants, attractions, hotels, and more
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add place to Day {dayNumber}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Places</TabsTrigger>
            <TabsTrigger value="custom">Add Custom</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for places in Hanoi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredPlaces.map((place) => (
                <Card
                  key={place.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                        {/* Placeholder for image */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{place.name}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {place.address}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-sm">{place.rating}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {place.type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => onAddPlace(place)}
                        >
                          Add to itinerary
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Create a custom place for your itinerary
              </p>
              {/* Custom place form would go here */}
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <p className="text-gray-500">Custom place creation form</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Import places from your reservations
              </p>
              {/* Import options would go here */}
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <p className="text-gray-500">
                  Email import and booking integration
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaceModal;
