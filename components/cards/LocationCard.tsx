import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Star,
  Clock,
  Timer,
  Phone,
  Globe,
  Bookmark,
  ChevronDown,
} from "lucide-react";

interface LocationCardProps {
  name?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  hours?: string;
  duration?: string;
  phone?: string;
  website?: string;
  categories?: string[];
  isBookmarked?: boolean;
}

const LocationCard = ({
  name = "Palais de la réunification",
  description = "Edifice historique époque guerre du Vietnam, visites des bureaux gouvernementaux, salles de guerre, artefacts.",
  rating = 4.5,
  reviewCount = 42212,
  address = "Ben Thanh, District 1, Ho Chi Minh City, Vietnam",
  hours = "Monday: 8:00–15:30",
  duration = "2 hr",
  phone = "+84 28 3822 3652",
  website = "https://www.dinhdoclap.gov.vn/",
  categories = ["Musée", "Sites et monuments"],
  isBookmarked = false,
}: LocationCardProps) => {
  const dayAbbreviations = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Card className="w-full absolute -right-[105%] max-h-[300px] overflow-auto bottom-0 max-w-4xl mx-auto bg-card shadow-lg border-0">
      {/* Navigation Tabs */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-12 p-0">
          <TabsTrigger
            value="about"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-location-marker data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="book"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-location-marker data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Book
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-location-marker data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-location-marker data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Photos
          </TabsTrigger>
          <TabsTrigger
            value="mentions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-location-marker data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Mentions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-0 p-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Location Header */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-location-marker text-white rounded-full text-sm font-semibold mt-1">
                  1
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {name}
                  </h1>
                  <p className="text-foreground leading-relaxed mb-4">
                    {description}
                  </p>

                  {/* Bookmark Button */}
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-tag-bg text-tag-text hover:bg-tag-bg/80"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Added
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="flex items-center gap-2 mb-6">
                    {categories.map((category, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-tag-bg text-tag-text hover:bg-tag-bg/80 font-normal"
                      >
                        {category}
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-tag-text p-1 h-auto"
                    >
                      Show 5 more
                    </Button>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-rating-star text-rating-star" />
                      <span className="font-semibold">{rating}</span>
                      <span className="text-muted-foreground">
                        ({reviewCount.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          G
                        </span>
                      </div>
                      <span>•</span>
                      <span>Mentioned by</span>
                      <div className="flex gap-1">
                        <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
                        <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                        <div className="w-5 h-5 bg-green-600 rounded-sm"></div>
                      </div>
                      <span className="text-link-blue">+93 other lists</span>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{address}</span>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-foreground">{hours}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {dayAbbreviations.map((day) => (
                            <span
                              key={day}
                              className={`text-xs px-1 ${day === "Mo" ? "font-semibold" : "text-muted-foreground"}`}
                            >
                              {day}
                            </span>
                          ))}
                          <button className="text-xs text-link-blue ml-2">
                            Show times
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        People typically spend {duration} here
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <button className="text-link-blue hover:underline">
                        {phone}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <button className="text-link-blue hover:underline truncate">
                        {website}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="w-80 h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                // src={""}
                alt="Palais de la réunification"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="book" className="mt-0 p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Booking options will be available here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-0 p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Reviews will be displayed here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-0 p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Photo gallery will be shown here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="mentions" className="mt-0 p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Mentions and reviews will be listed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LocationCard;
