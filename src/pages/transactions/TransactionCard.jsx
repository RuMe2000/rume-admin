import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getTransactionById } from '../../utils/firestoreUtils'; // Make sure this exists
import { format } from 'date-fns'; // You can install this with `npm install date-fns`

const TransactionCard = ({ transactionId, onClose }) => {
    const [transaction, setTransaction] = useState(null);
    const [ownerName, setOwnerName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch transaction and owner name
    const fetchTransaction = async () => {
        setIsLoading(true);
        try {
            const tx = await getTransactionById(transactionId);
            if (tx) {
                setTransaction(tx);

                // Fetch owner name using ownerId
                if (tx.ownerId) {
                    const ownerRef = doc(db, 'users', tx.ownerId);
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
            console.error('Error fetching transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransaction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionId]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
            return format(date, 'MMM dd, yyyy — hh:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-bgBlue text-white rounded-2xl shadow-lg w-[450px] h-[680px] relative p-6 flex flex-col border border-darkGray">
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
                        <p className="text-center text-white">Loading transaction...</p>
                    ) : transaction ? (
                        <div className="flex flex-col space-y-6">

                            {/* Header Section */}
                            <div className="text-center mb-2">
                                <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
                                <p className="text-gray-300 text-sm italic">{formatDate(transaction.createdAt)}</p>
                            </div>

                            {/* Status Section */}
                            <div className="flex justify-center">
                                <span
                                    className={`px-4 py-1 rounded-full text-sm font-semibold ${transaction.status === 'succeeded'
                                            ? 'bg-successGreen text-white'
                                            : transaction.status === 'pending'
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-errorRed text-white'
                                        }`}
                                >
                                    {transaction.status
                                        ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                                        : 'Unknown'}
                                </span>
                            </div>

                            {/* General Info */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-white">General Info</h3>
                                <div className="space-y-1 text-gray-300">
                                    <p><span className="font-semibold text-white">Transaction ID:</span> {transaction.id || transactionId}</p>
                                    <p className='capitalize'><span className="font-semibold text-white">Payment Type:</span> {transaction.paymentType}</p>
                                    <p><span className="font-semibold text-white">Description:</span> {transaction.description || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Participants */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-white">Participants</h3>
                                <div className="space-y-1 text-gray-300">
                                    <p><span className="font-semibold text-white">Paid By:</span> {transaction.payerName || 'N/A'} (Seeker)</p>
                                    <p><span className="font-semibold text-white">Paid To:</span> {ownerName || 'N/A'} (Owner)</p>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-white">Financial Summary</h3>
                                <div className="grid grid-cols-2 gap-2 text-gray-300">
                                    <p><span className="font-semibold text-white">Amount:</span></p>
                                    <p className="text-right text-blue-400">₱{(transaction.amount / 100).toLocaleString()}</p>

                                    <p><span className="font-semibold text-white">Commission:</span></p>
                                    <p className="text-right text-orange-400">₱{(transaction.commission / 100).toLocaleString()}</p>

                                    <p><span className="font-semibold text-white">PayMongo Fee:</span></p>
                                    <p className="text-right text-successGreen">₱{(transaction.paymongoFee / 100).toLocaleString()}</p>
                                </div>

                                {/* Total Amount Centered */}
                                <div className="mt-4 text-center border-t border-gray-600 pt-4">
                                    <p className="text-lg font-semibold text-white">Total Amount</p>
                                    <p className="text-3xl font-bold text-white mt-1">
                                        ₱{(transaction.totalAmount / 100).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                    ) : (
                        <p className="text-center text-white">Transaction not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;
