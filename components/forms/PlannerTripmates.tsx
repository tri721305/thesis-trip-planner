"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

import InviteTripmate from "./InviteTripmate";
import ManageTripmates from "./ManageTripmates";

interface PlannerTripmatesProps {
  plannerId: string;
  isAuthor: boolean;
  tripmates: Array<{
    userId?: string;
    name: string;
    email?: string;
    image?: string;
  }>;
  onTripmateChange?: () => void;
}

const PlannerTripmates = ({
  plannerId,
  isAuthor,
  tripmates = [],
  onTripmateChange,
}: PlannerTripmatesProps) => {
  const [isManaging, setIsManaging] = useState(false);

  // Handle removing a tripmate
  const handleRemoveTripmate = async (userId: string) => {
    // In a real implementation, this would call an API to remove the tripmate
    console.log(`Removing tripmate with ID: ${userId}`);

    // After removing, notify parent component
    if (onTripmateChange) {
      onTripmateChange();
    }
  };

  // Handle successful invitation
  const handleInvitationSuccess = () => {
    if (onTripmateChange) {
      onTripmateChange();
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-medium">Tripmates</h3>
        </div>
        <div className="flex gap-2">
          {isAuthor && !isManaging && (
            <InviteTripmate
              plannerId={plannerId}
              onSuccess={handleInvitationSuccess}
              buttonSize="sm"
            />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManaging(!isManaging)}
          >
            {isManaging ? "Hide Details" : "Manage Tripmates"}
          </Button>
        </div>
      </div>

      {!isManaging ? (
        <div className="flex flex-wrap gap-2">
          {tripmates.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No tripmates added yet.
            </p>
          ) : (
            tripmates.map((tripmate, index) => (
              <div
                key={tripmate.userId || `tripmate-${index}`}
                className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-sm"
              >
                {tripmate.name}
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <Separator className="my-4" />
          <ManageTripmates
            plannerId={plannerId}
            tripmates={tripmates}
            isAuthor={isAuthor}
            onRemoveTripmate={handleRemoveTripmate}
          />
        </>
      )}
    </div>
  );
};

export default PlannerTripmates;
