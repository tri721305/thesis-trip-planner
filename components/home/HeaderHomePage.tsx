"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
const HeaderHomePage = (params: any) => {
  return (
    <div className="w-full overflow-hidden h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        className="w-[105vw] h-[105vh] bg-cover bg-center bg-no-repeat rounded-lg shadow-lg"
        style={{
          backgroundImage:
            // "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
            "url('/images/trucknpeople.jpg')",
        }}
        animate={{
          scale: [1, 0.95, 1.05, 1], // zoom in 95%, zoom out 105%, về lại 100%
        }}
        transition={{
          duration: 10, // tổng thời gian 6s (3s zoom in + 3s zoom out)
          times: [0, 0.5, 1, 1], // timing cho từng keyframe
          ease: "easeInOut", // animation mượt mà
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <h2 className="text-white font-olibrick text-4xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
            T
          </h2>
          <span className="!font-inter text-white font-bold text-4xl">
            Traveler
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default HeaderHomePage;
