"use server";

// Simple interaction logging - can be expanded later
export async function createInteraction(params: {
  action: string;
  actionId: string;
  actionTarget: string;
  authorId: string;
}): Promise<void> {
  // For now, just log the interaction
  // This can be expanded to store in database later
  console.log("Interaction logged:", params);
}
