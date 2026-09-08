import { createFileRoute } from "@tanstack/react-router";
import Sidebar from "../Sidebar";
import Products from "../components/Products";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="">
      <Products />
    </div>
  );
}
