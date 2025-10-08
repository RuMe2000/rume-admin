import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getAllUserCount, getCommission, getPendingPropertyCount, getVerifiedPropertyCount, getRecentTransactionCount, getTransactionTotalAmount, getOwnerCountByStatus, listenForPendingRoomReverifyRequestsCount, listenForPendingPropertiesWithOwners, getUserRoleCounts } from "../../utils/firestoreUtils";
import NotificationBell from "../../components/NotificationBell";

const AdminDashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [pending, setPending] = useState(0);
    const [verified, setVerified] = useState(0);
    const [recent, setRecent] = useState(0);
    const [gross, setGross] = useState(0);
    const [commission, setCommission] = useState(0);
    const [verifiedOwner, setVerifiedOwner] = useState(0);
    const [unverifiedOwner, setUnverifiedOwner] = useState(0);
    const [reverify, setReverify] = useState(0);
    const [userRoles, setUserRoles] = useState({ seekers: 0, owners: 0 });


    const fetchCardData = async () => {
        const count = await getAllUserCount();
        setUserCount(count);

        const roleCount = await getUserRoleCounts();
        setUserRoles(roleCount);

        const verified = await getOwnerCountByStatus();
        setVerifiedOwner(verified.verified);

        const unverified = await getOwnerCountByStatus();
        setUnverifiedOwner(unverified.unverified);

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
    })

    useEffect(() => {
        const unsubscribe = listenForPendingRoomReverifyRequestsCount((count) => {
            setReverify(count);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = listenForPendingPropertiesWithOwners((count) => {
            setPending(count.length);
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

    const propertyData = [
        { name: "Verified", value: verified },
        { name: "Pending", value: pending },
    ];

    const ownerData = [
        { name: "Verified", value: verifiedOwner },
        { name: "Unverified", value: unverifiedOwner },
    ];

    const COLORS1 = ["#01db62", "#FA7D09"];

    const userRoleCountData = [
        { name: "Owners", value: userRoles.owners },
        { name: "Seekers", value: userRoles.seekers },
    ]

    const COLORS2 = ["#9B5DE5", "#22AED1"];

    const stats = [
        { title: "Total Users", value: userCount },
        { title: "Pending Properties", value: pending },
        { title: "Reverification Requests", value: reverify },
        { title: "Recent Transactions", value: recent },
        { title: "Commission Revenue", value: `₱${commission}` },
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

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
                                    <Cell key={`cell-${index}`} fill={COLORS1[index % COLORS1.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Owners Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={ownerData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                // paddingAngle={3}
                                dataKey="value"
                                label
                            >
                                {propertyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS1[index % COLORS1.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">User Segmentation</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={userRoleCountData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                // paddingAngle={3}
                                dataKey="value"
                                label
                            >
                                {userRoleCountData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />

                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;
