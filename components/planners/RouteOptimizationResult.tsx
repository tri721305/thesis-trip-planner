"use client";

import React from "react";
import { OptimizationResult } from "@/lib/utils/routeOptimizer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ArrowRight } from "lucide-react";

interface RouteOptimizationResultProps {
  result: OptimizationResult;
  onApply?: () => void;
  onCancel?: () => void;
}

/**
 * Component to display the results of route optimization
 */
const RouteOptimizationResult: React.FC<RouteOptimizationResultProps> = ({
  result,
  onApply,
  onCancel,
}) => {
  // Format distance for display
  const formatDistance = (meters: number): string => {
    return meters < 1000
      ? `${meters.toFixed(0)}m`
      : `${(meters / 1000).toFixed(2)}km`;
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const minutes = seconds / 60;
    return minutes < 60
      ? `${minutes.toFixed(0)} phút`
      : `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}phút`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tuyến Đường Đã Tối Ưu Hóa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Tổng khoảng cách</p>
            <p className="text-xl font-medium">
              {formatDistance(result.totalDistance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tổng thời gian</p>
            <p className="text-xl font-medium">
              {formatDuration(result.totalDuration)}
            </p>
          </div>
        </div>

        {/* Route visualization */}
        <div>
          <p className="text-sm font-medium mb-2">Thứ tự các điểm đến:</p>
          <div className="flex flex-wrap gap-2 items-center">
            {result.route.map((place, i) => (
              <div key={i} className="flex items-center">
                <Badge variant="outline" className="mr-1">
                  {i + 1}
                </Badge>
                <span className="font-medium">{place}</span>
                {i < result.route.length - 1 && (
                  <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-sm font-medium mb-2">Lịch trình chi tiết:</p>
          <div className="space-y-2">
            {result.timeline.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2 w-6 text-center">
                    {i + 1}
                  </Badge>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {item.arrivalTime} - {item.departureTime}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.visitDuration}p)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {result.timeWarnings.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">
              Cảnh báo thời gian ({result.timeWarnings.length}):
            </p>
            <div className="space-y-2">
              {result.timeWarnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-start p-2 border rounded-md border-amber-200 bg-amber-50"
                >
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{warning.placeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {warning.warning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {(onApply || onCancel) && (
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          {onApply && (
            <Button onClick={onApply}>Áp dụng tuyến đường này</Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default RouteOptimizationResult;
