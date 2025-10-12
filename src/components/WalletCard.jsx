import { useEffect, useState } from "react";
import { getWalletCount } from "../utils/firestoreUtils";
import { Wallet } from "lucide-react";

const WalletCard = ({ onManage }) => {
    const [walletCount, setWalletCount] = useState(0);

    useEffect(() => {
        const fetchWallets = async () => {
            const count = await getWalletCount();
            setWalletCount(count);
        };
        fetchWallets();
    }, []);

    return (
        <button
            onClick={onManage}
            className="w-[45vh] h-[25vh] text-left bg-blue-900 rounded-2xl shadow-xl shadow-bgBlue px-5 py-3 flex flex-col justify-between hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-white">Owner Wallets</h2>
                <Wallet size={35} className="text-white opacity-80" />
            </div>

            <div className="flex justify-end">
                <div className="text-3xl font-semibold text-white">
                    {walletCount}
                </div>
            </div>
        </button>
    );
};

export default WalletCard;
