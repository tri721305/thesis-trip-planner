import PlannerForm from "@/components/forms/PlannerForm";
import React from "react";

const PlannerDetail = () => {
  return (
    <div className="flex">
      <section className="flex-1">
        <PlannerForm />
      </section>
      <section className="flex-1">Map</section>
    </div>
  );
};

export default PlannerDetail;
