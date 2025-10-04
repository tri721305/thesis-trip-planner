"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPlannerById } from "@/lib/actions/planner.action";
import TripmatesDialog from "./TripmatesDialog";
import { auth } from "@/auth";

// Demo component hiển thị cách sử dụng TripmatesDialog trong PlannerForm
const PlannerTripmatesIntegrationDemo = ({ planner }: { planner: any }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tripmates, setTripmates] = useState(planner?.tripmates || []);
  const [isAuthor, setIsAuthor] = useState(false);

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const session = await auth();
        if (session?.user) {
          setCurrentUser(session.user);

          // Kiểm tra xem user hiện tại có phải là author không
          if (planner && session.user) {
            const isUserAuthor =
              planner.author === session.user.id ||
              planner.author?._id === session.user.id;

            setIsAuthor(isUserAuthor);
          }
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    getCurrentUser();
  }, [planner]);

  // Function để refresh dữ liệu planner khi tripmates thay đổi
  const refreshPlannerAfterTripmateChange = async () => {
    if (planner) {
      try {
        const plannerId = planner._id || planner.id;
        if (!plannerId) return;

        const refreshedPlanner = await getPlannerById({ plannerId });

        if (refreshedPlanner.success && refreshedPlanner.data) {
          setTripmates(refreshedPlanner.data.tripmates || []);

          toast({
            title: "Tripmates updated",
            description:
              "Your travel companions list has been updated successfully.",
          });
        }
      } catch (error) {
        console.error("Error refreshing tripmates:", error);
      }
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-medium">Tripmates</h3>
        </div>

        {planner && (
          <TripmatesDialog
            plannerId={planner._id || planner.id}
            isAuthor={isAuthor}
            currentTripmates={tripmates}
            onTripmateChange={refreshPlannerAfterTripmateChange}
          />
        )}
      </div>

      <div className="mt-2">
        {tripmates.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No tripmates yet. Add some travel companions!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tripmates.map((tripmate: any, index: number) => (
              <div
                key={tripmate.userId || `tripmate-${index}`}
                className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-sm"
              >
                {tripmate.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerTripmatesIntegrationDemo;
