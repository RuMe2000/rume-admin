import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

//get this week transaction count
export const getRecentTransactionCount = async () => {
    //get current date/time
    const now = new Date();
    //get start of the week
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    //firestore query
    const transactionsRef = collection(db, "transactions");
    const q = query(
        transactionsRef,
        where("createdAt", ">=", startOfWeek)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

//get all transactions
export const getTransactions = async () => {
    try {
        //get all transactions
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef);
        const querySnapshot = await getDocs(q);

        const transactions = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        //get all seeker ids
        const seekerIds = Array.from(new Set(transactions.map(p => p.userId).filter(Boolean)));

        //fetch seekers
        const seekerSnaps = await Promise.all(seekerIds.map(id => getDoc(doc(db, 'users', id))));
        const seekerMap = {};
        seekerSnaps.forEach((snap, idx) => {
            const id = seekerIds[idx];
            if (snap.exists()) {
                const data = snap.data();
                const first = data.firstName ?? '';
                const last = data.lastName ?? '';
                seekerMap[id] = (first || last) ? `${first} ${last}`.trim() : 'Unknown Seeker';
            } else {
                seekerMap[id] = 'Unknown Seeker';
            }
        });

        //attach seeker name to transaction
        const withSeekers = transactions.map(p => ({
            ...p,
            seekerName: seekerMap[p.userId] ?? 'Unknown Seeker'
        }));

        return withSeekers;
    } catch (error) {
        console.error('Error fetching seekers:', error);
        return [];
    }
};

//get all transaction totalAmount
export const getTransactionTotalAmount = async () => {
    let total = 0;
    const querySnapshot = await getDocs(collection(db, "transactions"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // safely sum numbers
        if (typeof data.totalAmount === "number") {
            total += data.totalAmount;
        }
    });
    return total / 100;
};

//get all transaction totalAmount
export const getCommission = async () => {
    let total = 0;
    const querySnapshot = await getDocs(collection(db, "transactions"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // safely sum numbers
        if (typeof data.commission === "number") {
            total += data.commission;
        }
    });
    return total / 100;
}

//listen for transactions per month
export const listenTransactionAmountsPerMonth = (callback) => {
    const transactionsRef = collection(db, "transactions");

    // Listen for live changes
    const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
        const monthlyTotals = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.totalAmount || !data.createdAt) return;

            let date;
            if (data.createdAt.toDate) date = data.createdAt.toDate();
            else if (data.createdAt instanceof Date) date = data.createdAt;
            else date = new Date(data.createdAt);

            // Get month-year key (e.g. "2025-10")
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }

            monthlyTotals[monthKey] += data.totalAmount;
        });

        // Format for chart (sorted by date)
        const formatted = Object.entries(monthlyTotals)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([key, value]) => {
                const [year, month] = key.split("-");
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return { month: `${monthNames[Number(month) - 1]} ${year}`, revenue: value / 100 }; // convert cents to ₱
            });

        callback(formatted);
    });

    return unsubscribe;
};

// Listen for total commission amount per month
export function listenCommissionPerMonth(callback) {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const monthlyTotals = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || data.createdAt;
            if (!createdAt || !data.commission) return;

            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
            if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
            monthlyTotals[monthKey] += Number(data.commission) || 0;
        });

        // format for chart [{ month: "Jan 2025", commission: 5000 }, ...]
        const formatted = Object.entries(monthlyTotals)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([key, total]) => {
                const [year, month] = key.split("-");
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return { month: `${monthNames[Number(month) - 1]} ${year}`, commission: total / 100 };
            });

        callback(formatted);
    });

    return unsubscribe;
}