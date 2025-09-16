// Alternative update approach - Direct path update instead of full array replacement

export async function updatePlannerDirectPath(
  params: UpdatePlannerParams
): Promise<ActionResponse<TravelPlan>> {
  // ... existing validation code ...

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Instead of replacing entire details array, update specific paths
      const updateOperations: any = {};
      
      if (updateData.details) {
        updateData.details.forEach((detail: any, detailIndex: number) => {
          if (detail.data) {
            detail.data.forEach((item: any, itemIndex: number) => {
              if (item.type === "place" && item.cost) {
                // Update specific cost fields directly
                const basePath = `details.${detailIndex}.data.${itemIndex}`;
                updateOperations[`${basePath}.cost.value`] = item.cost.value;
                updateOperations[`${basePath}.cost.type`] = item.cost.type;
                updateOperations[`${basePath}.cost.paidBy`] = item.cost.paidBy;
                updateOperations[`${basePath}.cost.description`] = item.cost.description;
                updateOperations[`${basePath}.cost.splitBetween`] = item.cost.splitBetween;
                
                // Update other place fields
                updateOperations[`${basePath}.name`] = item.name;
                updateOperations[`${basePath}.timeStart`] = item.timeStart;
                updateOperations[`${basePath}.timeEnd`] = item.timeEnd;
              }
            });
          }
        });
      }
      
      console.log("🎯 Direct path update operations:", updateOperations);
      
      const updateResult = await TravelPlan.updateOne(
        { _id: plannerId },
        { $set: updateOperations },
        { session }
      );
      
      // ... rest of the update logic ...
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
