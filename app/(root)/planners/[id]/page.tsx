import CustomScrollLayoutPlanner from "@/components/scroll/CustomScrollLayoutPlanner";
import { getPlannerById } from "@/lib/actions/planner.action";
import React from "react";

const PlannerDetail = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const plannerResult = await getPlannerById({
    plannerId: id,
  });
  if (!plannerResult.success) {
    return <div>Error loading planner: {plannerResult.error?.message}</div>;
  }

  const planner = plannerResult.data;
  return (
    // <div className="flex">
    //   <section className="flex-1">
    //     <PlannerForm planner={planner} />
    //   </section>
    //   <section className="flex-1">Map</section>
    // </div>
    <CustomScrollLayoutPlanner planner={planner} />
  );
};

export default PlannerDetail;
