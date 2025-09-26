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
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPlaceById } from "@/lib/actions/place.action";
import { FaStar } from "react-icons/fa6";
import ImageGallery from "../images/ImageGallery";

interface LocationCardProps {
  placeId?: string;
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
  placeId,
  name: propName = "Bến Thành market",
  description: propDescription = "Well-known standby for handicrafts, souvenirs, clothing & other goods along with local eats.",
  rating: propRating = 4.5,
  reviewCount: propReviewCount = 42212,
  address: propAddress = "Ben Thanh, District 1, Ho Chi Minh City, Vietnam",
  hours: propHours = "Monday: 8:00–15:30",
  duration: propDuration = "2 hr",
  phone: propPhone = "+84 28 3822 3652",
  website: propWebsite = "https://www.dinhdoclap.gov.vn/",
  categories: propCategories = ["Musée", "Sites et monuments"],
  isBookmarked = false,
}: LocationCardProps) => {
  const dayAbbreviations = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // State for fetched place data
  const [placeData, setPlaceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listImages, setListImages] = useState<string[]>([])
  // Fetch place data by ID
  useEffect(() => {
    if (placeId) {
      setLoading(true);
      setError(null);
      
      const fetchPlaceData = async () => {
        try {
          console.log("🔍 Fetching place data for ID:", placeId);
          const result = await getPlaceById(placeId);
          
          if (result?.success && result?.data) {
            console.log("✅ Place data fetched successfully:", result.data);
                const listImgs = result?.data?.place?.imageKeys?.map(
                    (item: string) =>
                      `https://itin-dev.wanderlogstatic.com/freeImageSmall/${item}`
                  );
            setPlaceData(result.data);
            setListImages(listImgs ?? []);
          } else {
            console.error("❌ Failed to fetch place data:", result);
            setError("Failed to load place details");
          }
        } catch (err) {
          console.error("❌ Error fetching place data:", err);
          setError("Error loading place details");
        } finally {
          setLoading(false);
        }
      };

      fetchPlaceData();
    }
  }, [placeId]);

  // Use fetched data if available, otherwise use props/defaults
  const name = placeData?.name || propName;
  const description = placeData?.description || placeData?.generatedDescription || propDescription;
  const rating = placeData?.rating || propRating;
  const reviewCount = placeData?.numRatings || propReviewCount;
  const address = placeData?.address?.fullAddress || placeData?.address || propAddress;
  const hours = placeData?.openingHours || propHours;
  const duration = placeData?.duration || propDuration;
  const phone = placeData?.internationalPhoneNumber || placeData?.phone || propPhone;
  const website = placeData?.website || propWebsite;
  const categories = placeData?.categories || propCategories;

  console.log("dataPlace", placeData)
  return (
    <Card className="w-full !z-1200 !bg-white absolute -right-[105%] max-h-[300px] overflow-auto bottom-4 max-w-4xl mx-auto shadow-lg border-0"
    style={{ zIndex: 1200 ,
      overflow: "auto"
    }}
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading place details...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8 text-red-500">
          <span>{error}</span>
        </div>
      ) : (
        <>
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
            <div className="flex-1 space-y-4">
              {/* Location Header */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-location-marker text-red-500 rounded-full text-sm font-semibold mt-1">
                  1
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {placeData?.place?.name}
                  </h1>
                  <p className="text-foreground leading-relaxed text-[12px] mb-4">
                    {placeData?.place?.generatedDescription}
                  </p>

                  {/* Bookmark Button */}
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      // variant="secondary"
                      variant={"outline"}
                      size="sm"
                      className="bg-tag-bg text-tag-text hover:bg-tag-bg/80"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Added
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {placeData?.place?.categories?.map((category: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-tag-bg text-tag-text hover:bg-tag-bg/80 font-normal !bg-gray-100"
                      >
                        {category}
                      </Badge>
                    ))}
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      className="text-tag-text p-1 h-auto"
                    >
                      Show 5 more
                    </Button> */}
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex flex-1 items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      <FaStar className="w-5 h-5 text-yellow-500 fill-rating-star text-rating-star" />
                      <span className="font-semibold text-yellow-500">{placeData?.place?.rating}</span>
                      <span className="text-muted-foreground">
                        ({placeData?.place?.numRatings.toLocaleString()})
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    </div> */}
                  </div>

                  {/* Location Info */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin size={14} className="text-muted-foreground mt-0.5" />
                      <span className="text-foreground text-[12px]">{placeData?.place?.address?.fullAddress}</span>
                    </div>

                    {/* Hours */}
                    <div className="flex text-[12px] items-start gap-3">
                      <Clock size={14} className="text-muted-foreground mt-0.5" />
                      <div className="text-[12px]">
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
                    <div className="flex text-[12px] items-center gap-3">
                      <Timer size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        People typically spend {placeData?.place?.duration || '2h'} here
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex  text-[12px] items-center gap-3">
                      <Phone size={14} className="text-muted-foreground" />
                      <button className="text-link-blue hover:underline">
                        {placeData?.place?.internationalPhoneNumber}
                      </button>
                    </div>

                    <div className="flex text-[12px] items-center gap-3">
                      <Globe size={14} className=" text-muted-foreground" />
                      <a href={website} className="text-link-blue hover:underline truncate">
                        {placeData?.place?.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="w-[180px] rounded-lg overflow-hidden bg-muted flex-shrink-0">
         
                {listImages?.length > 0 && <ImageGallery
                                          images={listImages}
                                          mainImageIndex={0}
                                          alt="Gallery description"
                                          // className="w-full"
                                        />}
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
        </>
      )}
    </Card>
  );
};

export default LocationCard;
