import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
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