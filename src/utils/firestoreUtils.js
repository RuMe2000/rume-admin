import { collection, query, where, getDocs, deleteDoc, getDoc, doc } from 'firebase/firestore';
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
};

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
};

//delete user
export const deleteUser = async (id, collectionName = "users") => {
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;

    try {
        await deleteDoc(doc(db, collectionName, id));
        console.log(`User with ID ${id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

//get all property count
export const getAllPropertyCount = async () => {
    const propertiesRef = collection(db, "properties");
    const q = query(propertiesRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
};

//get property count by status
export const getPropertyCountByStatus = async (status) => {
    const propertiesRef = collection(db, "properties");
    const q = query(propertiesRef, where("status", "==", status));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
}

export const getAllProperties = async () => {
    try {
        //get all properties
        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef);
        const querySnapshot = await getDocs(q);

        const allProperties = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        //get all unique owner IDs
        const ownerIds = Array.from(new Set(allProperties.map(p => p.ownerId).filter(Boolean)));

        //fetch owners once
        const ownerSnaps = await Promise.all(ownerIds.map(id => getDoc(doc(db, 'users', id))));
        const ownerMap = {};
        ownerSnaps.forEach((snap, idx) => {
            const id = ownerIds[idx];
            if (snap.exists()) {
                const data = snap.data();
                const first = data.firstName ?? '';
                const last = data.lastName ?? '';
                ownerMap[id] = (first || last) ? `${first} ${last}`.trim() : 'Unknown Owner';
            } else {
                ownerMap[id] = 'Unknown Owner';
            }
        });

        //attach ownerName into each property
        const withOwners = allProperties.map(p => ({
            ...p,
            ownerName: ownerMap[p.ownerId] ?? 'Unknown Owner'
        }));

        return withOwners;
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
};

//get all pending properties
export const getPendingProperties = async () => {
    try {
        //get all properties
        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef, where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);

        const allProperties = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        //get all unique owner IDs
        const ownerIds = Array.from(new Set(allProperties.map(p => p.ownerId).filter(Boolean)));

        //fetch owners once
        const ownerSnaps = await Promise.all(ownerIds.map(id => getDoc(doc(db, 'users', id))));
        const ownerMap = {};
        ownerSnaps.forEach((snap, idx) => {
            const id = ownerIds[idx];
            if (snap.exists()) {
                const data = snap.data();
                const first = data.firstName ?? '';
                const last = data.lastName ?? '';
                ownerMap[id] = (first || last) ? `${first} ${last}`.trim() : 'Unknown Owner';
            } else {
                ownerMap[id] = 'Unknown Owner';
            }
        });

        //attach ownerName into each property
        const withOwners = allProperties.map(p => ({
            ...p,
            ownerName: ownerMap[p.ownerId] ?? 'Unknown Owner'
        }));

        return withOwners;
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
};

//get all verified properties
export const getVerifiedProperties = async () => {
    try {
        //get all properties
        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef, where("status", "==", "verified"));
        const querySnapshot = await getDocs(q);

        const allProperties = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        //get all unique owner IDs
        const ownerIds = Array.from(new Set(allProperties.map(p => p.ownerId).filter(Boolean)));

        //fetch owners once
        const ownerSnaps = await Promise.all(ownerIds.map(id => getDoc(doc(db, 'users', id))));
        const ownerMap = {};
        ownerSnaps.forEach((snap, idx) => {
            const id = ownerIds[idx];
            if (snap.exists()) {
                const data = snap.data();
                const first = data.firstName ?? '';
                const last = data.lastName ?? '';
                ownerMap[id] = (first || last) ? `${first} ${last}`.trim() : 'Unknown Owner';
            } else {
                ownerMap[id] = 'Unknown Owner';
            }
        });

        //attach ownerName into each property
        const withOwners = allProperties.map(p => ({
            ...p,
            ownerName: ownerMap[p.ownerId] ?? 'Unknown Owner'
        }));

        return withOwners;
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
};

