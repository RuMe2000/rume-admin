import { Wallet } from "lucide-react";

const PlatformWalletCard = ({ onManage }) => {

    return (
        <button
            onClick={onManage}
            className="w-[45vh] h-[25vh] text-left bg-mainBlue rounded-2xl shadow-xl shadow-bgBlue px-5 py-3 flex flex-col justify-between hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-white">RuMe Wallet</h2>
                <Wallet size={35} className="text-white opacity-80" />
            </div>

        </button>
    );
};

export default PlatformWalletCard;
