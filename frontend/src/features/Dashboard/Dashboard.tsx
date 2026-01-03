import { useAppSelector } from '@/hooks/hooks';

const Dashboard = () => {
  const selectedWarehouse = useAppSelector(
    (state) => state.app.selectedWarehouse,
  );

  return (
    <div>
      <h1>Dashboard</h1>
      {selectedWarehouse && <p>Selected Warehouse: {selectedWarehouse.name}</p>}
    </div>
  );
};

export default Dashboard;
