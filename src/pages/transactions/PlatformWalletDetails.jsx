import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { updateWalletBalance, createWithdrawal } from "../../utils/firestoreUtils";
import useAlerts from "../../hooks/useAlerts";
import AlertContainer from "../../components/AlertContainer";

const PlatformWalletDetails = () => {
    const navigate = useNavigate();

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");

    const { alerts, showAlert, removeAlert } = useAlerts();

    const fetchAdminWalletAndTransactions = async () => {
        try {
            // Step 1: Query for the admin wallet
            const walletsRef = collection(db, "wallets");
            const q = query(walletsRef, where("role", "==", "admin"));
            const walletSnap = await getDocs(q);

            if (walletSnap.empty) {
                console.warn("No admin wallet found.");
                setWallet(null);
                setTransactions([]);
                setWithdrawals([]); // clear withdrawals too
                return;
            }

            // Only one admin wallet
            const walletDoc = walletSnap.docs[0];
            const walletData = { id: walletDoc.id, ...walletDoc.data() };
            setWallet(walletData);

            // Step 2: Fetch all transactions in this wallet
            const transactionsRef = collection(db, "wallets", walletDoc.id, "transactions");
            const withdrawalsRef = collection(db, "wallets", walletDoc.id, "withdrawals");

            const [transactionsSnap, withdrawalsSnap] = await Promise.all([
                getDocs(transactionsRef),
                getDocs(withdrawalsRef),
            ]);

            // Step 3: Enrich transactions with related user names (if any)
            const transData = await Promise.all(
                transactionsSnap.docs.map(async (docSnap) => {
                    const tx = { id: docSnap.id, ...docSnap.data() };

                    if (tx.relatedUserId) {
                        try {
                            const userRef = doc(db, "users", tx.relatedUserId);
                            const userSnap = await getDoc(userRef);

                            if (userSnap.exists()) {
                                const userData = userSnap.data();
                                tx.relatedUserName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
                            } else {
                                tx.relatedUserName = "Unknown User";
                            }
                        } catch (userError) {
                            console.error("Error fetching related user:", userError);
                            tx.relatedUserName = "Error Fetching User";
                        }
                    }

                    return tx;
                })
            );

            // Step 4: Sort both transactions and withdrawals by date
            const sortedTransactions = transData.sort(
                (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );

            const withdrawalData = withdrawalsSnap.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));

            const sortedWithdrawals = withdrawalData.sort(
                (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );

            // Step 5: Save to state
            setTransactions(sortedTransactions);
            setWithdrawals(sortedWithdrawals);
        } catch (error) {
            console.error("Error fetching admin wallet, transactions, and withdrawals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
            showAlert("warning", "Please enter a valid amount.");
            return;
        }

        if (withdrawAmount * 100 > wallet.amount) {
            showAlert("warning", "Insufficient wallet balance.");
            return;
        }

        try {
            const amountInCents = Math.round(withdrawAmount * 100);
            await updateWalletBalance(wallet.id, -amountInCents);
            await createWithdrawal(wallet.id, amountInCents);

            showAlert("success", "Withdrawal successful!");
            setShowModal(false);
            setWithdrawAmount("");
            fetchAdminWalletAndTransactions(); // refresh wallet info
        } catch (error) {
            console.error("Withdrawal failed:", error);
            showAlert("error", "Withdrawal failed. Check console for details.");
        }
    };

    useEffect(() => {
        fetchAdminWalletAndTransactions();
    }, []);

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
                <h1 className='text-3xl font-bold'>RuMe Wallet Details</h1>
            </div>

            {wallet ? (
                <>
                    {/* Wallet Overview */}
                    <div className="relative bg-blue-950 rounded-2xl p-6 shadow-lg mb-6">
                        <h2 className="text-3xl font-bold mb-2">RuMe</h2>
                        {/* <p className="text-gray-300 mb-1">Wallet ID: {wallet.id}</p> */}
                        <p className="text-3xl text-yellow-400 font-bold mt-4">₱{(wallet.amount / 100).toLocaleString() || "0"}</p>
                        <p className="text-gray-400 mt-2 text-sm">
                            Last Updated:{" "}
                            {wallet.updatedAt?.toDate
                                ? wallet.updatedAt.toDate().toLocaleString()
                                : "N/A"}
                        </p>

                        {/* Withdraw Button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="absolute bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600/70 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200"
                        >
                            WITHDRAW
                        </button>
                    </div>

                    {/* WITHDRAW MODAL */}
                    <AnimatePresence>
                        {showModal && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    className="bg-bgBlue text-white w-[25vw] px-6 py-8 rounded-2xl shadow-lg flex flex-col gap-4"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-center">Withdraw Funds</h2>

                                    <p className="text-gray-300 text-center">
                                        Wallet Balance:{" "}
                                        <span className="text-yellow-400 font-semibold">
                                            ₱{(wallet.amount / 100).toLocaleString()}
                                        </span>
                                    </p>

                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="px-4 py-3 rounded-lg text-white bg-darkBlue focus:outline-none focus:ring-1 focus:ring-white transition"
                                    />

                                    <div className="flex flex-row justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-errorRed px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleWithdraw}
                                            className="bg-mainBlue text-white px-4 py-2 rounded-lg hover:bg-hoverBlue font-semibold transition duration-200"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Earnings List */}
                    <div className="bg-blue-950 rounded-2xl p-5 shadow-lg mb-6">
                        <h3 className="text-xl font-semibold mb-4">Earnings</h3>

                        {transactions.length > 0 ? (
                            <div className="max-h-[30vh] overflow-y-auto rounded-lg border border-darkGray">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-darkBlue">
                                        <tr>
                                            <th className="w-50 px-4 py-2 text-center">Date</th>
                                            <th className="px-4 py-2 text-center">From</th>
                                            <th className="px-4 py-2 text-center">Amount</th>
                                            <th className="px-4 py-2 text-center">Payment Type</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-gray-700">
                                                <td className="px-4 py-2 text-center">
                                                    {tx.createdAt
                                                        ? new Date(tx.createdAt.seconds * 1000).toLocaleString()
                                                        : "No date"}
                                                </td>
                                                <td className="text-center px-4 py-2">{tx.originalPayerName || tx.relatedUserName}</td>
                                                <td className="text-center px-4 py-2">₱{(tx.amount / 100).toLocaleString()}</td>
                                                <td className="text-center px-4 py-2 capitalize">{tx.paymentType}</td>
                                                <td className="text-center px-4 py-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full font-semibold capitalize ${tx.status === "succeeded" || tx.status === "completed"
                                                            ? "bg-successGreen text-white"
                                                            : tx.status === "pending"
                                                                ? "bg-yellow-500 text-white"
                                                                : "bg-errorRed text-white"
                                                            }`}
                                                    >
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-white text-center">No transactions found.</p>
                        )}
                    </div>

                    {/* Withdrawals List */}
                    <div className="bg-blue-950 rounded-2xl p-5 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Withdrawals</h3>

                        {withdrawals.length > 0 ? (
                            <div className="max-h-[30vh] overflow-y-auto rounded-lg border border-darkGray">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-darkBlue">
                                        <tr>
                                            <th className="w-80 px-4 py-2 text-center">Date</th>
                                            <th className="px-4 py-2 text-center">Withdrawal Amount</th>
                                            <th className="px-4 py-2 text-center">Type</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w) => (
                                            <tr key={w.id} className="border-b border-gray-700">
                                                <td className="px-4 py-2 text-center">
                                                    {w.createdAt
                                                        ? new Date(w.createdAt.seconds * 1000).toLocaleString()
                                                        : "No date"}
                                                </td>
                                                <td className="text-center px-4 py-2">
                                                    ₱{(Math.abs(w.amount) / 100).toLocaleString()}
                                                </td>
                                                <td className="text-center px-4 py-2 capitalize">{w.paymentType}</td>
                                                <td className="text-center px-4 py-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full font-semibold capitalize ${w.status === "succeeded" || w.status === "completed"
                                                            ? "bg-successGreen text-white"
                                                            : w.status === "pending"
                                                                ? "bg-yellow-500 text-white"
                                                                : "bg-errorRed text-white"
                                                            }`}
                                                    >
                                                        {w.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-white text-center">No withdrawals found.</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-white">Admin wallet not found.</p>
            )}

            <AlertContainer alerts={alerts} removeAlert={removeAlert} />

        </div>
    );
};

export default PlatformWalletDetails;
