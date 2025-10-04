"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardCarouselProps {
  children: React.ReactNode;
  className?: string;
  itemsToShow?: number;
  gap?: number;
}

const CardCarousel: React.FC<CardCarouselProps> = ({
  children,
  className,
  itemsToShow = 4,
  gap = 16,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < totalItems - itemsToShow;

  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      // Calculate new index bounds
      const newIndex = Math.max(0, Math.min(index, totalItems - itemsToShow));
      setCurrentIndex(newIndex);

      // Calculate item width including gap
      const itemWidth = containerRef.current.clientWidth / itemsToShow;

      // Smooth scroll to the new position
      containerRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  return (
    <div className={cn("relative group", className)}>
      <div
        ref={containerRef}
        className="flex overflow-x-hidden scroll-smooth"
        style={{ gap: `${gap}px` }}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{
              width: `calc((100% - ${(itemsToShow - 1) * gap}px) / ${itemsToShow})`,
              scrollSnapAlign: "start",
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center z-10 opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center z-10 opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default CardCarousel;
