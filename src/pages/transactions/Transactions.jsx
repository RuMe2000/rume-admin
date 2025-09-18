import { getTransactions } from "../../utils/firestoreUtils";
import { useState, useEffect } from "react";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");

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

        if (filter === "week") {
            return createdAtDate >= startOfWeek;
        }
        if (filter === "month") {
            return createdAtDate >= startOfMonth;
        }
        return true;
    });

    return (
        <div>
            <div className="flex flex-row items-center text-white mb-6 justify-between">
                <h1 className="text-3xl font-semibold">Transactions</h1>

                {/* filter dropdown */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-hoverBlue text-white px-3 py-2 rounded-md font-semibold border border-gray-600 focus:outline-none cursor-pointer"
                >
                    <option className='bg-blue-950' value="all">All</option>
                    <option className='bg-blue-950' value="week">This Week</option>
                    <option className='bg-blue-950' value="month">This Month</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Paid By</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Paid To</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Amount</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="text-center border-b border-darkGray">
                                <td className="px-4 py-2">{transaction.id}</td>
                                <td className="px-4 py-2">{transaction.seekerName}</td>
                                <td className="px-4 py-2">{transaction.userId}</td>
                                <td className="px-4 py-2">{transaction.amount}</td>
                                <td className='px-4 py-2'>{transaction.createdAt ? new Date(transaction.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-4 py-2">{transaction.status}</td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;