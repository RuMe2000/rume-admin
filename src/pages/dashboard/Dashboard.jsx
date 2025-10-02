import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getAllUserCount, getCommission, getPendingPropertyCount, getVerifiedPropertyCount, getRecentTransactionCount, getTransactionTotalAmount, listenSystemLogs, getOwnerCountByStatus } from "../../utils/firestoreUtils";
import NotificationBell from "../../components/NotificationBell";

const AdminDashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [pending, setPending] = useState(0);
    const [verified, setVerified] = useState(0);
    const [recent, setRecent] = useState(0);
    const [gross, setGross] = useState(0);
    const [commission, setCommission] = useState(0);
    

    const fetchCardData = async () => {
        const count = await getAllUserCount();
        setUserCount(count);

        const pend = await getPendingPropertyCount();
        setPending(pend);

        const ver = await getVerifiedPropertyCount();
        setVerified(ver);

        const trans = await getRecentTransactionCount();
        setRecent(trans);

        const grossRev = await getTransactionTotalAmount();
        setGross(grossRev);

        const comm = await getCommission();
        setCommission(comm);
    };

    useEffect(() => {
        fetchCardData();
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

    // donut data
    const propertyData = [
        { name: "Verified", value: verified },
        { name: "Pending", value: pending },
    ];

    const COLORS = ["#00a63e", "#facc15"]; // green = verified, yellow = pending

    const stats = [
        { title: "Total Users", value: userCount },
        { title: "Pending Properties", value: pending },
        { title: "Recent Transactions", value: recent },
        { title: "Commission Revenue", value: `₱${commission / 100}` },
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s, idx) => (
                    <div
                        key={idx}
                        className="bg-blue-950 rounded-2xl p-4 shadow-lg hover:shadow-xl transition duration-300 hover:scale-105"
                    >
                        <h2 className="text-xl font-semibold">{s.title}</h2>
                        <p className="text-2xl font-bold mt-4">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Verified vs Pending Properties (Donut) */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Properties Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={propertyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                // paddingAngle={3}
                                dataKey="value"
                                label
                            >
                                {propertyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>


                {/* Bookings chart */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Bookings per Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={bookingsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#696868" />
                            <XAxis dataKey="month" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue chart */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Gross Payment per Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#696868" />
                            <XAxis dataKey="month" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
