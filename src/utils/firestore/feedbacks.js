import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

//fetch all feedbacks
export const getFeedbacks = async () => {
    try {
        const feedbacksRef = collection(db, "feedback");
        const q = query(feedbacksRef, where("status", "==", "pending"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        const snapshot = await getDocs(collection(db, "feedback"));
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
};

// Approve feedback
export const approveFeedback = async (id) => {
    const feedbackRef = doc(db, "feedback", id);
    await updateDoc(feedbackRef, { status: "approved" });
};

// Reject feedback
export const rejectFeedback = async (id) => {
    const feedbackRef = doc(db, "feedback", id);
    await updateDoc(feedbackRef, { status: "rejected" });
};

// Edit feedback content
export const updateFeedback = async (id, newContent) => {
    const feedbackRef = doc(db, "feedback", id);
    await updateDoc(feedbackRef, { description: newContent });
};