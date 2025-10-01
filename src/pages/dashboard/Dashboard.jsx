import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllUserCount, getCommission, getPendingPropertyCount, getRecentTransactionCount, getTransactionTotalAmount, listenSystemLogs } from "../../utils/firestoreUtils";
import { Timestamp } from "firebase/firestore";
import NotificationBell from "../../components/NotificationBell";
import WalletCard from "../../components/WalletCard";

const AdminDashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [pending, setPending] = useState(0);
    const [recent, setRecent] = useState(0);
    const [gross, setGross] = useState(0);
    const [commission, setCommission] = useState(0);
    const [logs, setLogs] = useState([]);

    const fetchCardData = async () => {
        const count = await getAllUserCount();
        setUserCount(count);

        const pend = await getPendingPropertyCount();
        setPending(pend);

        const trans = await getRecentTransactionCount();
        setRecent(trans);

        const grossRev = await getTransactionTotalAmount();
        setGross(grossRev);

        const comm = await getCommission();
        setCommission(comm);
    };

    useEffect(() => {
        fetchCardData();

        // subscribe to systemLogs from Cloud Function
        const unsubscribe = listenSystemLogs((fetchedLogs) => {
            setLogs(fetchedLogs);
        });

        return () => unsubscribe();
    }, []);

    // dummy data for charts
    const bookingsData = [
        { month: "May", bookings: 10 },
        { month: "Jun", bookings: 20 },
        { month: "Jul", bookings: 15 },
        { month: "Aug", bookings: 30 },
        { month: "Sep", bookings: 25 },
    ];

    const revenueData = [
        { month: "May", revenue: 275 },
        { month: "Jun", revenue: 500 },
        { month: "Jul", revenue: 400 },
        { month: "Aug", revenue: 1000 },
        { month: "Sep", revenue: gross / 100 },
    ];

    const stats = [
        { title: "Total Users", value: userCount },
        { title: "Pending Properties", value: pending },
        { title: "Recent Transactions", value: recent },
        { title: "Net Revenue Balance", value: `₱${commission / 100}` },
        // { title: "New Signups This Week", value: 37 },
        // { title: "Flagged Reports", value: 2 },
    ];

    return (
        <div className="p-6 text-white">
            <div className="fixed top-8 right-10 z-50">
                <NotificationBell />
            </div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                {stats.map((s, idx) => (
                    <div
                        key={idx}
                        className="bg-mainBlue rounded-2xl p-4 shadow-lg hover:shadow-xl transition duration-300 hover:scale-105"
                    >
                        <h2 className="text-lg font-semibold">{s.title}</h2>
                        <p className="text-2xl font-bold mt-2">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bookings chart */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Bookings per Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={bookingsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue chart */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Gross Revenue per Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* system logs */}
            {/* <div className="mt-8 bg-blue-950 rounded-2xl p-4 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">System Logs</h2>

                <div className="max-h-50 overflow-y-auto w-full">
                    <ul className="list-disc pl-5">
                        {logs.map((log, index) => {
                            const ts = log.timestamp;
                            const date =
                                ts instanceof Timestamp ? ts.toDate() : ts instanceof Date ? ts : new Date();
                            const formatted = date.toLocaleString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            });

                            return (
                                <li key={index} className="mb-1">
                                    {formatted} – {log.message}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div> */}

        </div>
    );
};

export default AdminDashboard;
