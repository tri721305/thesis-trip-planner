"use client";

import { useState, useEffect } from "react";
import {
  getUserInvitations,
  respondToInvitation,
} from "@/lib/actions/invitation.action";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Check, X, Calendar, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Invitation = {
  _id: string;
  plannerId: string;
  plannerTitle: string;
  plannerDescription?: string;
  startDate: string;
  endDate: string;
  inviterId: string;
  inviterName: string;
  inviterUsername?: string;
  inviterImage?: string;
  message?: string;
  createdAt: string;
};

const InvitationList = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // Fetch invitations on component mount
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await getUserInvitations();
        if (response.success && response.data) {
          setInvitations(response.data.invitations);
        } else {
          toast({
            title: "Error",
            description:
              response.error?.message || "Failed to load invitations",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [toast]);

  // Handle invitation response
  const handleResponse = async (invitationId: string, accept: boolean) => {
    setRespondingTo(invitationId);
    try {
      const response = await respondToInvitation({ invitationId, accept });
      if (response.success) {
        // Remove the invitation from the list
        setInvitations((prev) =>
          prev.filter((inv) => inv._id !== invitationId)
        );
        toast({
          title: accept ? "Invitation accepted" : "Invitation declined",
          description: accept
            ? "You have been added to the travel plan"
            : "The invitation has been declined",
          variant: accept ? "default" : "secondary",
        });
      } else {
        toast({
          title: "Error",
          description:
            response.error?.message || "Failed to respond to invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setRespondingTo(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Invitations</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="py-4">
        <h2 className="text-xl font-semibold mb-2">Your Invitations</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You have no pending invitations
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">Your Invitations</h2>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <Card key={invitation._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={invitation.inviterImage || ""}
                    alt={invitation.inviterName}
                  />
                  <AvatarFallback>
                    {invitation.inviterName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">
                    {invitation.inviterName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    invited you
                  </span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {formatDistanceToNow(new Date(invitation.createdAt), {
                    addSuffix: true,
                  })}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">
                {invitation.plannerTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 space-y-2">
              {invitation.plannerDescription && (
                <CardDescription>
                  {invitation.plannerDescription}
                </CardDescription>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {formatDate(invitation.startDate)} -{" "}
                    {formatDate(invitation.endDate)}
                  </span>
                </div>
              </div>
              {invitation.message && (
                <div className="mt-2 text-sm italic border-l-2 border-muted pl-2">
                  "{invitation.message}"
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResponse(invitation._id, false)}
                disabled={respondingTo === invitation._id}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleResponse(invitation._id, true)}
                disabled={respondingTo === invitation._id}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvitationList;
