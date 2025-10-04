"use client";

import { useState } from "react";
import {
  User,
  UserPlus,
  UserX,
  AlertCircle,
  Check,
  X,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog } from "@/components/ui/dialog";

import InviteTripmate from "./InviteTripmate";
import { getUserInvitations } from "@/lib/actions/invitation.action";
import { useToast } from "@/hooks/use-toast";

interface TripmateProps {
  plannerId: string;
  tripmates: Array<{
    userId?: string;
    name: string;
    email?: string;
    image?: string;
  }>;
  isAuthor: boolean;
  onRemoveTripmate?: (userId: string) => void;
}

const ManageTripmates = ({
  plannerId,
  tripmates = [],
  isAuthor,
  onRemoveTripmate,
}: TripmateProps) => {
  const { toast } = useToast();
  const [pendingInvitations, setPendingInvitations] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending invitations for this planner
  const fetchPendingInvitations = async () => {
    if (!isAuthor) return;

    setIsLoading(true);
    try {
      // In a real app, you'd filter invitations by plannerId
      // This is just a stub for now
      const response = await getUserInvitations();
      if (response.success) {
        // Filter invitations for this planner
        const filtered = response.data.invitations.filter(
          (inv: any) => inv.plannerId === plannerId && inv.status === "pending"
        );
        setPendingInvitations(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invitation refresh on success
  const handleInvitationSuccess = () => {
    fetchPendingInvitations();
    toast({
      title: "Invitation sent",
      description: "The invitation has been sent successfully",
    });
  };

  // Initialize component
  useState(() => {
    fetchPendingInvitations();
  });

  // Function to generate avatar fallback from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Tripmates</CardTitle>
            <CardDescription>People joining this trip</CardDescription>
          </div>
          {isAuthor && (
            <InviteTripmate
              plannerId={plannerId}
              onSuccess={handleInvitationSuccess}
              buttonSize="sm"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {tripmates.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No tripmates added yet</p>
            {isAuthor && (
              <p className="text-sm mt-1">
                Invite someone using the button above
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {tripmates.map((tripmate, index) => (
              <li
                key={tripmate.userId || `tripmate-${index}`}
                className="flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={tripmate.image} />
                    <AvatarFallback>
                      {getInitials(tripmate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{tripmate.name}</p>
                    {tripmate.email && (
                      <p className="text-xs text-muted-foreground">
                        {tripmate.email}
                      </p>
                    )}
                  </div>
                </div>

                {isAuthor && tripmate.userId && onRemoveTripmate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove ${tripmate.name} from this trip?`
                        )
                      ) {
                        onRemoveTripmate(tripmate.userId!);
                      }
                    }}
                  >
                    <UserX className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {isAuthor && pendingInvitations.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending Invitations
              </h4>
              <ul className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <li
                    key={invitation._id}
                    className="flex justify-between items-center text-sm py-1 px-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{invitation.inviteeEmail}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageTripmates;
