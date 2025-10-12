import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy, serverTimestamp, increment, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

//get wallet count
export async function getWalletCount() {
    try {
        const walletsRef = collection(db, "wallets");
        const snapshot = await getDocs(walletsRef);
        const count = snapshot.size; // snapshot.size gives the number of documents
        return count;
    } catch (error) {
        console.error("Error getting wallet count:", error);
        return 0;
    }
};

//get all owner wallets
export const getAllOwnerWallets = async () => {
    try {
        const walletRef = collection(db, "wallets");
        const snapshot = await getDocs(walletRef);

        // Step 1: Convert all wallet docs to plain objects
        const wallets = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));

        // Step 2: Filter out admin wallets
        const filteredWallets = wallets.filter((wallet) => wallet.role !== "admin");

        // Step 3: Fetch owner names + fix amount format
        const walletsWithNames = await Promise.all(
            filteredWallets.map(async (wallet) => {
                try {
                    const userRef = doc(db, "users", wallet.userId);
                    const userSnap = await getDoc(userRef);

                    const ownerName = userSnap.exists()
                        ? `${userSnap.data().firstName ?? ""} ${userSnap.data().lastName ?? ""}`.trim()
                        : "Unknown User";

                    return {
                        ...wallet,
                        ownerName,
                        amount: (wallet.amount ?? 0) / 100,
                    };
                } catch (err) {
                    console.error("Error fetching user for wallet:", wallet.userId, err);
                    return {
                        ...wallet,
                        ownerName: "Unknown User",
                        amount: (wallet.amount ?? 0) / 100,
                    };
                }
            })
        );

        return walletsWithNames;
    } catch (error) {
        console.error("Error fetching wallets:", error);
        return [];
    }
};

// Subtract amount from wallet balance
export const updateWalletBalance = async (walletId, amountChange) => {
    const walletRef = doc(db, "wallets", walletId);
    await updateDoc(walletRef, {
        amount: increment(amountChange), // amountChange can be negative
        updatedAt: serverTimestamp(),
    });
};

//Create a withdrawal record
export const createWithdrawal = async (walletId, amount) => {
    const withdrawalsRef = collection(db, "wallets", walletId, "withdrawals");
    await addDoc(withdrawalsRef, {
        createdAt: serverTimestamp(),
        paymentType: "withdrawal",
        amount: -amount, // store as negative
        status: "completed",
    });
};


