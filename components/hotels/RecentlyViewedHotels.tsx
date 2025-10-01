"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RecentHotel = {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  price: number;
};

const RecentlyViewedHotels = () => {
  const [recentHotels, setRecentHotels] = useState<RecentHotel[]>([]);

  useEffect(() => {
    try {
      const storedHotels = localStorage.getItem("recentlyViewedHotels");
      if (storedHotels) {
        setRecentHotels(JSON.parse(storedHotels));
      }
    } catch (error) {
      console.error("Failed to load recently viewed hotels", error);
    }
  }, []);

  if (recentHotels.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-gray-50 border-t">
      <h2 className="text-lg font-semibold mb-4">Khách sạn đã xem gần đây</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {recentHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="min-w-[250px] border rounded-lg bg-white overflow-hidden shadow-sm"
          >
            <div className="relative h-[150px]">
              {hotel.imageUrl ? (
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Không có hình</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{hotel.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{hotel.location}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-primary-600 font-semibold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(hotel.price)}
                </span>
                <Link href={`/hotels/${hotel.id}`}>
                  <Button size="sm" className="text-xs h-8 px-3">
                    Xem lại
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedHotels;
