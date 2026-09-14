import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function getProductDetail(warehouseId, productId, myRole = null) {
  await dbConnect();
  const product = await Product.findOne({ _id: productId, warehouse: warehouseId })
    .populate("category", "name color")
    .lean();
  if (!product) return null;

  return {
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    description: product.description,
    category: product.category
      ? { id: product.category._id.toString(), name: product.category.name, color: product.category.color }
      : null,
    unit: product.unit,
    itemsPerBox: product.itemsPerBox,
    quantity: product.quantity,
    minStockLevel: product.minStockLevel,
    costPrice: product.costPrice,
    sellPrice: product.sellPrice,
    location: product.location,
    imageUrl: product.imageUrl,
    notes: product.notes,
    lowStock: product.quantity <= product.minStockLevel,
    myRole,
  };
}
