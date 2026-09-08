import { createFileRoute, Link } from "@tanstack/react-router";
import Products from "../components/Products";

export const Route = createFileRoute("/products")({
  validateSearch: (search) => ({
    category:
      typeof search.category === "string" ? search.category : "All categories",
    search: typeof search.search === "string" ? search.search : "",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { search, category } = Route.useSearch();
  return <Products search={search} category={category} />;
}
