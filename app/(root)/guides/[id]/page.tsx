import CustomScrollLayoutGuide from "@/components/scroll/CustomScrollLayoutGuide";
import { getGuideById } from "@/lib/actions/guide.action";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  console.log("Id params", id);

  const guideResult = await getGuideById({ guideId: id });

  console.log("guideResult", guideResult);
  if (!guideResult.success) {
    return <div>Error loading planner: {guideResult.error?.message}</div>;
  }

  return (
    <div>
      <CustomScrollLayoutGuide planner={guideResult.data} />
    </div>
  );
};

export default page;
