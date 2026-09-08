import { createFileRoute, Link } from "@tanstack/react-router";

import Categories from "../components/Categories";

export const Route = createFileRoute("/categories")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Categories />;
}
