import { createFileRoute } from "@tanstack/react-router";
import FoodMenu from "../components/FoodMenu";

export const Route = createFileRoute("/foodmenu")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <FoodMenu />
    </div>
  );
}
