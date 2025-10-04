"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUserInvitations,
  respondToInvitation,
} from "@/lib/actions/invitation.action";
import { Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

// Định nghĩa interface cho invitation
interface Invitation {
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
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const result = await getUserInvitations();
      if (result.success) {
        // Vì đã xử lý dữ liệu ở server, nên có thể dùng trực tiếp
        setInvitations(result.data.invitations || []);
        console.log("Loaded invitations:", result.data.invitations);
      } else {
        toast({
          title: "Error",
          description: "Failed to load invitations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId: string, accept: boolean) => {
    try {
      setResponding((prev) => ({ ...prev, [invitationId]: true }));

      console.log("Responding to invitation:", invitationId, accept);
      const result = await respondToInvitation({
        invitationId,
        accept,
      });

      if (result.success) {
        toast({
          title: accept ? "Invitation Accepted" : "Invitation Declined",
          description: accept
            ? "You have successfully joined the planner"
            : "You have declined the invitation",
        });

        // Làm mới danh sách lời mời
        fetchInvitations();
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "Failed to respond to invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setResponding((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Your Invitations</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : invitations.length > 0 ? (
        <div className="grid gap-6">
          {invitations.map((invitation) => (
            <Card key={invitation._id.toString()}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {invitation.plannerTitle}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Invited by {invitation.inviterName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">
                        Planner Creator
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {invitation.inviterUsername || "Unknown"}
                      </span>
                    </div>
                    <Avatar>
                      <AvatarImage src={invitation.inviterImage || ""} />
                      <AvatarFallback>
                        {invitation.inviterName
                          ? invitation.inviterName.charAt(0)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {invitation.plannerDescription && (
                    <p className="text-sm text-gray-600">
                      {invitation.plannerDescription}
                    </p>
                  )}

                  {invitation.message && (
                    <div className="bg-gray-50 p-3 rounded-md italic text-sm">
                      "{invitation.message}"
                    </div>
                  )}

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(invitation.startDate).toLocaleDateString()} -{" "}
                        {new Date(invitation.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/planners/${invitation.plannerId.toString()}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View planner details
                    </Link>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleResponse(invitation._id.toString(), false)
                        }
                        disabled={responding[invitation._id.toString()]}
                      >
                        {responding[invitation._id.toString()] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Decline"
                        )}
                      </Button>

                      <Button
                        onClick={() =>
                          handleResponse(invitation._id.toString(), true)
                        }
                        disabled={responding[invitation._id.toString()]}
                        className="bg-primary-500 hover:bg-primary-600"
                      >
                        {responding[invitation._id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Accept"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any pending invitations
          </p>
        </div>
      )}
    </div>
  );
}
