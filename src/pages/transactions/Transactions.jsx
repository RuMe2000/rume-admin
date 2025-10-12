import { getTransactions, getOwnerNameByPropertyId, getWithdrawals } from "../../utils/firestoreUtils";
import { useState, useEffect } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import TransactionCard from "./TransactionCard";
import WalletCard from "../../components/WalletCard";
import { useNavigate } from "react-router-dom";
import PlatformWalletCard from "../../components/PlatformWalletCard";
import WithdrawalCard from "./WithdrawalCard";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [filter, setFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState("desc");
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);
    const [withdrawalFilter, setWithdrawalFilter] = useState("all");
    const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("all");
    const [withdrawalSearchTerm, setWithdrawalSearchTerm] = useState("");


    const navigate = useNavigate();

    const fetchTransactions = async () => {
        try {
            const txs = await getTransactions();
            setTransactions(txs);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const wds = await getWithdrawals();
            setWithdrawals(wds);
        } catch (err) {
            console.error("Error fetching withdrawals:", err);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchWithdrawals();
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

        if (filter === "week" && createdAtDate < startOfWeek) return false;
        if (filter === "month" && createdAtDate < startOfMonth) return false;

        if (statusFilter !== "all" && t.status !== statusFilter) return false;

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

    const filteredWithdrawals = withdrawals.filter((w) => {
        if (!w.createdAt?.seconds) return false;
        const createdAtDate = new Date(w.createdAt.seconds * 1000);

        if (withdrawalFilter === "week" && createdAtDate < startOfWeek) return false;
        if (withdrawalFilter === "month" && createdAtDate < startOfMonth) return false;

        if (withdrawalStatusFilter !== "all" && w.status !== withdrawalStatusFilter) return false;

        const lowerSearch = withdrawalSearchTerm.toLowerCase();
        if (
            lowerSearch &&
            !(
                w.userName?.toLowerCase().includes(lowerSearch) ||
                w.method?.toLowerCase().includes(lowerSearch)
            )
        )
            return false;

        return true;
    });

    const sortedWithdrawals = [...filteredWithdrawals].sort((a, b) => {
        const aDate = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bDate = b.createdAt?.seconds ? b.createdAt.seconds : 0;

        return sortDirection === "desc" ? bDate - aDate : aDate - bDate;
    });

    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-4">Transactions</h1>

            <div className="flex flex-row gap-5 mb-4">
                <PlatformWalletCard onManage={() => navigate('/transactions/platformWalletDetails')} />
                <div className="h-53 border-l border-gray-600 mx-1"></div>
                <WalletCard onManage={() => navigate('/transactions/ownerWallets')} />
            </div>

            <div className="flex items-center justify-between w-full mb-2 mt-6">
                {/* Header on the left */}
                <h2 className="text-2xl font-bold">Transactions</h2>

                {/* Filters on the right */}
                <div className="flex flex-wrap justify-end gap-2">
                    <input
                        type="text"
                        placeholder="Search by User"
                        title="Search by User"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-darkBlue text-white px-2 py-1 rounded-xl border border-gray-600 focus:outline-none"
                    />

                    <select
                        value={filter}
                        title="Time Period"
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-darkBlue text-white px-3 py-2 rounded-xl font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-darkBlue" value="all">All Time</option>
                        <option className="bg-darkBlue" value="week">This Week</option>
                        <option className="bg-darkBlue" value="month">This Month</option>
                    </select>

                    <select
                        value={statusFilter}
                        title="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-darkBlue text-white px-3 py-2 rounded-xl font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-darkBlue" value="all">All</option>
                        <option className="bg-darkBlue" value="succeeded">Succeeded</option>
                        <option className="bg-darkBlue" value="pending">Pending</option>
                        <option className="bg-darkBlue" value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="flex-1 max-h-[50vh] overflow-y-auto rounded-xl border border-darkGray mb-8">
                <table className="min-w-full text-white rounded-md">
                    <thead className="sticky top-0 z-10 bg-darkBlue">
                        <tr>
                            <th
                                onClick={() => setSortDirection(prev => prev === "desc" ? "asc" : "desc")}
                                className="w-35 px-4 py-2 border-b-3 border-darkGray text-center cursor-pointer select-none"
                            >
                                Date
                                <span className="ml-1">{sortDirection === "desc" ? "▼" : "▲"}</span>
                            </th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Paid By</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Paid To</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Amount</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Payment Type</th>
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
                                    <td className="px-4 py-2">{transaction.ownerName ?? "Loading..."}</td>
                                    <td className="px-4 py-2">₱{(transaction.amount / 100).toLocaleString()}</td>
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
                                            {transaction.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 capitalize">{transaction.paymentType}</td>
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
                            <tr><td colSpan="7" className="text-center py-4">No transactions...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-b-2 border-gray-600 my-1"></div>

            {/* Withdrawals Table */}
            <div className="flex items-center justify-between w-full mb-2 mt-8">
                <h2 className="text-2xl font-bold">Withdrawals</h2>

                <div className="flex flex-wrap justify-end gap-2">
                    <input
                        type="text"
                        placeholder="Search by User or Method"
                        title="Search by User or Method"
                        value={withdrawalSearchTerm}
                        onChange={(e) => setWithdrawalSearchTerm(e.target.value)}
                        className="bg-darkBlue text-white w-55 px-2 py-1 rounded-xl border border-gray-600 focus:outline-none"
                    />

                    <select
                        value={withdrawalFilter}
                        title="Time Period"
                        onChange={(e) => setWithdrawalFilter(e.target.value)}
                        className="bg-darkBlue text-white px-3 py-2 rounded-xl font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-darkBlue" value="all">All Time</option>
                        <option className="bg-darkBlue" value="week">This Week</option>
                        <option className="bg-darkBlue" value="month">This Month</option>
                    </select>

                    <select
                        value={withdrawalStatusFilter}
                        title="Status"
                        onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                        className="bg-darkBlue text-white px-3 py-2 rounded-xl font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option className="bg-darkBlue" value="all">All</option>
                        <option className="bg-darkBlue" value="completed">Completed</option>
                        <option className="bg-darkBlue" value="pending">Pending</option>
                        <option className="bg-darkBlue" value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 max-h-[50vh] overflow-y-auto rounded-xl border border-darkGray">
                <table className="min-w-full text-white rounded-md">
                    <thead className="sticky top-0 z-10 bg-darkBlue">
                        <tr>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Owner Name</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Amount</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Method</th>
                            <th className="w-15 px-4 py-2 border-b-3 border-darkGray text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedWithdrawals.length > 0 ? (
                            sortedWithdrawals.map((wd) => (
                                <tr key={wd.withdrawalId} className="text-center border-b border-darkGray">
                                    <td className="px-4 py-2">
                                        {wd.createdAt
                                            ? new Date(wd.createdAt.seconds * 1000).toLocaleDateString()
                                            : "No date"}
                                    </td>
                                    <td className="px-4 py-2">{wd.userName || "N/A"}</td>
                                    <td className="px-4 py-2">₱{(wd.amount / 100).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex capitalize items-center justify-center w-23 h-7 rounded-full text-sm font-semibold
                                                ${wd.status === 'failed'
                                                    ? 'bg-errorRed text-white'
                                                    : wd.status === 'completed'
                                                        ? 'bg-successGreen text-white'
                                                        : wd.status === 'pending'
                                                            ? 'bg-yellow-500 text-white'
                                                            : 'bg-gray-400 text-white'
                                                }`}
                                        >
                                            {wd.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {wd.method ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <img
                                                    src={
                                                        wd.method === "GrabPay"
                                                            ? "/src/assets/grabpay_logo.png"
                                                            : wd.method === "PayMaya"
                                                                ? "/src/assets/paymaya_logo.png"
                                                                : wd.method === "GCash"
                                                                    ? "/src/assets/gcash_logo.png"
                                                                    : null
                                                    }
                                                    alt={wd.method}
                                                    className="h-6 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            "N/A"
                                        )}
                                    </td>
                                    <td className='px-4 py-2 flex items-center justify-center gap-2'>
                                        <button
                                            onClick={() => setSelectedWithdrawalId(wd.id)}
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
                            <tr><td colSpan="7" className="text-center py-4">No withdrawals...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTransactionId && (
                <TransactionCard
                    transactionId={selectedTransactionId}
                    onClose={() => {
                        setSelectedTransactionId(null);
                        fetchTransactions();
                    }}
                />
            )}

            {selectedWithdrawalId && (
                <WithdrawalCard
                    withdrawalId={selectedWithdrawalId}
                    onClose={() => {
                        setSelectedWithdrawalId(null);
                        fetchWithdrawals();
                    }}
                />
            )}
        </div>
    );
};

export default Transactions;
