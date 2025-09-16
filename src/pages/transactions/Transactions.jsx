import { getTransactions } from "../../utils/firestoreUtils";
import { useState, useEffect } from "react";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            const data = await getTransactions();
            setTransactions(data);
        };

        fetchTransactions();
    }, []);

    return (
        <div>
            <div className="flex flex-row items-center text-white mb-6">
                <h1 className="text-3xl font-semibold">Transactions</h1>
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