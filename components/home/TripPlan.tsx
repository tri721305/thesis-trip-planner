"use client";

import React, { useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./TripPlan.module.css";

const TripPlan = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };
  return (
    <div className="w-screen h-screen py-10 px-20 flex justify-start gap-4 flex-col items-center">
      <h1 className="font-montserrat font-extrabold  uppercase text-5xl text-center mb-16">
        Trip Plan
      </h1>
      <div className="flex px-20 w-full">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="font-extrabold font-montserrat text-4xl">
              Browse More
            </h1>
            <h1 className="font-extrabold font-montserrat text-4xl">
              Trip Types and{" "}
            </h1>
            <h1 className="font-extrabold font-montserrat text-4xl">
              Interests
            </h1>
          </div>
          <div className="flex-center gap-2">
            <div
              className="w-[40px] h-[40px] border border-black flex-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handlePrev}
            >
              <FaArrowLeft />
            </div>
            <div
              className="w-[40px] h-[40px] border border-black flex-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleNext}
            >
              <FaArrowRight />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={2}
            navigation={false}
            loop={true}
            pagination={{ clickable: true }}
            className="w-[800px] !pb-[50px]"
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={() => console.log("slide change")}
          >
            <SwiperSlide>
              <div className="w-full h-[400px] cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Hồ Chí Minh City</h2>
                  <p className="text-lg">Dynamic urban experience</p>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="w-full cursor-pointer h-[400px] bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Đà Lạt</h2>
                  <p className="text-lg">Mountain retreat</p>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="w-full cursor-pointer h-[400px] bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Đà Nẵng</h2>
                  <p className="text-lg">Coastal paradise</p>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="w-full cursor-pointer h-[400px] bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Hạ Long</h2>
                  <p className="text-lg">Bay of wonders</p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default TripPlan;
