import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

//get booked room by user
export const getBookedRoomByUser = async (userId) => {
    if (!userId) return null;

    try {
        //get all properties
        const propertiesSnap = await getDocs(collection(db, "properties"));

        //loop each property and check its rooms subcollection
        for (const propertyDoc of propertiesSnap.docs) {
            const propertyId = propertyDoc.id;

            //build a query for the rooms subcollection of this property
            const roomsRef = collection(db, "properties", propertyId, "rooms");
            const q = query(roomsRef, where("seekerId", "==", userId));
            const roomsSnap = await getDocs(q);

            if (!roomsSnap.empty) {
                const roomDoc = roomsSnap.docs[0];
                return {
                    propertyId,
                    roomId: roomDoc.id,
                    ...roomDoc.data(),
                };
            }
        }

        // no booked room found
        return null;
    } catch (error) {
        console.error("Error fetching booked room:", error);
        return null;
    }
};