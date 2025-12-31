import { api } from './client';

export type ProductDto = {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category?: string | null;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit?: string;
  location?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getProducts(): Promise<ProductDto[]> {
  const res = await api.get<ProductDto[]>('/products');
  return res.data;
}

export async function getProductById(id: string): Promise<ProductDto> {
  const res = await api.get<ProductDto>(`/products/${id}`);
  return res.data;
}

export async function createProduct(input: Partial<ProductDto>) {
  const res = await api.post<ProductDto>('/products', input);
  return res.data;
}

export async function updateProduct(id: string, input: Partial<ProductDto>) {
  const res = await api.put<ProductDto>(`/products/${id}`, input);
  return res.data;
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`);
}
