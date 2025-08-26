import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

//get user count by role
export const getUserCountByRole = async (role) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
}

//get users by role
export const getUsersByRole = async (role) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });

    return users;
};

//get all seekers
export const getAllSeekers = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where('role', '==', 'seeker'));
        const querySnapshot = await getDocs(q);

        const seekers = [];
        querySnapshot.forEach((doc) => {
            seekers.push({ id: doc.id, ...doc.data() });
        });

        return seekers;
    } catch (error) {
        console.error('Error fetching seekers:', error);
        return [];
    }
};

//get all owners
export const getAllOwners = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where('role', '==', 'owner'));
        const querySnapshot = await getDocs(q);

        const owners = [];
        querySnapshot.forEach((doc) => {
            owners.push({ id: doc.id, ...doc.data() });
        });

        return owners;
    } catch (error) {
        console.error('Error fetching owners:', error);
        return [];
    }
}

//get all admins
export const getAllAdmins = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where('role', '==', 'admin'));
        const querySnapshot = await getDocs(q);

        const admins = [];
        querySnapshot.forEach((doc) => {
            admins.push({ id: doc.id, ...doc.data() });
        });

        return admins;
    } catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
}

//delete user
export const deleteUser = async (id, collectionName = "users") => {
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;

    try {
        await deleteDoc(doc(db, collectionName, id));
        console.log(`User with ID ${id} deleted successfully`);
    } catch (error){
        console.error("Error deleting user:", error);
        throw error;
    }
}