import { Wallet } from "lucide-react"; // optional icon library

const WalletCard = ({ balance, currency = "₱" }) => {
    return (
        <div className="bg-gradient-to-br from-mainBlue to-blue-900 text-white rounded-2xl p-6 shadow-lg w-full z-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Net Revenue</h2>
                <Wallet size={28} className="opacity-80" />
            </div>
            <p className="text-3xl font-bold tracking-wide">
                {currency} {balance.toLocaleString()}
            </p>
            <div className="mt-4 flex justify-between text-sm text-gray-200">
                <span>Last Updated: {new Date().toLocaleDateString()}</span>
                <button className="bg-white text-indigo-700 font-semibold px-3 py-1 rounded-full hover:bg-gray-100 transition">
                    View Details
                </button>
            </div>
        </div>
    );
};

export default WalletCard;
