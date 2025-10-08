import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAllSeekers } from './users';

export async function getSuccessfulSeekers() {
    const q = query(collection(db, "bookings"));
    const snap = await getDocs(q);

    // Extract unique seeker IDs
    const seekerIds = new Set(snap.docs.map(doc => doc.data().seekerId));
    return Array.from(seekerIds);
}

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
}
