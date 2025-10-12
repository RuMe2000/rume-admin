import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// Get all withdrawals
export const getWithdrawals = async () => {
    try {
        // Get all withdrawal documents
        const withdrawalsRef = collection(db, "withdrawals");
        const q = query(withdrawalsRef);
        const querySnapshot = await getDocs(q);

        const withdrawals = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Get all unique user IDs (the users who withdrew)
        const userIds = Array.from(new Set(withdrawals.map(w => w.userId).filter(Boolean)));

        // Fetch user documents
        const userSnaps = await Promise.all(userIds.map(id => getDoc(doc(db, 'users', id))));
        const userMap = {};
        userSnaps.forEach((snap, idx) => {
            const id = userIds[idx];
            if (snap.exists()) {
                const data = snap.data();
                const first = data.firstName ?? '';
                const last = data.lastName ?? '';
                userMap[id] = (first || last) ? `${first} ${last}`.trim() : 'Unknown User';
            } else {
                userMap[id] = 'Unknown User';
            }
        });

        // Attach user name to each withdrawal
        const withUsers = withdrawals.map(w => ({
            ...w,
            userName: userMap[w.userId] ?? 'Unknown User',
        }));

        return withUsers;
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
};

//get transaction by id
export const getWithdrawalById = async (withdrawalId) => {
    const docRef = doc(db, 'withdrawals', withdrawalId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};
