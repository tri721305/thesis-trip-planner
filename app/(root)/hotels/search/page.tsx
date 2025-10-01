"use client";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import ProvinceWardSearch from "@/components/search/ProviceWardSearch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/buttons/BackButton";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Hotel, Star } from "lucide-react";
import { GrLikeFill } from "react-icons/gr";
import { BiSolidLike } from "react-icons/bi";
import { getHotels, getHotelsByWanderlog } from "@/lib/actions/hotel.action";
import { searchAvailableHotels } from "@/lib/actions/hotel-search.action";
import ImageGallery from "@/components/images/ImageGallery";
import { capitalizeFirstLetter } from "@/lib/utils";
import Map from "@/components/Map";
import RecentlyViewedHotels from "@/components/hotels/RecentlyViewedHotels";

const HotelSearchPage = () => {
  const [location, setLocation] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to tomorrow
  });
  const [rangePrice, setRangePrice] = useState([300000, 2000000]);
  const [hotelList, setHotelList] = useState<
    { hotels: any[]; isNext: boolean } | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"all" | "available">("all");
  const [roomCount, setRoomCount] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  // Function to format rating without unnecessary decimals
  const formatRating = (rating: number) => {
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
  };
  const handleGetHotelsByWanderLog = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Sử dụng hàm getHotelsByWanderlog thay vì getHotels với filter
      const { data, success, error } = await getHotelsByWanderlog({
        page: 1,
        pageSize: 10,
        filter: {
          sortBy:
            sortBy === "price_asc"
              ? "price"
              : sortBy === "price_desc"
                ? "price"
                : sortBy === "popularity"
                  ? "popularity"
                  : "rating",
          sortOrder: sortBy === "price_asc" ? 1 : -1,
        },
      });

      console.log("Wanderlog hotels:", data);

      if (success && data) {
        setHotelList(data);
        setSearchPerformed(true);

        if (data.hotels.length === 0) {
          setError("Không tìm thấy khách sạn Wanderlog");
        }
      } else if (error) {
        console.error("Error fetching Wanderlog hotels:", error);
        setError(error.message || "Không thể lấy dữ liệu khách sạn Wanderlog");
      }
    } catch (err) {
      console.error("Exception when fetching Wanderlog hotels:", err);
      setError("Đã xảy ra lỗi khi tìm kiếm khách sạn Wanderlog");
    } finally {
      setIsLoading(false);
    }
  };
  // Hàm tìm kiếm tất cả khách sạn
  const fetchAllHotels = async (page = 1, pageSize = 10, query?: string) => {
    try {
      setIsLoading(true);

      // Chuẩn bị tham số sort cho API
      let sortOptions = {};
      switch (sortBy) {
        case "rating":
          sortOptions = { sortBy: "rating", sortOrder: -1 };
          break;
        case "price_asc":
          sortOptions = { sortBy: "price", sortOrder: 1 };
          break;
        case "price_desc":
          sortOptions = { sortBy: "price", sortOrder: -1 };
          break;
        case "popularity":
          sortOptions = { sortBy: "ratingCount", sortOrder: -1 };
          break;
        default:
          sortOptions = { sortBy: "rating", sortOrder: -1 };
      }

      const { data, success, error } = await getHotels({
        page,
        pageSize,
        query: query || undefined,
        filter: {
          ...sortOptions,
        },
      });

      console.log("All hotels:", data);
      if (success) {
        setHotelList(data);
        setSearchPerformed(true);
      } else if (error) {
        console.error("Error fetching hotels:", error);
        setError(error.message || "Không thể tìm khách sạn");
      }
    } catch (err: any) {
      console.error("Exception when fetching hotels:", err);
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm tìm kiếm khách sạn có phòng trống
  const searchAvailableRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Đảm bảo ngày hợp lệ
      const checkInDate = new Date(selectedDateRange.from);
      const checkOutDate = new Date(selectedDateRange.to);

      // Đảm bảo check-out sau check-in
      if (checkInDate >= checkOutDate) {
        setError("Ngày check-out phải sau ngày check-in");
        setIsLoading(false);
        return;
      }

      // Chuẩn bị tham số sort cho API
      let sortOptions = {};
      switch (sortBy) {
        case "rating":
          sortOptions = { sortBy: "rating" };
          break;
        case "price_asc":
          sortOptions = { sortBy: "price", sortOrder: "asc" };
          break;
        case "price_desc":
          sortOptions = { sortBy: "price", sortOrder: "desc" };
          break;
        case "popularity":
          sortOptions = { sortBy: "popularity" };
          break;
        default:
          sortOptions = { sortBy: "rating" };
      }

      const result = await searchAvailableHotels({
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        adults,
        children,
        roomCount,
        minPrice: rangePrice[0],
        maxPrice: rangePrice[1],
        minRating: minRating > 0 ? minRating : undefined,
        location: location || undefined,
        ...sortOptions,
      });

      console.log("Available hotels:", result);

      if (result.success && result.data) {
        setHotelList(result.data);
        setSearchPerformed(true);

        if (result.data.hotels.length === 0) {
          setError("Không tìm thấy khách sạn phù hợp với điều kiện tìm kiếm");
        }
      } else {
        setError(result.error?.message || "Không thể tìm kiếm khách sạn");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(
        `Đã xảy ra lỗi khi tìm kiếm: ${err.message || "Lỗi không xác định"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    if (searchType === "available") {
      searchAvailableRooms();
    } else {
      fetchAllHotels(1, 10, location);
    }
  };

  // Hàm lưu khách sạn vào danh sách đã xem gần đây
  const saveToRecentlyViewed = (hotel: any, hotelId: any) => {
    try {
      const recentHotel = {
        id: hotelId.toString(),
        name: hotel?.lodging?.name || "Khách sạn",
        imageUrl: hotel?.lodging?.images?.[0]?.url || "",
        location: hotel?.lodging?.address || "",
        price: hotel?.priceRate?.total?.amount || hotel?.priceRate?.amount || 0,
      };

      // Lấy danh sách hiện tại
      let recentHotels = [];
      const storedHotels = localStorage.getItem("recentlyViewedHotels");
      if (storedHotels) {
        recentHotels = JSON.parse(storedHotels);
      }

      // Kiểm tra nếu khách sạn đã tồn tại trong danh sách
      const existingIndex = recentHotels.findIndex(
        (h: any) => h.id === recentHotel.id
      );
      if (existingIndex !== -1) {
        // Xóa khách sạn đã tồn tại
        recentHotels.splice(existingIndex, 1);
      }

      // Thêm khách sạn mới vào đầu danh sách
      recentHotels.unshift(recentHotel);

      // Giữ tối đa 5 khách sạn gần đây
      if (recentHotels.length > 5) {
        recentHotels = recentHotels.slice(0, 5);
      }

      // Lưu lại vào localStorage
      localStorage.setItem(
        "recentlyViewedHotels",
        JSON.stringify(recentHotels)
      );
    } catch (err) {
      console.error("Failed to save recently viewed hotel", err);
    }
  };

  // Tải khách sạn khi trang được mở lần đầu
  useEffect(() => {
    fetchAllHotels();
  }, []);

  // Cập nhật kết quả khi thay đổi cách sắp xếp
  useEffect(() => {
    if (searchPerformed) {
      if (searchType === "available") {
        searchAvailableRooms();
      } else {
        fetchAllHotels(1, 10, location);
      }
    }
  }, [sortBy]);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <section
        className="flex-1 overflow-auto"
        style={{ boxShadow: "1px 1px 10px 1px lightgray" }}
      >
        <div className="flex justify-between items-center p-2">
          <div className="flex gap-2">
            <BackButton />
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => (window.location.href = "/hotels/test-search")}
            >
              Thử nghiệm tìm kiếm phòng trống
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-2 min-w-[300px]">
              <Label>Điểm đến</Label>
              <ProvinceWardSearch
                onPlaceSelect={(place) => {
                  setLocation(place?.displayName || place);
                }}
                placeholder="Thành phố, quận/huyện..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Ngày đặt phòng</Label>
              <CalendarDatePicker
                date={selectedDateRange}
                onDateSelect={(e) => {
                  setSelectedDateRange(e);
                }}
                typeShow="reduce"
                className="h-[56px] !bg-[#f3f4f5] text-black w-full border-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Khách & Phòng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-[56px] !bg-[#f3f4f5] text-black border-none"
                  >
                    {roomCount} phòng, {adults} người lớn, {children} trẻ em
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="leading-none font-medium">
                        Phòng & Khách
                      </h4>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="rooms">Phòng</Label>
                        <Input
                          id="rooms"
                          type="number"
                          value={roomCount}
                          min={1}
                          onChange={(e) =>
                            setRoomCount(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="adults">Người lớn</Label>
                        <Input
                          id="adults"
                          type="number"
                          value={adults}
                          min={1}
                          onChange={(e) =>
                            setAdults(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="children">Trẻ em</Label>
                        <Input
                          id="children"
                          type="number"
                          value={children}
                          min={0}
                          onChange={(e) =>
                            setChildren(
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="col-span-2 h-8"
                        />
                      </div>
                    </div>
                    <Separator className="mt-1" />
                    <div className="flex gap-2 w-full justify-end">
                      <Button
                        variant={"outline"}
                        onClick={() => {
                          setRoomCount(1);
                          setAdults(2);
                          setChildren(0);
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        className="bg-primary-500 hover:bg-orange-500"
                        onClick={() => {
                          document.body.click(); // Close popover
                        }}
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="h-[56px] bg-primary-500 hover:bg-orange-500"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tìm...
                  </div>
                ) : (
                  "Tìm khách sạn"
                )}
              </Button>
            </div>
          </div>
        </div>
        <Separator className="my-2" />
        <div className="p-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <Label className="font-bold">
              Giá phòng:{" "}
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                }).format(rangePrice[0])}{" "}
                -
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                }).format(rangePrice[1])}
              </span>
            </Label>
            <Slider
              value={rangePrice}
              min={100000}
              max={5000000}
              step={100000}
              className="w-[300px]"
              onValueChange={(value) => {
                setRangePrice(value);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-2 items-center">
              <Label className="whitespace-nowrap">Tìm kiếm:</Label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "all" | "available")
                }
              >
                <option value="all">Tất cả khách sạn</option>
                <option value="available">Khách sạn có phòng trống</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <Label className="whitespace-nowrap">Sắp xếp:</Label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Xếp hạng cao nhất</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="popularity">Phổ biến nhất</option>
              </select>
            </div>

            <div
              className="flex gap-2 bg-gray-200 items-center p-2 rounded-[40px] w-fit px-4 cursor-pointer"
              onClick={() => {
                const newRating = minRating === 0 ? 7 : 0;
                setMinRating(newRating);
              }}
            >
              <Star
                size={14}
                className={minRating > 0 ? "text-yellow-500" : ""}
              />
              {minRating > 0 ? `Đánh giá ≥ ${minRating}` : "Mọi đánh giá"}
            </div>

            <div
              onClick={handleGetHotelsByWanderLog}
              className="flex gap-2 bg-gray-200 items-center p-2 rounded-[40px] w-fit px-4 cursor-pointer hover:bg-gray-300"
            >
              <Hotel size={14} /> Khách sạn Wanderlog
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRangePrice([300000, 2000000]);
                setMinRating(0);
                setSearchType("all");
                setSortBy("rating");
              }}
            >
              Reset bộ lọc
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-2 my-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              <p className="mt-4 text-gray-600">Đang tìm kiếm khách sạn...</p>
            </div>
          </div>
        )}
        <Separator className="my-2" />
        <div className="space-y-4 my-4">
          {searchPerformed && !isLoading && hotelList?.hotels && (
            <div className="px-4 text-lg font-semibold">
              Tìm thấy {hotelList.hotels.length} khách sạn
              {searchType === "available" && " có phòng trống"}
            </div>
          )}

          {hotelList?.hotels?.map((hotel, index) => {
            const listImgs = hotel?.lodging?.images?.map(
              (img: any) => img?.url
            );

            // Đảm bảo chúng ta có một key duy nhất, dù là string hoặc ObjectId
            const hotelKey =
              typeof hotel?._id === "string" ? hotel?._id : `hotel-${index}`;

            return (
              <div
                key={hotelKey}
                className="flex flex-col md:flex-row gap-2 items-start px-4 py-4 border-b hover:bg-gray-50"
              >
                <div className="w-full md:w-[180px]">
                  <ImageGallery
                    className="w-full h-[160px] md:h-[120px] rounded-md overflow-hidden object-cover"
                    images={listImgs}
                    mainImageIndex={0}
                    alt={hotel?.lodging?.name || "Hotel image"}
                  />
                </div>
                <div className="px-0 md:px-4 flex-1 flex flex-col md:flex-row justify-between w-full gap-4">
                  <div className="max-w-full md:max-w-[360px] flex-1">
                    <h1 className="text-lg font-semibold">
                      {hotel?.lodging?.name}
                    </h1>

                    <div className="flex items-center gap-2 mt-1">
                      {hotel?.lodging?.hotelClass > 0 && (
                        <div className="flex">
                          {Array.from(
                            { length: Math.min(hotel.lodging.hotelClass, 5) },
                            (_, i) => (
                              <span key={i} className="text-yellow-500">
                                ⭐
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {hotel?.isLowAvailability && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                          Sắp hết phòng!
                        </span>
                      )}
                    </div>

                    {hotel?.lodging?.address && (
                      <div className="text-sm text-gray-600 mt-1 flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {hotel.lodging.address}
                      </div>
                    )}

                    <div className="mt-2">
                      <ul className="flex flex-wrap gap-[12px] gap-y-1">
                        {hotel?.lodging?.amenities
                          ?.slice(0, 6)
                          .map((amenity: any, i: number) => (
                            <li
                              className="text-[11px] bg-gray-100 px-2 py-1 rounded"
                              key={amenity?.name + i}
                            >
                              {amenity?.name}
                            </li>
                          ))}
                        {(hotel?.lodging?.amenities?.length || 0) > 6 && (
                          <li className="text-[11px] bg-gray-100 px-2 py-1 rounded">
                            +{(hotel?.lodging?.amenities?.length || 0) - 6} tiện
                            ích khác
                          </li>
                        )}
                      </ul>
                    </div>

                    {hotel?.availableRooms !== undefined && (
                      <div className="mt-2 text-sm font-semibold text-green-600">
                        {hotel.availableRooms} phòng trống có sẵn
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col justify-between md:items-end gap-4 mt-4 md:mt-0">
                    <div className="flex gap-1 items-center">
                      <div className="p-2 text-white w-[40px] h-[40px] flex items-center justify-center rounded-md bg-blue-900">
                        <p className="font-bold">
                          {formatRating(
                            hotel?.lodging?.wanderlogRating ||
                              hotel?.lodging?.rating?.value ||
                              10
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px]">
                          Tuyệt vời ({hotel?.lodging?.ratingCount || 0})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <h1 className="font-bold text-[16px] text-primary-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          minimumFractionDigits: 0,
                        }).format(
                          hotel?.priceRate?.total?.amount ||
                            hotel?.priceRate?.amount ||
                            0
                        )}
                      </h1>
                      <span className="text-xs text-gray-500">/ đêm</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            console.log("hotel selected", hotel);
                            const hotelId = hotel?.offerId;
                            if (hotelId) {
                              saveToRecentlyViewed(hotel, hotelId);
                              window.open(
                                `/hotels/details/${hotelId}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          className="bg-primary-500 hover:bg-primary-600 flex-1"
                          onClick={() => {
                            const hotelId = hotel?._id || hotel?.lodging?._id;
                            if (hotelId) {
                              saveToRecentlyViewed(hotel, hotelId);
                              const url = `/hotels/${hotelId}?checkIn=${selectedDateRange.from.toISOString()}&checkOut=${selectedDateRange.to.toISOString()}&rooms=${roomCount}&adults=${adults}&children=${children}`;
                              window.location.href = url;
                            }
                          }}
                        >
                          Đặt phòng
                        </Button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {capitalizeFirstLetter(hotel?.source || "")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {hotelList?.hotels?.length === 0 && !isLoading && searchPerformed && (
            <div className="flex flex-col items-center justify-center py-10">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Không tìm thấy khách sạn phù hợp
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Thử thay đổi điều kiện tìm kiếm hoặc ngày đặt phòng
              </p>
              <Button
                className="mt-4 bg-primary-500 hover:bg-primary-600"
                onClick={() => {
                  setRangePrice([300000, 2000000]);
                  setMinRating(0);
                  setSearchType("all");
                  fetchAllHotels();
                }}
              >
                Xem tất cả khách sạn
              </Button>
            </div>
          )}
        </div>

        {/* Khách sạn đã xem gần đây */}
        <RecentlyViewedHotels />
      </section>
      <section className="flex-1">
        <Map hotels={hotelList?.hotels} />
      </section>
    </div>
  );
};

export default HotelSearchPage;
