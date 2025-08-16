import PlannerForm from "@/components/forms/PlannerForm";
import CustomScrollLayoutPlanner from "@/components/scroll/CustomScrollLayoutPlanner";
import { getPlannerById } from "@/lib/actions/planner.action";
import React from "react";

const PlannerDetail = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  console.log("data  paramss", params);

  const plannerResult = await getPlannerById({
    plannerId: id,
  });
  if (!plannerResult.success) {
    return <div>Error loading planner: {plannerResult.error?.message}</div>;
  }

  const planner = plannerResult.data;
  console.log("planner Result", id, planner);
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
