import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// room reverify requests listener
export const listenForPendingRoomReverifyRequests = (callback) => {
    const q = query(
        collection(db, "roomReverifyRequests"),
        where("status", "==", "pending")
    );

    return onSnapshot(q, async (snapshot) => {
        // Map all requests
        const requests = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();

                let propertyName = "Unknown Property";
                if (data.propertyId) {
                    try {
                        const propRef = doc(db, "properties", data.propertyId);
                        const propSnap = await getDoc(propRef);
                        if (propSnap.exists()) {
                            propertyName = propSnap.data().name || propertyName;
                        }
                    } catch (err) {
                        console.error("Error fetching property name:", err);
                    }
                }

                return { id: docSnap.id, ...data, propertyName };
            })
        );

        callback(requests);
    });
};

// Listener for pending room reverify requests count only
export const listenForPendingRoomReverifyRequestsCount = (callback) => {
    const q = query(
        collection(db, "roomReverifyRequests"),
        where("status", "==", "pending")
    );

    return onSnapshot(q, (snapshot) => {
        callback(snapshot.size); // directly return the count
    });
};