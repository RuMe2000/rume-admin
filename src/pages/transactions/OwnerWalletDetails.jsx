import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeft } from "lucide-react";

const OwnerWalletDetails = () => {
    const { walletId } = useParams();
    const navigate = useNavigate();

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch wallet details
    const fetchWalletDetails = async () => {
        try {
            const walletRef = doc(db, "wallets", walletId);
            const walletSnap = await getDoc(walletRef);

            if (walletSnap.exists()) {
                const walletData = walletSnap.data();

                // Get owner details from userId
                const userRef = doc(db, "users", walletData.userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : {};

                setWallet({
                    id: walletSnap.id,
                    ...walletData,
                    ownerName: `${userData.firstName || ""} ${userData.lastName || ""}`,
                    amount: walletData.amount / 100, // convert centavos to pesos
                });
            }
        } catch (error) {
            console.error("Error fetching wallet:", error);
        }
    };

    // Fetch all transactions for this wallet
    const fetchWalletTransactions = async () => {
        try {
            const transRef = collection(db, "wallets", walletId, "transactions");
            const snapshot = await getDocs(transRef);

            const transData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort by date (most recent first)
            const sorted = transData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            setTransactions(sorted);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletDetails();
        fetchWalletTransactions();
    }, [walletId]);

    if (loading) {
        return <div className="flex justify-center items-center mt-20 text-white">Loading wallet details...</div>;
    }

    return (
        <div className="p-6 text-white">
            <div className='flex flex-row gap-3 mb-4'>
                <button onClick={() => navigate(-1)}
                    className='cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className='text-3xl font-bold'>Wallet Details</h1>
            </div>

            {wallet ? (
                <>
                    {/* Wallet Overview */}
                    <div className="bg-blue-950 rounded-2xl p-6 shadow-lg mb-6">
                        <h2 className="text-3xl font-bold mb-2">{wallet.ownerName || "Unnamed Owner"}</h2>
                        <p className="text-gray-300 mb-1">Wallet ID: {wallet.id}</p>
                        <p className="text-3xl text-yellow-400 font-bold mt-4">₱{wallet.amount.toLocaleString()}</p>
                        <p className="text-gray-400 mt-2 text-sm">
                            Last Updated:{" "}
                            {wallet.updatedAt?.toDate
                                ? wallet.updatedAt.toDate().toLocaleString()
                                : "N/A"}
                        </p>
                    </div>

                    {/* Transactions List */}
                    <div className="bg-blue-950 rounded-2xl p-5 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Transactions</h3>

                        {transactions.length > 0 ? (
                            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-darkGray">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-darkBlue">
                                        <tr>
                                            <th className="px-4 py-2 text-center">Date</th>
                                            <th className="px-4 py-2 text-center">Payer</th>
                                            <th className="px-4 py-2 text-center">Amount</th>
                                            <th className="px-4 py-2 text-center">Commission</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                            <th className="px-4 py-2 text-center">Payment Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                className="border-b border-gray-700"
                                            >
                                                <td className="text-center px-4 py-2">
                                                    {tx.createdAt
                                                        ? new Date(tx.createdAt.seconds * 1000).toLocaleString()
                                                        : "No date"}
                                                </td>
                                                <td className="text-center px-4 py-2">{tx.payerName}</td>
                                                <td className="text-center px-4 py-2">₱{(tx.amount / 100).toLocaleString()}</td>
                                                <td className="text-center px-4 py-2">₱{(tx.commission / 100).toLocaleString()}</td>
                                                <td className="text-center px-4 py-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full font-semibold capitalize ${
                                                            tx.status === "succeeded"
                                                                ? "bg-successGreen text-white"
                                                                : tx.status === "pending"
                                                                ? "bg-yellow-500 text-white"
                                                                : "bg-errorRed text-white"
                                                        }`}
                                                    >
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="text-center px-4 py-2 capitalize">{tx.paymentType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-white text-center">No transactions found.</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-white">Wallet not found.</p>
            )}
        </div>
    );
};

export default OwnerWalletDetails;
