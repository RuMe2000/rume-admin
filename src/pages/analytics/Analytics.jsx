import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getBookingSuccessRatio, getAgeBracketDistribution, listenSystemLogs, getTransactionTotalAmount, getCommission, getGenderCount } from "../../utils/firestoreUtils";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";

const paymentSplitData = [
    { name: "GCash", value: 400 },
    { name: "Card", value: 300 },
    { name: "Cash", value: 300 },
];

const bookingsData = [
    { month: "May", bookings: 10 },
    { month: "Jun", bookings: 20 },
    { month: "Jul", bookings: 15 },
    { month: "Aug", bookings: 30 },
    { month: "Sep", bookings: 25 },
];

const COLORS = ["#22AED1", "#EA7AF4", "#9B5DE5", "#FFB963", "#B1FFA9"];

const Analytics = () => {
    const [bookingSuccess, setBookingSuccess] = useState(0);
    const [ageData, setAgeData] = useState([]);
    const [logs, setLogs] = useState([]);
    const [gross, setGross] = useState(0);
    const [commission, setCommission] = useState(0);
    const [genderData, setGenderData] = useState([]);

    const getData = async () => {
        const bsr = await getBookingSuccessRatio();
        setBookingSuccess(bsr);

        const grossRev = await getTransactionTotalAmount();
        setGross(grossRev);

        const comm = await getCommission();
        setCommission(comm);

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

    const revenueData = [
        { month: "May", revenue: 275 },
        { month: "Jun", revenue: 500 },
        { month: "Jul", revenue: 400 },
        { month: "Aug", revenue: 1000 },
        { month: "Sep", revenue: gross / 100 },
    ];

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Analytics & Performance</h1>

            {/* quick stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-2">Booking Success Ratio</h2>
                    <p className="text-3xl font-bold">
                        {bookingSuccess ? `${bookingSuccess.ratio}%` : "..."}
                    </p>
                    <p className="text-sm text-gray-300">
                        {bookingSuccess
                            ? `${bookingSuccess.successfulCount} of ${bookingSuccess.totalSeekers} seekers booked`
                            : "Fetching data..."}
                    </p>

                </div>
                <div className="flex flex-col bg-blue-950 rounded-2xl p-5 shadow-md justify-between">
                    <h2 className="text-lg font-semibold mb-2">Total Net Revenue</h2>
                    <p className="text-3xl font-bold">₱{commission / 100}.00</p>
                </div>
                <div className="flex flex-col bg-blue-950 rounded-2xl p-5 shadow-md justify-between">
                    <h2 className="text-lg font-semibold mb-2">Total Transactions Amount</h2>
                    <p className="text-3xl font-bold">₱{gross / 100}</p>
                </div>
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
                                label
                            >
                                {ageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            {/* <Legend /> */}
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
                                innerRadius={60}   // 👈 creates the donut hole
                                outerRadius={100}
                                label
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

                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Payment Method Split</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={paymentSplitData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                {paymentSplitData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
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
            </div>



            {/* system logs */}
            <div className="mt-8 bg-blue-950 rounded-2xl p-4 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Logs</h2>

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
            </div>
        </div>
    );
};

export default Analytics;
