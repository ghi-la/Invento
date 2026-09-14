import { listCategories } from "@/lib/data/categories";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage({ params }) {
  const initialCategories = await listCategories(params.warehouseId);
  return <CategoriesClient initialCategories={initialCategories} />;
}
