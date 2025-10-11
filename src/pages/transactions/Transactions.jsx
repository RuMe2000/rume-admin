import { getTransactions, getOwnerNameByPropertyId } from "../../utils/firestoreUtils";
import { useState, useEffect } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import TransactionCard from "./TransactionCard";
import WalletCard from "../../components/WalletCard";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState("desc");
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    const navigate = useNavigate();

    const fetchTransactions = async () => {
        try {
            const txs = await getTransactions();
            setTransactions(txs);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    useEffect(() => {
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

        //time filter
        if (filter === "week" && createdAtDate < startOfWeek) return false;
        if (filter === "month" && createdAtDate < startOfMonth) return false;

        //status filter
        if (statusFilter !== "all" && t.status !== statusFilter) return false;

        //search filter
        const lowerSearch = searchTerm.toLowerCase();
        if (
            lowerSearch &&
            !(
                t.payerName?.toLowerCase().includes(lowerSearch) ||
                t.userId?.toLowerCase().includes(lowerSearch) ||
                t.ownerName?.toLowerCase().includes(lowerSearch)
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
        <div className="p-6">
            
                <h1 className="text-3xl font-bold mb-4">Transactions</h1>

                {/* owner wallets */}
                <div className="mb-4">
                    <WalletCard onManage={() => navigate('/transactions/ownerWallets')}/>
                </div>

                {/* filters */}
                <div className="flex flex-wrap justify-end gap-2 w-full mb-2">

                    {/* search */}
                    <input
                        type="text"
                        placeholder="Search by User"
                        title="Search by User"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-darkBlue text-white px-2 py-1 rounded-xl border border-gray-600 focus:outline-none"
                    />

                    {/* time range */}
                    <select
                        value={filter}
                        title="Time Period"
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-darkBlue text-white px-3 py-2 rounded-xl font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-darkBlue" value="all">
                            All Time
                        </option>
                        <option className="bg-darkBlue" value="week">
                            This Week
                        </option>
                        <option className="bg-darkBlue" value="month">
                            This Month
                        </option>
                    </select>

                    {/* status */}
                    <select
                        value={statusFilter}
                        title="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-darkBlue text-white px-3 py-2 rounded-xl font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-darkBlue" value="all">
                            All
                        </option>
                        <option className="bg-darkBlue" value="succeeded">
                            Succeeded
                        </option>
                        <option className="bg-darkBlue" value="pending">
                            Pending
                        </option>
                        <option className="bg-darkBlue" value="failed">
                            Failed
                        </option>
                    </select>

                </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-darkGray">
                <table className="min-w-full text-white rounded-md">
                    <thead className="sticky top-0 z-10 bg-darkBlue">
                        <tr>
                            <th
                                onClick={() =>
                                    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
                                }
                                className="w-35 px-4 py-2 border-b-3 border-darkGray text-center cursor-pointer select-none"
                            >
                                Date
                                <span className="ml-1">
                                    {sortDirection === "desc" ? "  ▼" : "  ▲"}
                                </span>
                            </th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Paid By</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Paid To</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Amount</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="w-70 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="w-15 px-4 py-2 border-b-3 border-darkGray text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="text-center border-b border-darkGray">
                                    <td className="px-4 py-2">
                                        {transaction.createdAt
                                            ? new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()
                                            : "No date"}
                                    </td>
                                    <td className="px-4 py-2">{transaction.payerName}</td>
                                    <td className="px-4 py-2">
                                        {transaction.ownerName ?? "Loading..."}
                                    </td>
                                    <td className="px-4 py-2">{transaction.amount / 100}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex capitalize items-center justify-center w-23 h-7 rounded-full text-sm font-semibold
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
                                                ? transaction.status
                                                : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 relative group cursor-pointer">
                                        <span className='group-hover:hidden'>
                                            {transaction.id.substring(0, 12)}...
                                        </span>
                                        <span className='hidden group-hover:inline-block transition-all duration-200'>
                                            {transaction.id}
                                        </span>
                                    </td>
                                    <td className='px-4 py-2 flex items-center justify-center gap-2'>
                                        <button
                                            onClick={() => setSelectedTransactionId(transaction.id)}
                                            className='bg-transparent px-3 py-1 rounded-2xl hover:scale-120 hover:cursor-pointer duration-300 transition'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                                                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No transactions...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTransactionId && (
                <TransactionCard
                    transactionId={selectedTransactionId}
                    // role="owner"
                    onClose={() => {
                        setSelectedTransactionId(null);
                        fetchTransactions();
                    }}
                />
            )}
        </div>
    );
};

export default Transactions;
