import { getGuideById } from "@/lib/actions/guide.action";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const guide = await getGuideById({ guideId: id });
  console.log("Guide ID:", id, guide);
  return (
    <div className="flex">
      <div className="flex-1"></div>
      <div className="flex-1">asdasdzxc asdasd </div>
    </div>
  );
};

export default page;
