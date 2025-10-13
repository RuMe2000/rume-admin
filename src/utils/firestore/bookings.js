import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAllSeekers } from './users';

export async function getSuccessfulSeekers() {
    // Query only bookings where status === 'booked'
    const q = query(
        collection(db, "bookings"),
        where("status", "==", "booked")
    );

    const snap = await getDocs(q);

    // Extract unique seeker IDs
    const seekerIds = new Set(snap.docs.map(doc => doc.data().seekerId));
    return Array.from(seekerIds);
};

//booking success ratio
export async function getBookingSuccessRatio() {
    const seekers = await getAllSeekers();
    const successfulSeekers = await getSuccessfulSeekers();

    const totalSeekers = seekers.length;
    const successfulCount = successfulSeekers.filter(id =>
        seekers.some(s => s.id === id)
    ).length;

    const ratio = totalSeekers > 0 ? (successfulCount / totalSeekers) * 100 : 0;

    return {
        totalSeekers,
        successfulCount,
        ratio: ratio.toFixed(2) // percentage with 2 decimals
    };
}

// Listen for number of "booked" bookings per month (real-time)
export function listenBookingsPerMonth(callback) {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("status", "==", "booked"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const monthlyCounts = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || data.createdAt;
            if (!createdAt) return;

            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
            if (!monthlyCounts[monthKey]) monthlyCounts[monthKey] = 0;
            monthlyCounts[monthKey] += 1;
        });

        // format for chart [{ month: "Jan 2025", bookings: 10 }, ...]
        const formatted = Object.entries(monthlyCounts)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([key, count]) => {
                const [year, month] = key.split("-");
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return { month: `${monthNames[Number(month) - 1]} ${year}`, bookings: count };
            });

        callback(formatted);
    });

    return unsubscribe;
};

//get top properties based on booking counts
export async function getTop5PropertiesByBookings() {
    try {
        const bookingsRef = collection(db, "bookings");
        const bookedQuery = query(bookingsRef, where('status', '==', 'booked'));
        const bookingsSnapshot = await getDocs(bookedQuery);

        if (bookingsSnapshot.empty) return [];

        // Count bookings per propertyId
        const bookingCounts = {};
        bookingsSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const propertyId = data.propertyId;
            if (propertyId) {
                bookingCounts[propertyId] = (bookingCounts[propertyId] || 0) + 1;
            }
        });

        // Sort by booking count (descending)
        const sortedPropertyIds = Object.entries(bookingCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // top 3

        // Fetch property details
        const topProperties = [];
        for (const [propertyId, count] of sortedPropertyIds) {
            const propertyRef = doc(db, "properties", propertyId);
            const propertySnap = await getDoc(propertyRef);

            if (!propertySnap.exists()) continue;

            const propertyData = propertySnap.data();

            // Get owner name
            let ownerName = "Unknown Owner";
            if (propertyData.ownerId) {
                try {
                    const ownerRef = doc(db, "users", propertyData.ownerId);
                    const ownerSnap = await getDoc(ownerRef);
                    if (ownerSnap.exists()) {
                        const ownerData = ownerSnap.data();
                        ownerName = `${ownerData.firstName || ""} ${ownerData.lastName || ""}`.trim() || "Unknown Owner";
                    }
                } catch (error) {
                    console.error("Error fetching owner info:", error);
                }
            }

            topProperties.push({
                propertyId,
                propertyName: propertyData.name || "Unnamed Property",
                ownerName,
                bookingsCount: count,
            });
        }

        return topProperties;
    } catch (error) {
        console.error("Error fetching top properties:", error);
        return [];
    }
};

export const getBookingStatusCounts = async () => {
    try {
        const bookingsRef = collection(db, "bookings");

        // Query counts for each status
        const [pendingSnap, awaitingSnap, bookedSnap] = await Promise.all([
            getDocs(query(bookingsRef, where("status", "==", "pending"))),
            getDocs(query(bookingsRef, where("status", "==", "awaiting_payment"))),
            getDocs(query(bookingsRef, where("status", "==", "booked"))),
        ]);

        const counts = {
            pendingCount: pendingSnap.size,
            awaitingPaymentCount: awaitingSnap.size,
            bookedCount: bookedSnap.size,
        };

        return counts;
    } catch (error) {
        console.error("Error fetching booking status counts:", error);
        return { pendingCount: 0, awaitingPaymentCount: 0, bookedCount: 0 };
    }
};
