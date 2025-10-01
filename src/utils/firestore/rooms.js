import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// //get booked room by user
// export const getBookedRoomByUser = async (userId) => {
//     if (!userId) return null;

//     try {
//         //get all properties
//         const propertiesSnap = await getDocs(collection(db, "properties"));

//         //loop each property and check its rooms subcollection
//         for (const propertyDoc of propertiesSnap.docs) {
//             const propertyId = propertyDoc.id;

//             //build a query for the rooms subcollection of this property
//             const roomsRef = collection(db, "properties", propertyId, "rooms");
//             const q = query(roomsRef, where("seekerId", "==", userId));
//             const roomsSnap = await getDocs(q);

//             if (!roomsSnap.empty) {
//                 const roomDoc = roomsSnap.docs[0];
//                 return {
//                     propertyId,
//                     roomId: roomDoc.id,
//                     ...roomDoc.data(),
//                 };
//             }
//         }

//         // no booked room found
//         return null;
//     } catch (error) {
//         console.error("Error fetching booked room:", error);
//         return null;
//     }
// };

// // Get stay duration for a seeker
// export const getSeekerStayDuration = async (userId) => {
//     if (!userId) return null;

//     try {
//         // Step 1: Loop through all properties and rooms to find the one booked by this seeker
//         const propertiesSnap = await getDocs(collection(db, "properties"));

//         for (const propertyDoc of propertiesSnap.docs) {
//             const propertyId = propertyDoc.id;
//             const roomsRef = collection(db, "properties", propertyId, "rooms");
//             const q = query(roomsRef, where("seekerId", "==", userId));
//             const roomsSnap = await getDocs(q);

//             if (!roomsSnap.empty) {
//                 const roomDoc = roomsSnap.docs[0];
//                 const roomId = roomDoc.id;

//                 // Step 2: Find a booking in "bookings" collection with this roomId
//                 const bookingsRef = collection(db, "bookings");
//                 const bookingQuery = query(bookingsRef, where("roomId", "==", roomId), where("seekerId", "==", userId));
//                 const bookingsSnap = await getDocs(bookingQuery);

//                 if (!bookingsSnap.empty) {
//                     const bookingDoc = bookingsSnap.docs[0];
//                     const bookingData = bookingDoc.data();

//                     // Step 3: Extract bookingDate
//                     const bookingDate = bookingData.bookingDate?.toDate 
//                         ? bookingData.bookingDate.toDate() 
//                         : new Date(bookingData.bookingDate);

//                     // Step 4: Calculate duration
//                     const now = new Date();
//                     const diffTime = Math.abs(now - bookingDate);
//                     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // days
//                     const diffMonths = Math.floor(diffDays / 30); // approx months
//                     const diffYears = Math.floor(diffDays / 365); // approx years

//                     return {
//                         propertyId,
//                         roomId,
//                         bookingId: bookingDoc.id,
//                         bookingDate,
//                         duration: {
//                             days: diffDays,
//                             months: diffMonths,
//                             years: diffYears,
//                         }
//                     };
//                 }
//             }
//         }

//         // No booking found
//         return null;

//     } catch (error) {
//         console.error("Error fetching seeker stay duration:", error);
//         return null;
//     }
// };

export const getBookedRoomByUser = async (userId) => {
    if (!userId) return null;

    try {
        // Step 1: Query bookings directly by seekerId
        const bookingsRef = collection(db, "bookings");
        const bookingQuery = query(bookingsRef, where("seekerId", "==", userId));
        const bookingSnap = await getDocs(bookingQuery);

        if (bookingSnap.empty) return null;

        const bookingDoc = bookingSnap.docs[0];
        const bookingData = bookingDoc.data();
        const roomId = bookingData.roomId;

        // Step 2: Find which property contains this room
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
                    roomName: roomData.name || "Unnamed Room",
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

export const getSeekerStayDuration = async (userId) => {
    if (!userId) return null;

    try {
        // Step 1: Find booking(s) for this seeker
        const bookingsRef = collection(db, "bookings");
        const bookingQuery = query(bookingsRef, where("seekerId", "==", userId));
        const bookingsSnap = await getDocs(bookingQuery);

        if (bookingsSnap.empty) return null;

        const bookingDoc = bookingsSnap.docs[0];
        const bookingData = bookingDoc.data();
        const roomId = bookingData.roomId;

        // Step 2: Resolve property that contains the room
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

        // Step 3: Compute stay duration
        const bookingDate = bookingData.bookingDate?.toDate
            ? bookingData.bookingDate.toDate()
            : new Date(bookingData.bookingDate);

        const now = new Date();
        const diffTime = Math.abs(now - bookingDate);
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

