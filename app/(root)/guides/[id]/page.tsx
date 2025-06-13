import { RouteParams } from "@/types/global";
import React from "react";

const GuideDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  return <>GuideDetails {id}</>;
};

export default GuideDetails;
