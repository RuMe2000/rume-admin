import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export function listenSystemLogs(callback) {
    const logsRef = query(
        collection(db, "systemLogs"),
        orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(logsRef, (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(logs);
    });

    return unsub;
}