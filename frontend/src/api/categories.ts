import { api } from './client';

export type CategoryDto = {
  _id: string;
  name: string;
  description?: string;
  parentCategory?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await api.get<CategoryDto[]>('/categories');
  return res.data;
}

export async function createCategory(input: { name: string; parentCategory?: string | null; description?: string }) {
  const res = await api.post<CategoryDto>('/categories', input);
  return res.data;
}

export async function updateCategory(id: string, input: Partial<{ name: string; parentCategory: string | null; description: string }>) {
  const res = await api.put<CategoryDto>(`/categories/${id}`, input);
  return res.data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}
