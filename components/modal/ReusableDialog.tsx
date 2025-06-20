import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReusableDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: {
    title?: string;
    description?: string;
    content: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    actions?: {
      primary?: {
        label: string;
        onClick: () => void;
        variant?:
          | "default"
          | "destructive"
          | "outline"
          | "secondary"
          | "ghost"
          | "link";
        disabled?: boolean;
        loading?: boolean;
      };
      secondary?: {
        label: string;
        onClick: () => void;
        variant?:
          | "default"
          | "destructive"
          | "outline"
          | "secondary"
          | "ghost"
          | "link";
        disabled?: boolean;
      };
      cancel?: {
        label: string;
        onClick?: () => void;
      };
    };
  };
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

const ReusableDialog: React.FC<ReusableDialogProps> = ({
  open,
  setOpen,
  data,
}) => {
  const {
    title,
    description,
    content,
    size = "md",
    showCloseButton = false,
    className,
    headerClassName,
    contentClassName,
    actions,
  } = data;

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    if (actions?.cancel?.onClick) {
      actions.cancel.onClick();
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "rounded-lg",
          sizeClasses[size],
          size === "full" && "h-[95vh]",
          className
        )}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <DialogHeader className={cn("relative", headerClassName)}>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-6 w-6"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}

            {title && (
              <DialogTitle className="text-lg text-center font-semibold">
                {title}
              </DialogTitle>
            )}

            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex-1",
            size === "full" && "overflow-y-auto",
            contentClassName
          )}
        >
          {content}
        </div>

        {/* Actions */}
        {actions &&
          (actions.primary || actions.secondary || actions.cancel) && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              {actions.cancel && (
                <Button variant="outline" onClick={handleCancel}>
                  {actions.cancel.label}
                </Button>
              )}

              {actions.secondary && (
                <Button
                  variant={actions.secondary.variant || "outline"}
                  onClick={actions.secondary.onClick}
                  disabled={actions.secondary.disabled}
                >
                  {actions.secondary.label}
                </Button>
              )}

              {actions.primary && (
                <Button
                  variant={actions.primary.variant || "default"}
                  onClick={actions.primary.onClick}
                  disabled={actions.primary.disabled || actions.primary.loading}
                >
                  {actions.primary.loading
                    ? "Loading..."
                    : actions.primary.label}
                </Button>
              )}
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default ReusableDialog;
