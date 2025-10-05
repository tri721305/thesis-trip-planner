"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  optimizeDayRoute,
  applyOptimizedRoute,
} from "@/lib/utils/routeOptimizationHelper";
import RouteOptimizationResult from "./RouteOptimizationResult";
import { toast } from "@/hooks/use-toast";

interface OptimizeRouteButtonProps {
  dayData: any;
  hotelInfo?: any;
  onRouteUpdated: (updatedDayData: any) => void;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

/**
 * Button component to trigger route optimization
 */
const OptimizeRouteButton: React.FC<OptimizeRouteButtonProps> = ({
  dayData,
  hotelInfo,
  onRouteUpdated,
  variant = "secondary",
  size = "sm",
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // Check if day is a route day with enough places
  const isRouteDay = dayData?.type === "route";
  const hasEnoughPlaces =
    isRouteDay &&
    dayData?.data?.filter(
      (item: any) =>
        item.type === "place" && item.location?.coordinates?.length === 2
    )?.length >= 2;

  const handleOptimizeClick = async () => {
    try {
      setIsOptimizing(true);

      // Run optimization
      const result = optimizeDayRoute(dayData, hotelInfo);

      if (result) {
        setOptimizationResult(result);
        setShowResultDialog(true);
      } else {
        toast({
          title: "Không thể tối ưu hóa",
          description: "Không đủ địa điểm có tọa độ để tối ưu hóa tuyến đường.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi tối ưu hóa",
        description:
          error.message || "Đã xảy ra lỗi khi tối ưu hóa tuyến đường.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (optimizationResult) {
      // Apply optimization to day data
      const updatedDayData = applyOptimizedRoute(dayData, optimizationResult);

      // Call parent's update handler
      onRouteUpdated(updatedDayData);

      // Close dialog
      setShowResultDialog(false);

      // Show success toast
      toast({
        title: "Tuyến đường đã được tối ưu hóa",
        description: `Đã sắp xếp ${optimizationResult.route.length - (hotelInfo ? 2 : 0)} địa điểm theo tuyến đường tối ưu.`,
      });
    }
  };

  const handleCancelOptimization = () => {
    setShowResultDialog(false);
  };

  if (!isRouteDay) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOptimizeClick}
        disabled={isOptimizing || !hasEnoughPlaces}
        title={
          !hasEnoughPlaces
            ? "Cần ít nhất 2 địa điểm có tọa độ để tối ưu hóa"
            : "Tối ưu hóa tuyến đường"
        }
      >
        {isOptimizing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4 mr-2" />
        )}
        Tối ưu tuyến đường
      </Button>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kết quả tối ưu hóa tuyến đường</DialogTitle>
          </DialogHeader>

          {optimizationResult && (
            <RouteOptimizationResult
              result={optimizationResult}
              onApply={handleApplyOptimization}
              onCancel={handleCancelOptimization}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OptimizeRouteButton;
