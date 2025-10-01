"use client";

import React, { useState, useEffect } from "react";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import Map from "@/components/Map";
import { searchAvailableHotels } from "@/lib/actions/hotel-search.action";
import ProvinceWardSearch from "@/components/search/ProviceWardSearch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const HotelSearchTest = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy giá trị từ URL parameters nếu có
  const getParamDate = (param: string): Date | null => {
    const dateStr = searchParams.get(param);
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Thiết lập ngày từ và đến (mặc định là hôm nay và ngày mai)
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // State cho tìm kiếm
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: getParamDate("checkIn") || today,
    to: getParamDate("checkOut") || tomorrow,
  });
  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
  const [children, setChildren] = useState(
    Number(searchParams.get("children")) || 0
  );
  const [roomCount, setRoomCount] = useState(
    Number(searchParams.get("rooms")) || 1
  );
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 300000,
    Number(searchParams.get("maxPrice")) || 2000000,
  ]);
  const [minRating, setMinRating] = useState(
    Number(searchParams.get("rating")) || 7
  );

  // State cho kết quả
  const [hotelList, setHotelList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Hàm cập nhật URL params
  const updateUrlParams = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href);

    // Cập nhật hoặc xóa tham số
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    // Cập nhật URL mà không làm tải lại trang
    window.history.pushState({}, "", url.toString());
  };

  // Hàm tìm kiếm khách sạn
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Xóa dữ liệu tìm kiếm cũ
    setHotelList([]);

    try {
      // Đảm bảo ngày hợp lệ - tạo bản sao để tránh lỗi mutate
      const checkInDate = new Date(selectedDateRange.from);
      const checkOutDate = new Date(selectedDateRange.to);

      // Đảm bảo check-out sau check-in
      if (checkInDate >= checkOutDate) {
        setError("Ngày check-out phải sau ngày check-in");
        setIsLoading(false);
        return;
      }

      // Cập nhật URL params
      updateUrlParams({
        location: location || null,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: adults.toString(),
        children: children.toString(),
        rooms: roomCount.toString(),
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        rating: minRating.toString(),
      });

      // Tìm kiếm với thông tin ngày tháng được chuẩn hóa
      const result = await searchAvailableHotels({
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        adults,
        children,
        roomCount,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating: minRating > 0 ? minRating : undefined,
        location: location || undefined,
      });

      console.log("Search result:", result);

      if (result.success && result.data) {
        setHotelList(result.data.hotels || []);
        setSearchPerformed(true);

        if (result.data.hotels.length === 0) {
          setError(
            "Không tìm thấy khách sạn phù hợp với điều kiện tìm kiếm. Thử thay đổi ngày đặt phòng hoặc bỏ bớt điều kiện lọc."
          );
        }
      } else {
        setError(
          result.error?.message ||
            "Không thể tìm kiếm khách sạn. Vui lòng thử lại."
        );
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

  // Format giá hiển thị
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Tự động tìm kiếm khi trang được tải và có tham số tìm kiếm
  useEffect(() => {
    const hasSearchParams =
      searchParams.has("checkIn") && searchParams.has("checkOut");

    if (hasSearchParams && !searchPerformed) {
      handleSearch(new Event("submit") as unknown as React.FormEvent);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold">Tìm kiếm khách sạn có phòng trống</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Tiêu chí tìm kiếm</CardTitle>
          <CardDescription>
            Nhập thông tin để tìm khách sạn phù hợp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Địa điểm</Label>
                <ProvinceWardSearch
                  onPlaceSelect={(place: any) => setLocation(place)}
                  placeholder="Tìm kiếm điểm đến"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Ngày đặt phòng</Label>
                <CalendarDatePicker
                  date={selectedDateRange}
                  onDateSelect={(e: any) => setSelectedDateRange(e)}
                  typeShow="reduce"
                  className="h-[56px] !bg-[#f3f4f5] text-black w-full border-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-2 flex-1">
                  <Label>Số phòng</Label>
                  <Input
                    type="number"
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    min={1}
                    className="h-[56px]"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Label>Người lớn</Label>
                  <Input
                    type="number"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    min={1}
                    className="h-[56px]"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Label>Trẻ em</Label>
                  <Input
                    type="number"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    min={0}
                    className="h-[56px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label>
                  Khoảng giá: {formatPrice(priceRange[0])} -{" "}
                  {formatPrice(priceRange[1])}
                </Label>
                <Slider
                  value={priceRange}
                  min={100000}
                  max={5000000}
                  step={100000}
                  onValueChange={setPriceRange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Đánh giá tối thiểu: {minRating}/10</Label>
                <Slider
                  value={[minRating]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(val) => setMinRating(val[0])}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 h-[56px] flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Đang tìm...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                    <span>Tìm khách sạn có phòng trống</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-[56px]"
                onClick={() => {
                  // Reset tất cả các trường về giá trị mặc định
                  setLocation("");
                  setSelectedDateRange({
                    from: today,
                    to: tomorrow,
                  });
                  setAdults(2);
                  setChildren(0);
                  setRoomCount(1);
                  setPriceRange([300000, 2000000]);
                  setMinRating(7);

                  // Xóa kết quả tìm kiếm
                  setHotelList([]);
                  setSearchPerformed(false);
                  setError(null);

                  // Xóa URL params
                  updateUrlParams({
                    location: null,
                    checkIn: null,
                    checkOut: null,
                    adults: null,
                    children: null,
                    rooms: null,
                    minPrice: null,
                    maxPrice: null,
                    rating: null,
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {searchPerformed && !isLoading && hotelList.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="text-lg font-semibold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-primary-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Tìm thấy{" "}
            <span className="text-primary-600">{hotelList.length}</span> khách
            sạn có phòng trống
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              onChange={(e) => {
                const hotels = [...hotelList];

                switch (e.target.value) {
                  case "price-asc":
                    hotels.sort(
                      (a, b) =>
                        (a.priceRate?.total?.amount ||
                          a.priceRate?.amount ||
                          0) -
                        (b.priceRate?.total?.amount || b.priceRate?.amount || 0)
                    );
                    break;
                  case "price-desc":
                    hotels.sort(
                      (a, b) =>
                        (b.priceRate?.total?.amount ||
                          b.priceRate?.amount ||
                          0) -
                        (a.priceRate?.total?.amount || a.priceRate?.amount || 0)
                    );
                    break;
                  case "rating-desc":
                    hotels.sort(
                      (a, b) =>
                        (b.lodging?.rating?.value ||
                          b.lodging?.wanderlogRating ||
                          0) -
                        (a.lodging?.rating?.value ||
                          a.lodging?.wanderlogRating ||
                          0)
                    );
                    break;
                  case "available-desc":
                    hotels.sort(
                      (a, b) =>
                        (b.availableRooms || 0) - (a.availableRooms || 0)
                    );
                    break;
                }

                setHotelList(hotels);
              }}
            >
              <option value="">Sắp xếp theo</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
              <option value="rating-desc">Đánh giá: cao nhất</option>
              <option value="available-desc">Số phòng trống: nhiều nhất</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                // Lọc khách sạn có ưu đãi đặc biệt
                const promotedHotels = hotelList.filter(
                  (hotel) => hotel.isPromoted
                );
                if (promotedHotels.length > 0) {
                  setHotelList(promotedHotels);
                } else {
                  setError("Không tìm thấy khách sạn nào có ưu đãi đặc biệt");
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Chỉ hiện ưu đãi
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Danh sách khách sạn */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 lg:col-span-2">
          {hotelList.map((hotel) => (
            <Card
              key={hotel._id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500"
            >
              <div className="flex md:flex-row flex-col">
                {/* Hình ảnh */}
                <div className="w-full md:w-1/3 h-48 bg-gray-100 relative overflow-hidden">
                  {hotel.lodging?.images && hotel.lodging.images.length > 0 ? (
                    <>
                      <img
                        src={hotel.lodging.images[0].url}
                        alt={hotel.lodging.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      {hotel.lodging.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          +{hotel.lodging.images.length - 1} ảnh
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  {hotel.isLowAvailability && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs">
                      Sắp hết phòng!
                    </div>
                  )}
                </div>

                {/* Thông tin khách sạn */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold line-clamp-2">
                      {hotel.lodging?.name}
                    </h3>
                    {hotel.isPromoted && (
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        Khuyến mãi
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    <div className="flex">
                      {Array.from({
                        length: Math.min(hotel.lodging?.hotelClass || 0, 5),
                      }).map((_, i) => (
                        <span key={i} className="text-yellow-500">
                          ⭐
                        </span>
                      ))}
                    </div>

                    {(hotel.lodging?.rating?.value ||
                      hotel.lodging?.wanderlogRating) && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                        {(
                          hotel.lodging?.rating?.value ||
                          hotel.lodging?.wanderlogRating
                        ).toFixed(1)}
                        /10
                      </span>
                    )}

                    <span className="text-green-600 font-semibold text-xs px-2 py-1 bg-green-50 rounded-full">
                      {hotel.availableRooms} phòng trống
                    </span>
                  </div>

                  {hotel.lodging?.address?.locality && (
                    <div className="text-gray-600 text-sm mt-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-4 h-4 mr-1"
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
                      {hotel.lodging.address.locality}
                      {hotel.lodging.address.district &&
                        `, ${hotel.lodging.address.district}`}
                    </div>
                  )}

                  {hotel.lodging?.amenities && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {hotel.lodging.amenities
                        .slice(0, 5)
                        .map((amenity: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {amenity.name}
                          </Badge>
                        ))}
                      {hotel.lodging.amenities.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.lodging.amenities.length - 5} tiện ích khác
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(
                          hotel.priceRate?.total?.amount ||
                            hotel.priceRate?.amount ||
                            0
                        )}
                      </span>
                      <span className="text-sm text-gray-500"> / đêm</span>
                      <div className="text-xs text-gray-500">
                        Đã bao gồm thuế & phí
                      </div>
                    </div>

                    <Button className="bg-primary-500 hover:bg-primary-600 gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
                        />
                      </svg>
                      Đặt ngay
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {isLoading && (
            <div className="text-center py-10">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-primary-500 mb-4"></div>
                <p className="text-lg text-gray-700 font-semibold">
                  Đang tìm kiếm khách sạn...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Vui lòng đợi trong giây lát
                </p>
              </div>
            </div>
          )}

          {searchPerformed && hotelList.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-lg text-gray-500">
                Không tìm thấy khách sạn nào phù hợp với điều kiện tìm kiếm.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Hãy thử thay đổi ngày đặt phòng hoặc các tiêu chí khác.
              </p>
              <Button
                onClick={() => {
                  setMinRating(0);
                  setPriceRange([100000, 5000000]);
                }}
                variant="outline"
                className="mt-4"
              >
                Bỏ điều kiện lọc
              </Button>
            </div>
          )}
        </div>

        {/* Bản đồ */}
        <div className="h-[70vh] lg:h-[80vh] sticky top-4">
          <div className="rounded-lg overflow-hidden h-full shadow-md border border-gray-200">
            <Map hotels={hotelList} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchTest;
