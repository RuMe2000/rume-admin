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

