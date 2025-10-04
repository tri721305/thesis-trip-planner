# PlannerForm Integration Guide

This guide explains how to integrate the new tripmate invitation system components with the existing PlannerForm.

## Components Overview

1. **InviteTripmate.tsx**

   - A reusable dialog component for inviting new tripmates
   - Can be used standalone or within other components

2. **ManageTripmates.tsx**

   - Displays and manages the list of tripmates
   - Shows pending invitations
   - Allows removing tripmates

3. **PlannerTripmates.tsx**

   - A container component that combines the tripmate management functionality
   - Provides a clean interface for the PlannerForm

4. **PlannerInvitationForm.tsx**
   - An integration component that can be used directly within PlannerForm

## Integration Steps

### Option 1: Using PlannerTripmates Component

Add the PlannerTripmates component to the existing PlannerForm:

```tsx
import PlannerTripmates from "@/components/forms/PlannerTripmates";

// Inside your PlannerForm component
const PlannerForm = ({ planner }: { planner?: any }) => {
  // Existing code...

  return (
    <Form {...form}>
      {/* Existing form fields */}

      {/* Add this section where you want tripmate management to appear */}
      {planner?.id && (
        <PlannerTripmates
          plannerId={planner.id}
          isAuthor={planner.author === currentUser?.id} // Add logic to determine if current user is author
          tripmates={planner.tripmates || []}
          onTripmateChange={() => {
            // Add logic to refresh planner data if needed
          }}
        />
      )}

      {/* Continue with existing form */}
    </Form>
  );
};
```

### Option 2: Using the Invitation Dialog Directly

If you only need the invitation dialog:

```tsx
import InviteTripmate from "@/components/forms/InviteTripmate";

// Inside your component
<InviteTripmate
  plannerId={planner.id}
  onSuccess={() => {
    // Add logic to refresh planner data if needed
  }}
/>;
```

### Option 3: Adding to the Sidebar

If the PlannerForm has a sidebar or actions panel:

```tsx
<div className="sidebar">
  {/* Other sidebar items */}

  {planner?.id && (
    <InviteTripmate
      plannerId={planner.id}
      buttonLabel="Invite Friends"
      buttonVariant="outline"
      onSuccess={() => {
        // Add logic to refresh planner data if needed
      }}
    />
  )}
</div>
```

## Additional Notes

1. Make sure to pass the correct `plannerId` to the components.
2. Add a proper check to determine if the current user is the planner author.
3. Implement appropriate refresh logic in the `onSuccess` and `onTripmateChange` callbacks.
4. You can customize the appearance of the components using the provided props.
