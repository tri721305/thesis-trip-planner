"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { inviteTripmate } from "@/lib/actions/planner.action";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Mail } from "lucide-react";

// Schema for invitation form validation
const invitationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
  message: z.string().optional(),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

interface InviteTripmateProps {
  plannerId: string;
  onSuccess?: () => void;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "sm" | "default" | "lg" | "icon";
  buttonClassName?: string;
  iconOnly?: boolean;
}

const InviteTripmate = ({
  plannerId,
  onSuccess,
  buttonLabel = "Invite Tripmate",
  buttonVariant = "default",
  buttonSize = "default",
  buttonClassName = "",
  iconOnly = false,
}: InviteTripmateProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      name: "",
      message: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: InvitationFormValues) => {
    setIsLoading(true);
    try {
      const response = await inviteTripmate({
        plannerId,
        email: values.email,
        name: values.name || undefined,
      });

      if (response.success) {
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${values.email}`,
        });
        form.reset();
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Failed to send invitation",
          description: response.error?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Failed to send invitation",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={buttonClassName}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {!iconOnly && buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a Tripmate</DialogTitle>
          <DialogDescription>
            Send an invitation to someone to join your travel plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="email@example.com"
                        className="border-0 focus-visible:ring-0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter their name"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTripmate;
