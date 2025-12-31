import axios from "axios";
import { useEffect } from "react";

const Dashboard = () => {
    useEffect(() => {
        document.title = "Dashboard - Invento";
        axios
          .get('http://localhost:8888/protected', { withCredentials: true })
          .then((response) => {
            console.log('Dashboard data:', response.data);
          })
          .catch((error) => {
            console.error('Error fetching dashboard data:', error);
          });
    }, []);
    return <div>Dashboard</div>;
};

export default Dashboard;