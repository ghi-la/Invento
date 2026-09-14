import { getProductDetail } from "@/lib/data/product";
import { listMovements } from "@/lib/data/movements";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }) {
  const [initialProduct, initialMovements] = await Promise.all([
    getProductDetail(params.warehouseId, params.productId),
    listMovements(params.warehouseId, { productId: params.productId, limit: 10 }),
  ]);

  return <ProductDetailClient initialProduct={initialProduct} initialMovements={initialMovements} />;
}
