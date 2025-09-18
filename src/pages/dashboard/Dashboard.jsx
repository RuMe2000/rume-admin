import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import { getAllUserCount, getAllPropertyCount, getPendingPropertyCount, getRecentTransactionCount } from "../../utils/firestoreUtils";


const Dashboard = () => {
    const navigate = useNavigate();
    
    const [userCount, setUserCount] = useState(0);
    const [propertyCount, setPropertyCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [transactionCount, setTransactionCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            const users = await getAllUserCount();
            const properties = await getAllPropertyCount();
            const pending = await getPendingPropertyCount();
            const transactions = await getRecentTransactionCount();

            setUserCount(users);
            setPropertyCount(properties);
            setPendingCount(pending);
            setTransactionCount(transactions);
        };

        fetchCounts();
    }, []);

    return (
        <div>
            <h1 className="text-start text-3xl font-semibold mb-4">Dashboard</h1>
            
            <div className="flex flex-row">
                <DashboardCard title="Users" count={userCount} onManage={() => navigate('/users')} />
                <DashboardCard title="Properties" count={propertyCount} onManage={() => navigate('/properties')} />
                <DashboardCard title="Pending Approvals" count={pendingCount} onManage={() => navigate('/properties/pending')} />
                <DashboardCard title="Recent Transactions" count={transactionCount} onManage={() => navigate('/transactions')} />
            </div>
        </div>
    );
};

export default Dashboard;