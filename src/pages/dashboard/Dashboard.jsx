import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getRoomVerificationStatusCounts, getAllUserCount, getCommission, getPendingPropertyCount, getPendingAndReverifyRoomsCount, getVerifiedPropertyCount, getRecentTransactionCount, getTransactionTotalAmount, getOwnerCountByStatus, listenForPendingRoomReverifyRequestsCount, listenForPendingPropertiesWithOwners, getUserRoleCounts } from "../../utils/firestoreUtils";
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
    const [roomStatusData, setRoomStatusData] = useState({
        verified: 0,
        pending: 0,
        reverify: 0,
    });

    const fetchCardData = async () => {
        const count = await getAllUserCount();
        setUserCount(count);

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

        const rev = await getPendingAndReverifyRoomsCount();
        setReverify(rev.total);

        const pend = await getPendingPropertyCount();
        setPending(pend);

        const roomStatus = await getRoomVerificationStatusCounts();
        setRoomStatusData(roomStatus);
    };

    useEffect(() => {
        fetchCardData();
    }, []);

    const propertyData = [
        { name: "Verified", value: verified },
        { name: "Pending", value: pending },
    ];

    const ownerData = [
        { name: "Verified", value: verifiedOwner },
        { name: "Unverified", value: unverifiedOwner },
    ];

    const COLORS1 = ["#01db62", "#FA7D09"];

    const stats = [
        { title: "Total Users", value: userCount },
        { title: "Pending Properties", value: pending },
        { title: "Pending Rooms", value: reverify },
        { title: "Recent Transactions", value: recent },
        { title: "Commission Revenue", value: `₱${commission}` },
        // { title: "Flagged Reports", value: 2 },
    ];

    const roomVerificationChartData = [
        { name: "Verified", value: roomStatusData.verified },
        { name: "Pending", value: roomStatusData.pending },
        { name: "Reverify", value: roomStatusData.reverify },
    ];

    const COLORS3 = ["#01db62", "#FA7D09", "#FFBF00"];

    return (
        <div className="p-6 text-white">
            <div className="fixed top-8 right-10 z-50">
                <NotificationBell />
            </div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
                                label={false}
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
                                label={false}
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

                {/* ✅ Room Verification Status */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Rooms Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={roomVerificationChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                                label={false}
                            >
                                {roomVerificationChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS3[index % COLORS3.length]} />
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
