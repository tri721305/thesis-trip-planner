"use client";

import React, { useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const TripPlanSimple = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePrev = () => {
    console.log("Previous clicked");
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    console.log("Next clicked");
    swiperRef.current?.slideNext();
  };

  return (
    <div className="w-full min-h-screen py-10 px-20">
      <h1 className="font-bold text-3xl text-center mb-16">Trip Plan Simple</h1>

      <div className="flex gap-8 w-full">
        {/* Left side with buttons */}
        <div className="flex-1 flex flex-col justify-center">
          <div>
            <h1 className="font-extrabold text-2xl mb-8">
              Browse More Trip Types and Interests
            </h1>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              className="w-12 h-12 border-2 border-black flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handlePrev}
            >
              <FaArrowLeft />
            </button>
            <button
              className="w-12 h-12 border-2 border-black flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleNext}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Right side with Swiper */}
        <div className="flex-1">
          <div className="bg-gray-100 p-4 rounded-lg">
            <Swiper
              modules={[Pagination]}
              spaceBetween={20}
              slidesPerView={2}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              className="w-full h-96"
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                console.log("Swiper initialized:", swiper);
              }}
              onSlideChange={(swiper) =>
                console.log("Active slide:", swiper.activeIndex)
              }
            >
              <SwiperSlide>
                <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  <div className="text-center">
                    <h3 className="text-2xl mb-2">Hồ Chí Minh City</h3>
                    <p>Urban Adventure</p>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="w-full h-full bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  <div className="text-center">
                    <h3 className="text-2xl mb-2">Đà Lạt</h3>
                    <p>Mountain Escape</p>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="w-full h-full bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  <div className="text-center">
                    <h3 className="text-2xl mb-2">Đà Nẵng</h3>
                    <p>Beach Paradise</p>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="w-full h-full bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  <div className="text-center">
                    <h3 className="text-2xl mb-2">Hạ Long Bay</h3>
                    <p>Natural Wonder</p>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanSimple;
