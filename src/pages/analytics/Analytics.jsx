import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getBookingSuccessRatio, getAgeBracketDistribution, listenSystemLogs } from "../../utils/firestoreUtils";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";

const paymentSplitData = [
    { name: "GCash", value: 400 },
    { name: "Card", value: 300 },
    { name: "Cash", value: 300 },
];

const COLORS = ["#3B82F6", "#22C55E", "#FACC15"];

const Analytics = () => {
    const [bookingSuccess, setBookingSuccess] = useState(0);
    const [ageData, setAgeData] = useState([]);
    const [logs, setLogs] = useState([]);

    const getData = async () => {
        const bsr = await getBookingSuccessRatio();
        setBookingSuccess(bsr);

        const ageDist = await getAgeBracketDistribution();
        // transform { "18-24": 10, "25-34": 20 } -> [{ name: "18-24", value: 10}, ...]
        const formatted = Object.entries(ageDist).map(([bracket, count]) => ({
            name: bracket,
            value: count,
        }));
        setAgeData(formatted);
    };

    useEffect(() => {
        getData();

        // subscribe to systemLogs from Cloud Function
        const unsubscribe = listenSystemLogs((fetchedLogs) => {
            setLogs(fetchedLogs);
        });

        return () => unsubscribe();
    }, []);

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
                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-2">Commission Revenue</h2>
                    <p className="text-3xl font-bold">₱45,000</p>
                    <p className="text-sm text-gray-300">this month</p>
                </div>
            </div>

            {/* charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-950 rounded-2xl p-5 shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Age Bracket Distribution</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={ageData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                {ageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
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

            {/* maybe a top list */}
            <div className="bg-blue-950 rounded-2xl p-5 shadow-md mt-6">
                <h2 className="text-lg font-semibold mb-4">Top 3 Properties by Bookings</h2>
                <table className="min-w-full text-white">
                    <thead>
                        <tr className="text-left border-b border-gray-700">
                            <th className="py-2 px-3">Property</th>
                            <th className="py-2 px-3">Owner</th>
                            <th className="py-2 px-3">Bookings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-700">
                            <td className="py-2 px-3">Dormitory A</td>
                            <td className="py-2 px-3">Juan Dela Cruz</td>
                            <td className="py-2 px-3">42</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-2 px-3">Apartment B</td>
                            <td className="py-2 px-3">Maria Santos</td>
                            <td className="py-2 px-3">35</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* system logs */}
            <div className="mt-8 bg-blue-950 rounded-2xl p-4 shadow-lg">
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
            </div>
        </div>
    );
};

export default Analytics;
