import { redirect } from "next/navigation";

export default function PlannersPage() {
  // Redirect to the planner management page
  redirect("/planners/manage");
}
