import { collection, query, where, getDocs, collectionGroup, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// Fixed getSeekerStayDuration - Added missing bookingDate variable
export const getSeekerStayDuration = async (userId) => {
    if (!userId) return null;

    try {
        const bookingsRef = collection(db, "bookings");
        const bookingQuery = query(bookingsRef, where("seekerId", "==", userId), where("status", "==", "booked"));
        const bookingsSnap = await getDocs(bookingQuery);

        if (bookingsSnap.empty) return null;

        const bookingDoc = bookingsSnap.docs[0];
        const bookingData = bookingDoc.data();
        const roomId = bookingData.roomId;

        // FIX: Get bookingDate from the booking data
        const bookingDate = bookingData.bookingDate?.toDate() || new Date();

        // Resolve property that contains the room
        const propertiesSnap = await getDocs(collection(db, "properties"));
        let propertyId = null;
        for (const propertyDoc of propertiesSnap.docs) {
            const roomsRef = collection(db, "properties", propertyDoc.id, "rooms");
            const roomSnap = await getDoc(doc(roomsRef, roomId));
            if (roomSnap.exists()) {
                propertyId = propertyDoc.id;
                break;
            }
        }

        // Compute stay duration (date-only)
        const start = new Date(
            bookingDate.getFullYear(),
            bookingDate.getMonth(),
            bookingDate.getDate()
        );

        const today = new Date();
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const diffTime = Math.abs(end - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        return {
            bookingId: bookingDoc.id,
            propertyId,
            roomId,
            bookingDate,
            duration: { days: diffDays, months: diffMonths, years: diffYears }
        };
    } catch (error) {
        console.error("Error fetching seeker stay duration:", error);
        return null;
    }
};

// Fixed getBookedRoomByUser - Ensure consistent naming
export const getBookedRoomByUser = async (userId) => {
    if (!userId) return null;

    try {
        const bookingsRef = collection(db, "bookings");
        const bookingQuery = query(bookingsRef, where("seekerId", "==", userId), where("status", "==", "booked"));
        const bookingSnap = await getDocs(bookingQuery);

        if (bookingSnap.empty) return null;

        const bookingDoc = bookingSnap.docs[0];
        const bookingData = bookingDoc.data();
        const roomId = bookingData.roomId;

        const propertiesSnap = await getDocs(collection(db, "properties"));
        for (const propertyDoc of propertiesSnap.docs) {
            const propertyId = propertyDoc.id;
            const propertyData = propertyDoc.data();

            const roomsRef = collection(db, "properties", propertyId, "rooms");
            const roomSnap = await getDoc(doc(roomsRef, roomId));

            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                return {
                    bookingId: bookingDoc.id,
                    propertyId,
                    propertyName: propertyData.name || "Unnamed Property",
                    roomId,
                    name: roomData.name || "Unnamed Room", // FIX: Use 'name' consistently
                    ...roomData,
                };
            }
        }

        return null;
    } catch (error) {
        console.error("Error fetching booked room:", error);
        return null;
    }
};

//get pending and reverify room count
export const getPendingAndReverifyRoomsCount = async () => {
    try {
        const roomsRef = collectionGroup(db, 'rooms');

        const pendingQuery = query(roomsRef, where('verificationStatus', '==', 'pending'));
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingCount = pendingSnapshot.size;

        const reverifyQuery = query(roomsRef, where('verificationStatus', '==', 'reverify'));
        const reverifySnapshot = await getDocs(reverifyQuery);
        const reverifyCount = reverifySnapshot.size;

        return {
            pending: pendingCount,
            reverify: reverifyCount,
            total: pendingCount + reverifyCount,
        };
    } catch (error) {
        console.error('Error fetching room counts:', error);
        throw error;
    }
};

//get properties with pending or reverify rooms
export async function getPropertiesWithPendingOrReverifyRooms() {
    const propertiesRef = collection(db, "properties");
    const propertySnapshots = await getDocs(propertiesRef);

    const matchingProperties = [];

    // loop through each property
    for (const propertyDoc of propertySnapshots.docs) {
        const propertyData = propertyDoc.data();

        // fetch rooms inside each property
        const roomsRef = collection(db, "properties", propertyDoc.id, "rooms");
        const roomsSnapshot = await getDocs(roomsRef);

        if (roomsSnapshot.empty) continue; // no rooms at all

        // filter only rooms that are pending or reverify
        const filteredRooms = roomsSnapshot.docs
            .map((roomDoc) => ({ id: roomDoc.id, ...roomDoc.data() }))
            .filter((room) => {
                const status = room.verificationStatus?.toLowerCase();
                return status === "pending" || status === "reverify";
            });

        // only include property if at least 1 room qualifies
        if (filteredRooms.length > 0) {
            // fetch owner name from users collection
            let ownerName = "Unknown Owner";
            if (propertyData.ownerId) {
                try {
                    const userRef = doc(db, "users", propertyData.ownerId);
                    const userSnapshot = await getDoc(userRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        const firstName = userData.firstName || "";
                        const lastName = userData.lastName || "";
                        ownerName = `${firstName} ${lastName}`.trim() || "Unknown Owner";
                    }
                } catch (error) {
                    console.error(`Error fetching owner for property ${propertyDoc.id}:`, error);
                }
            }

            matchingProperties.push({
                id: propertyDoc.id,
                ...propertyData,
                ownerName,
                rooms: filteredRooms,
            });
        }
    }

    return matchingProperties;
};

// Delete a specific room under a given property
export const deleteRoom = async (propertyId, roomId) => {
    if (!propertyId || !roomId) {
        console.error("❌ Missing propertyId or roomId.");
        return;
    }

    try {
        const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
        await deleteDoc(roomRef);
        console.log(`✅ Room ${roomId} successfully deleted from property ${propertyId}.`);
        return true;
    } catch (error) {
        console.error("🔥 Error deleting room:", error);
        throw error;
    }
};