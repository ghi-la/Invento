import Warehouse from '../models/mongoDB/warehouseSchema.ts';

export const getWarehousesForUser = async (userId: string) => {
  try {
    const warehouses = await Warehouse.find({ createdBy: userId });
    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses for user:', error);
    throw error;
  }
};
