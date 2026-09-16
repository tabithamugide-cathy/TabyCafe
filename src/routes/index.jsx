import { createFileRoute } from "@tanstack/react-router";
import FoodMenu from "../components/FoodMenu";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <FoodMenu />;
}
