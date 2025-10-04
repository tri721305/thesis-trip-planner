"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PlannerInvitationForm from "./PlannerInvitationForm";

interface TripmatesDialogProps {
  plannerId: string;
  isAuthor: boolean;
  currentTripmates?: Array<{
    userId?: string;
    name: string;
    email?: string;
    image?: string;
  }>;
  onTripmateChange?: () => void;
  triggerClassName?: string;
}

const TripmatesDialog = ({
  plannerId,
  isAuthor,
  currentTripmates = [],
  onTripmateChange,
  triggerClassName,
}: TripmatesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    if (onTripmateChange) {
      onTripmateChange();
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={triggerClassName}
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Tripmates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <PlannerInvitationForm
          plannerId={plannerId}
          isAuthor={isAuthor}
          currentTripmates={currentTripmates}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TripmatesDialog;
