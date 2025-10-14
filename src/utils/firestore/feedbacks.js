import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

//fetch all feedbacks
export const getFeedbacks = async () => {
    try {
        const feedbacksRef = collection(db, "feedbacks");
        const q = query(feedbacksRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        // const snapshot = await getDocs(collection(db, "feedbacks"));
        // return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
};

// Approve feedback
export const approveFeedback = async (id) => {
    const feedbackRef = doc(db, "feedbacks", id);
    await updateDoc(feedbackRef, { status: "approved" });
};

// Reject feedback
export const rejectFeedback = async (id) => {
    const feedbackRef = doc(db, "feedbacks", id);
    await updateDoc(feedbackRef, { status: "rejected" });
};

// Edit feedback content
export const updateFeedback = async (id, newContent) => {
    const feedbackRef = doc(db, "feedbacks", id);
    await updateDoc(feedbackRef, { description: newContent });
};

export const getFeedbacksByProperty = async (propertyId) => {
    const q = query(collection(db, "feedbacks"), where("propertyId", "==", propertyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const toggleFeedbackVisibility = async (id, hidden) => {
    await updateDoc(doc(db, "feedbacks", id), { hidden });
};