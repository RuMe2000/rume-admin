import { getTransactions } from "../../utils/firestoreUtils";
import { useState, useEffect } from "react";
import MyDatePicker from "../../components/MyDatePicker";
import Datepicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortDirection, setSortDirection] = useState("desc");

    useEffect(() => {
        const fetchTransactions = async () => {
            const data = await getTransactions();
            setTransactions(data);
        };
        fetchTransactions();
    }, []);

    //helper to compute start of week/month
    const getStartDates = () => {
        const now = new Date();
        //start of week
        const startOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        //start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

        return { startOfWeek, startOfMonth };
    };

    const { startOfWeek, startOfMonth } = getStartDates();

    const filteredTransactions = transactions.filter((t) => {
        if (!t.createdAt?.seconds) return false;
        const createdAtDate = new Date(t.createdAt.seconds * 1000);

        // time filter
        if (filter === "week" && createdAtDate < startOfWeek) return false;
        if (filter === "month" && createdAtDate < startOfMonth) return false;

        // status filter
        if (statusFilter !== "all" && t.status !== statusFilter) return false;

        // custom date range
        if (startDate && createdAtDate < new Date(startDate)) return false;
        if (endDate && createdAtDate > new Date(endDate)) return false;

        // search filter (payer or payee)
        const lowerSearch = searchTerm.toLowerCase();
        if (
            lowerSearch &&
            !(
                t.seekerName?.toLowerCase().includes(lowerSearch) ||
                t.userId?.toLowerCase().includes(lowerSearch)
            )
        )
            return false;

        return true;
    });

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        const aDate = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bDate = b.createdAt?.seconds ? b.createdAt.seconds : 0;

        return sortDirection === "desc" ? bDate - aDate : aDate - bDate;
    });



    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center text-white mb-6 justify-between gap-4">
                <h1 className="text-3xl font-semibold">Transactions</h1>

                {/* filters */}
                <div className="flex flex-wrap gap-2">

                    {/* search */}
                    <input
                        type="text"
                        placeholder="Search by User"
                        title="Search by User"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-hoverBlue text-white px-2 py-1 rounded-full border border-gray-600 focus:outline-none"
                    />

                    {/* time range */}
                    <select
                        value={filter}
                        title="Time Period"
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-hoverBlue text-white px-3 py-2 rounded-full font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-blue-950" value="all">
                            All Time
                        </option>
                        <option className="bg-blue-950" value="week">
                            This Week
                        </option>
                        <option className="bg-blue-950" value="month">
                            This Month
                        </option>
                    </select>

                    {/* status */}
                    <select
                        value={statusFilter}
                        title="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-hoverBlue text-white px-3 py-2 rounded-full font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-blue-950" value="all">
                            All
                        </option>
                        <option className="bg-blue-950" value="succeeded">
                            Succeeded
                        </option>
                        <option className="bg-blue-950" value="pending">
                            Pending
                        </option>
                        <option className="bg-blue-950" value="failed">
                            Failed
                        </option>
                    </select>

                    {/* <Datepicker selected={} onChange={} /> */}

                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th
                                onClick={() =>
                                    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
                                }
                                className="px-4 py-2 border-b-3 border-darkGray text-center cursor-pointer select-none"
                            >
                                Date
                                <span className="ml-1">
                                    {sortDirection === "desc" ? "  ▼" : "  ▲"}
                                </span>
                            </th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Payer</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Payee</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Amount</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="text-center border-b border-darkGray">
                                    <td className="px-4 py-2">
                                        {transaction.createdAt
                                            ? new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()
                                            : "N/A"}
                                    </td>
                                    <td className="px-4 py-2">{transaction.seekerName}</td>
                                    <td className="px-4 py-2">{transaction.userId}</td>
                                    <td className="px-4 py-2">{transaction.amount}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold
                                                    ${transaction.status === 'failed'
                                                    ? 'bg-errorRed text-white'
                                                    : transaction.status === 'succeeded'
                                                        ? 'bg-successGreen text-white'
                                                        : transaction.status === 'pending'
                                                            ? 'bg-yellow-500 text-white'
                                                            : 'bg-gray-400 text-white'
                                                }`}
                                        >
                                            {transaction.status
                                                ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                                                : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{transaction.id}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No transactions match the filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;
