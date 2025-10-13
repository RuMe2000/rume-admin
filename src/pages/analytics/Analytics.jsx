import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import {
    getUserRoleCounts, getTopBookedAmenities, getTop5PropertiesByBookings, getBookingSuccessRatio, getAgeBracketDistribution,
    listenSystemLogs, getTransactionTotalAmount, getCommission, getGenderCount, listenTransactionAmountsPerMonth, getNewUsersCount,
    listenBookingsPerMonth, listenCommissionPerMonth, getPredictedTopAmenities, getBookingStatusCounts, getUserCountPerMonth
} from "../../utils/firestoreUtils";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";

const paymentSplitData = [
    { name: "GCash", value: 400 },
    { name: "Card", value: 300 },
    { name: "Cash", value: 300 },
];

const COLORS = ["#22AED1", "#EA7AF4", "#9B5DE5", "#FFB963", "#B1FFA9"];

const Analytics = () => {
    const [bookingSuccess, setBookingSuccess] = useState(0);
    const [ageData, setAgeData] = useState([]);
    const [logs, setLogs] = useState([]);
    const [gross, setGross] = useState(0);
    const [commission, setCommission] = useState(0);
    const [genderData, setGenderData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [bookingsData, setBookingsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [commissionData, setCommissionData] = useState([]);
    const [stackedData, setStackedData] = useState([]);
    const [topProperties, setTopProperties] = useState([]);
    const [topAmenities, setTopAmenities] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [userRoles, setUserRoles] = useState({ seekers: 0, owners: 0 });
    const [funnelData, setFunnelData] = useState([]);
    const [newUsers, setNewUsers] = useState(null);

    const getData = async () => {
        const bsr = await getBookingSuccessRatio();
        setBookingSuccess(bsr);

        const grossRev = await getTransactionTotalAmount();
        setGross(grossRev);

        const roleCount = await getUserRoleCounts();
        setUserRoles(roleCount);

        const user = await getUserCountPerMonth();
        setUsersData(user);

        const count = await getNewUsersCount();
        setNewUsers(count);

        const comm = await getCommission();
        setCommission(comm);

        const amens = await getPredictedTopAmenities();
        setTopAmenities(amens);

        const bookingCounts = await getBookingStatusCounts();

        // Prepare data for chart
        setFunnelData([
            { stage: "Pending", count: bookingCounts.pendingCount },
            { stage: "Awaiting Payment", count: bookingCounts.awaitingPaymentCount },
            { stage: "Booked", count: bookingCounts.bookedCount },
        ]);

        const ageDist = await getAgeBracketDistribution();
        // transform { "18-24": 10, "25-34": 20 } -> [{ name: "18-24", value: 10}, ...]
        const formatted = Object.entries(ageDist).map(([bracket, count]) => ({
            name: bracket,
            value: count,
        }));
        setAgeData(formatted);

        const genderCount = await getGenderCount();
        const formattedGender = [
            { name: "Male", value: genderCount.male },
            { name: "Female", value: genderCount.female },
        ];
        setGenderData(formattedGender);
    };

    useEffect(() => {
        getData();

        // subscribe to systemLogs from Cloud Function
        const unsubscribe = listenSystemLogs((fetchedLogs) => {
            setLogs(fetchedLogs);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Listen in real time
        const unsubscribe = listenTransactionAmountsPerMonth((data) => {
            setRevenueData(data);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribeBookings = listenBookingsPerMonth((data) => {
            setBookingsData(data);
        });

        return () => unsubscribeBookings();
    }, []);

    useEffect(() => {
        const fetchTopProps = async () => {
            const data = await getTop5PropertiesByBookings();
            setTopProperties(data);
        };
        fetchTopProps();
    }, []);

    useEffect(() => {
        const unsubscribe = listenCommissionPerMonth((data) => setCommissionData(data));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let unsubscribeRevenue = null;
        let unsubscribeCommission = null;

        unsubscribeRevenue = listenTransactionAmountsPerMonth((revenueData) => {
            unsubscribeCommission = listenCommissionPerMonth((commissionData) => {
                // Merge both datasets by month
                const merged = revenueData.map((rev) => {
                    const matchingComm = commissionData.find((c) => c.month === rev.month);
                    return {
                        month: rev.month,
                        grossRevenue: rev.revenue || 0,
                        commission: matchingComm ? matchingComm.commission || 0 : 0,
                    };
                });
                setStackedData(merged);
            });
        });

        return () => {
            if (unsubscribeRevenue) unsubscribeRevenue();
            if (unsubscribeCommission) unsubscribeCommission();
        };
    }, []);

    const userRoleCountData = [
        { name: "Owners", value: userRoles.owners },
        { name: "Seekers", value: userRoles.seekers },
    ]

    // const COLORS2 = ["#9B5DE5", "#22AED1"];

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Analytics & Performance</h1>

            {/* quick stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col bg-blue-950 rounded-2xl p-5 shadow-md justify-between">
                    <h2 className="text-lg font-semibold mb-2">New Users This Month</h2>
                    <p className="text-3xl font-bold text-white">
                        {newUsers !== null ? newUsers : "..."} users
                    </p>
                    <p className="text-sm text-gray-300">
                        {newUsers !== null
                            ? "joined this month"
                            : "Fetching data..."}
                    </p>
                </div>

                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-2">Booking Success Ratio</h2>
                    <p className="text-3xl font-bold text-white">
                        {bookingSuccess ? `${bookingSuccess.ratio}%` : "..."}
                    </p>
                    <p className="text-sm text-gray-300">
                        {bookingSuccess
                            ? `${bookingSuccess.successfulCount} of ${bookingSuccess.totalSeekers} seekers booked`
                            : "Fetching data..."}
                    </p>

                </div>
                <div className="flex flex-col bg-blue-950 rounded-2xl p-5 shadow-md justify-between">
                    <h2 className="text-lg font-semibold mb-2">Total Platform Revenue</h2>
                    <p className="text-3xl font-bold text-yellow-400">₱{commission.toLocaleString()}</p>
                </div>
                <div className="flex flex-col bg-blue-950 rounded-2xl p-5 shadow-md justify-between">
                    <h2 className="text-lg font-semibold mb-2">Total Transactions Amount</h2>
                    <p className="text-3xl font-bold text-yellow-400">₱{gross.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-blue-950 rounded-2xl p-5 shadow-md my-6">
                <h2 className="text-lg font-semibold mb-4">Top 5 Properties by Bookings</h2>

                {topProperties.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-white">
                            <thead>
                                <tr className="border-b border-gray-700 text-left">
                                    <th className="py-2 px-3 text-white font-medium w-16">Rank</th>
                                    <th className="py-2 px-3 text-white font-medium">Property Name</th>
                                    <th className="py-2 px-3 text-white font-medium">Owner</th>
                                    <th className="py-2 px-3 text-white font-medium text-right">Bookings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProperties.map((prop, index) => (
                                    <tr
                                        key={prop.propertyId}
                                        className={`border-b border-darkGray hover:bg-hoverBlue transition`}
                                    >
                                        <td className="py-2 px-3 text-lg font-semibold">{index + 1}</td>
                                        <td className="py-2 px-3 font-semibold text-lg">{prop.propertyName}</td>
                                        <td className="py-2 px-3 text-gray-300">{prop.ownerName}</td>
                                        <td className="py-2 px-9 text-xl text-right font-bold text-white">
                                            {prop.bookingsCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-white">No bookings data available</p>
                )}
            </div>

            {/* top booked amenities */}
            <div className="bg-blue-950 rounded-2xl p-4 shadow-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">
                    Top Amenities Likely to Be Booked
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={topAmenities}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid stroke="#364153" strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: "white", fontSize: 13 }} />
                        <YAxis tick={{ fill: "white", fontSize: 12 }} />
                        <Tooltip
                            cursor={false}
                            contentStyle={{
                                backgroundColor: "#001740",
                                border: "none",
                                borderRadius: "8px",
                                color: "#ffffff",
                                fontSize: "13px",
                            }}
                            itemStyle={{ color: "#ffffff" }}
                            labelStyle={{ color: "#ffffff" }}
                            formatter={(value, name) => {
                                if (name === "likelihood") {
                                    return [(value * 100).toFixed(1) + "%", "Likelihood"];
                                }
                                return [value, "Bookings"];
                            }}
                        />
                        <Bar
                            dataKey="likelihood"
                            radius={[5, 5, 0, 0]}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {topAmenities.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === activeIndex ? "#383cc44d" : "#3539cb"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-blue-950 rounded-2xl p-4 shadow-lg my-6">
                <h2 className="text-xl font-semibold mb-4">Booking Conversion Funnel</h2>
                <p className="text-gray-400 text-sm mb-3">
                    {/* Visualizes how many bookings progress from Pending → Awaiting Payment → Booked. */}
                </p>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        layout="vertical"
                        data={funnelData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#696868" />
                        <XAxis type="number" stroke="#cbd5e1" />
                        <YAxis
                            dataKey="stage"
                            type="category"
                            stroke="#cbd5e1"
                            tick={{ fill: "white", fontSize: 13 }}
                        />
                        <Tooltip
                            cursor={false}
                            contentStyle={{
                                backgroundColor: "#001740",
                                border: "none",
                                borderRadius: "8px",
                                color: "#ffffff",
                            }}
                            formatter={(value) => [value, "Bookings"]}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={40}>
                            {funnelData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>


            {/* charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Age Bracket Distribution</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={ageData}
                                cx="50%"
                                cy="50%"
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={100}
                                // paddingAngle={3}
                                label={false}
                            >
                                {ageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Gender Distribution (Seekers)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={genderData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={100}
                                label={false}
                            >
                                {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                label={false}
                            >
                                {userRoleCountData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />

                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue chart */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Transactions Amount per Month</h2>
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

                <div className="bg-blue-950 p-4 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-3 text-white">Platform Revenue per Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={commissionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#696868" />
                            <XAxis dataKey="month" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="commission"
                                stroke="#10b981"
                                strokeWidth={3}
                                name="Commission"
                            />
                        </LineChart>
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

                {/* Users chart */}
                <div className="bg-blue-950 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">User Count per Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={usersData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#696868" />
                            <XAxis dataKey="month" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="users"
                                stroke="#10b981" // teal/green color for contrast
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-blue-950 rounded-2xl p-4 shadow-lg mt-6">
                <h2 className="text-xl font-semibold mb-4">Gross vs Platform Revenue</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={stackedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#696868" />
                        <XAxis dataKey="month" stroke="#cbd5e1" />
                        <YAxis stroke="#cbd5e1" />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="grossRevenue"
                            stackId="1"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            name="Gross Revenue"
                            fillOpacity={0.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="commission"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            name="Commission Revenue"
                            fillOpacity={0.7}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* system logs */}
            <div className="mt-8 bg-blue-950 rounded-2xl p-4 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">System Logs</h2>

                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {logs.length === 0 ? (
                        <p className="text-white">No system logs yet.</p>
                    ) : (
                        logs.map((log, index) => {
                            const ts = log.timestamp;
                            const date =
                                ts instanceof Timestamp ? ts.toDate() : ts instanceof Date ? ts : new Date();
                            const formatted = date.toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            });

                            // Determine badge color based on category
                            const categoryColors = {
                                user: "bg-blue-600",
                                property: "bg-green-600",
                                room: "bg-purple-600",
                                transaction: "bg-orange-600",
                                default: "bg-gray-600",
                            };

                            const badgeColor = categoryColors[log.category] || categoryColors.default;

                            return (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between border-darkGray rounded-xl px-4 py-3 border transition-all duration-200"
                                >
                                    <div className="flex items-start sm:items-center gap-3 text-white">
                                        {/* category badge */}
                                        <span
                                            className={`px-2 py-1 text-xs rounded-md uppercase font-semibold ${badgeColor}`}
                                        >
                                            {log.category || "general"}
                                        </span>

                                        {/* message */}
                                        <p className="text-sm sm:text-base">{log.message}</p>
                                    </div>

                                    {/* timestamp */}
                                    <span className="text-xs text-gray-400 mt-2 sm:mt-0 sm:text-right">
                                        {formatted}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
