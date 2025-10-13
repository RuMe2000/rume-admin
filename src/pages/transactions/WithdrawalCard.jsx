import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { getWithdrawalById } from '../../utils/firestoreUtils';

const WithdrawalCard = ({ walletId, withdrawalId, onClose }) => {
    const [withdrawal, setWithdrawal] = useState(null);
    const [ownerName, setOwnerName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch transaction and owner name
    const fetchWithdrawal = async () => {
        setIsLoading(true);
        try {
            const wd = await getWithdrawalById(withdrawalId);
            if (wd) {
                setWithdrawal(wd);

                // Fetch owner name using ownerId
                if (wd.userId) {
                    const ownerRef = doc(db, 'users', wd.userId);
                    const ownerSnap = await getDoc(ownerRef);
                    if (ownerSnap.exists()) {
                        const ownerData = ownerSnap.data();
                        setOwnerName(
                            `${ownerData.firstName?.charAt(0).toUpperCase() + ownerData.firstName?.slice(1) || ''} ${ownerData.lastName?.charAt(0).toUpperCase() + ownerData.lastName?.slice(1) || ''}`
                        );
                    } else {
                        setOwnerName('Unknown Owner');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching withdrawal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawal();
    }, [walletId, withdrawalId]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
            return format(date, "MMM dd, yyyy — hh:mm a");
        } catch {
            return "Invalid date";
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-bgBlue text-white rounded-2xl shadow-lg w-[450px] h-[620px] relative p-6 flex flex-col border border-darkGray">

                {/* X Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white cursor-pointer hover:scale-110 transition duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                    >
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                </button>

                {/* Body */}
                <div className="flex-1 overflow-y-auto mt-3">
                    {isLoading ? (
                        <p className="text-center text-white">Loading withdrawal...</p>
                    ) : withdrawal ? (
                        <div className="flex flex-col space-y-6">

                            {/* Header */}
                            <div className="text-center mb-2">
                                <h2 className="text-2xl font-bold text-white">Withdrawal Details</h2>
                                <p className="text-gray-300 text-sm italic">{formatDate(withdrawal.createdAt)}</p>
                            </div>

                            {/* Status */}
                            <div className="flex justify-center">
                                <span
                                    className={`px-4 py-1 rounded-full text-sm font-semibold ${withdrawal.status === "completed"
                                        ? "bg-successGreen text-white"
                                        : withdrawal.status === "pending"
                                            ? "bg-yellow-500 text-white"
                                            : "bg-errorRed text-white"
                                        }`}
                                >
                                    {withdrawal.status
                                        ? withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)
                                        : "Unknown"}
                                </span>
                            </div>

                            {/* General Info */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-white">General Info</h3>
                                <div className="space-y-1 text-gray-300">
                                    <p><span className="font-semibold text-white">Withdrawal ID:</span> {withdrawal.id}</p>
                                    <p className="capitalize flex items-center gap-2">
                                        <span className="font-semibold text-white">Method:</span>
                                        {/* <span>{withdrawal.method || 'Unknown'}</span> */}
                                        {withdrawal.method && (
                                            <img
                                                src={
                                                    withdrawal.method === "GrabPay"
                                                        ? "/grabpay_logo.png"
                                                        : withdrawal.method === "PayMaya"
                                                            ? "/paymaya_logo.png"
                                                            : withdrawal.method === "GCash"
                                                                ? "/gcash_logo.png"
                                                                : null
                                                }
                                                alt={withdrawal.method}
                                                className="h-5 object-contain ml-1"
                                            />
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Owner Info */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-white">Owner Info</h3>
                                <div className="space-y-1 text-gray-300">
                                    <p><span className="font-semibold text-white">Owner:</span> {ownerName || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-white">Withdrawal Summary</h3>
                                <div className="grid grid-cols-2 gap-2 text-gray-300">
                                    <p><span className="font-semibold text-white">Amount:</span></p>
                                    <p className="text-right text-blue-400">
                                        ₱{(withdrawal.amount / 100).toLocaleString()}
                                    </p>

                                    <p><span className="font-semibold text-white">Service Fee:</span></p>
                                    <p className="text-right text-orange-400">
                                        ₱{(withdrawal.serviceFee / 100).toLocaleString()}
                                    </p>

                                    <p><span className="font-semibold text-white">PayMongo Fee:</span></p>
                                    <p className="text-right text-successGreen">
                                        ₱{(withdrawal.paymongoFee / 100).toLocaleString()}
                                    </p>
                                </div>

                                {/* Total Withdrawn (Centered) */}
                                <div className="mt-4 text-center border-t border-gray-600 pt-4">
                                    <p className="text-lg font-semibold text-white">Amount Withdrawn</p>
                                    <p className="text-3xl font-bold text-white mt-1">
                                        ₱{(withdrawal.netAmount / 100).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <p className="text-center text-white">Withdrawal not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawalCard;
