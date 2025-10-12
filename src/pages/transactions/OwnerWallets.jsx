import { useEffect, useState } from "react";
import { getAllOwnerWallets } from "../../utils/firestoreUtils";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import OwnerWalletDetails from "./OwnerWalletDetails";

const OwnerWallets = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchWallets = async () => {
            const data = await getAllOwnerWallets();
            setWallets(data);
            setLoading(false);
        };
        fetchWallets();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-20 text-white">
                Loading wallets...
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <div className='flex flex-row gap-3 mb-4'>
                <button onClick={() => navigate('/transactions')}
                    className='cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className='text-3xl font-bold'>Owner Wallets</h1>
            </div>
            

            {wallets.length === 0 ? (
                <p className="text-white">No owner wallets found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map((wallet) => (
                        <motion.div
                            key={wallet.id}
                            className="bg-blue-950 rounded-2xl p-6 shadow-lg hover:bg-blue-950/50 transition duration-300"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-semibold truncate capitalize">
                                    {wallet.ownerName || "Unnamed Owner"}
                                </h2>
                                <Wallet size={28} className="opacity-60 text-white" />
                            </div>

                            <p className="text-2xl font-bold mb-1 text-yellow-400">
                                ₱{wallet.amount?.toLocaleString() || "0.00"}
                            </p>
                            <p className="text-sm text-gray-400 mb-4">
                                Last Updated:{" "}
                                {wallet.updatedAt
                                    ? new Date(wallet.updatedAt.seconds * 1000).toLocaleDateString()
                                    : "—"}
                            </p>

                            <button 
                            onClick={() => navigate(`/transactions/ownerWallets/${wallet.id}`)}
                            className="bg-mainBlue hover:bg-hoverBlue hover:scale-105 cursor-pointer px-4 py-2 rounded-xl font-semibold transition duration-300">
                                View Transactions
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnerWallets;
