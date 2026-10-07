import { parseCatalogSearch } from "@/services/navigation";
import { createFileRoute } from "@tanstack/react-router";
import { getListing } from "@/services";
import { ProductDetail } from "@/components/product-detail";
export const Route = createFileRoute("/bus_/$id")({
  validateSearch: parseCatalogSearch,
  loader: ({ params }) => getListing(params.id, "bus"),
  component: Page,
});
function Page() {
  return <ProductDetail listing={Route.useLoaderData()} search={Route.useSearch()} />;
}
