"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { inviteTripmate } from "@/lib/actions/planner.action";
import { getUserInvitations } from "@/lib/actions/invitation.action";
import PlannerTripmates from "./PlannerTripmates";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// For testing purposes, define a schema
const invitationSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

interface PlannerInvitationFormProps {
  plannerId: string;
  isAuthor: boolean;
  currentTripmates?: Array<{
    userId?: string;
    name: string;
    email?: string;
    image?: string;
  }>;
  onSuccess?: () => void;
}

const PlannerInvitationForm = ({
  plannerId,
  isAuthor = false,
  currentTripmates = [],
  onSuccess,
}: PlannerInvitationFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tripmates, setTripmates] = useState(currentTripmates);

  const form = useForm<z.infer<typeof invitationSchema>>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  // Function to handle tripmate change (added or removed)
  const handleTripmateChange = () => {
    // In a real app, you'd fetch the updated tripmate list here
    // For now, we'll just notify the parent component
    if (onSuccess) {
      onSuccess();
    }
  };

  // Function to handle form submission
  const onSubmit = async (data: z.infer<typeof invitationSchema>) => {
    if (!isAuthor) {
      toast({
        title: "Permission denied",
        description: "Only the planner author can send invitations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await inviteTripmate({
        plannerId,
        email: data.email,
        name: data.name,
      });

      if (response.success) {
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${data.email}`,
        });

        form.reset();

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Manage Tripmates</DialogTitle>
        <DialogDescription>
          Invite and manage people joining your travel plan.
        </DialogDescription>
      </DialogHeader>

      <PlannerTripmates
        plannerId={plannerId}
        isAuthor={isAuthor}
        tripmates={tripmates}
        onTripmateChange={handleTripmateChange}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Done
        </Button>
      </DialogFooter>
    </div>
  );
};

export default PlannerInvitationForm;
