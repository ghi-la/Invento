import { warehouseType } from '@/types/app';
import axios from 'axios';

const warehouseEndpoint =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/warehouses';

export const getWarehouses = async () => {
  try {
    const response = await axios.get(`${warehouseEndpoint}/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

export const createWarehouse = async (warehouse: warehouseType) => {
  try {
    const response = await axios.post(
      `${warehouseEndpoint}/`,
      { name: warehouse.name, code: warehouse.code },
      { withCredentials: true },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    throw error;
  }
};
