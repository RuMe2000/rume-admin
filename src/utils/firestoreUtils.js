import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

//get all user count
export const getAllUserCount = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
}

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

//get all property count
export const getAllPropertyCount = async () => {
    const propertiesRef = collection(db, "properties");
    const q = query(propertiesRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
};

//get pending property count
export const getPendingPropertyCount = async (status) => {
    const propertiesRef = collection(db, "properties");
    const q = query(propertiesRef, where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
}

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
                const first = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1) ?? '';
                const last = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1) ?? '';
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
                const first = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1) ?? '';
                const last = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1) ?? '';
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
                const first = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1) ?? '';
                const last = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1) ?? '';
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

//get this week transaction count
export const getRecentTransactionCount = async () => {
    //get current date/time
    const now = new Date();
    //get start of the week
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    //firestore query
    const transactionsRef = collection(db, "transactions");
    const q = query(
        transactionsRef,
        where("createdAt", ">=", startOfWeek)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

//get all transactions
export const getTransactions = async () => {
    try {
        //get all transactions
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef);
        const querySnapshot = await getDocs(q);

        const transactions = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        //get all seeker ids
        const seekerIds = Array.from(new Set(transactions.map(p => p.userId).filter(Boolean)));

        //fetch seekers
        const seekerSnaps = await Promise.all(seekerIds.map(id => getDoc(doc(db, 'users', id))));
        const seekerMap = {};
        seekerSnaps.forEach((snap, idx) => {
            const id = seekerIds[idx];
            if (snap.exists()) {
                const data = snap.data();
                const first = data.firstName ?? '';
                const last = data.lastName ?? '';
                seekerMap[id] = (first || last) ? `${first} ${last}`.trim() : 'Unknown Seeker';
            } else {
                seekerMap[id] = 'Unknown Seeker';
            }
        });

        //attach seeker name to transaction
        const withSeekers = transactions.map(p => ({
            ...p,
            seekerName: seekerMap[p.userId] ?? 'Unknown Seeker'
        }));

        return withSeekers;
    } catch (error) {
        console.error('Error fetching seekers:', error);
        return [];
    }
};

//delete user from firestore
export const deleteUser = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        console.log(`Successfully deleted user document: ${userId}`);
    } catch (error) {
        console.error('Error deleting user document:', error);
        throw new Error(`Failed to delete user document: ${error.message}`);
    }
};

//suspend user
export const suspendUser = async (userId, daysToSuspend) => {
    const days = parseInt(daysToSuspend);

    if (isNaN(days) || days <= 0) {
        throw new Error('Invalid number of days entered');
    }

    try {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + days);

        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            status: 'suspended',
            suspendedUntil: suspendedUntil.toISOString()
        });

        console.log(`User ${userId} has been suspended for ${days} days.`);
    } catch (error) {
        console.error('Error suspending user:', error);
        throw new Error(`Failed to suspend user: ${error.message}`);
    }
};

//unsuspend user
export const unsuspendUser = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        status: 'active',
        suspendedUntil: null
    });
};

//delete property
export const deleteProperty = async (propertyId) => {
    try {
        await deleteDoc(doc(db, "properties", propertyId));
        console.log(`Successfully deleted property listing: ${propertyId}`);
    } catch (error) {
        console.error('Error deleting property listing:', error);
        throw new Error(`Failed to delete property listing: ${error.message}`);
    }
}


//get user info
export const getUserById = async (userId) => {
    if (!userId) throw new Error("No userId provided");
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

//verify property owner
export const verifyOwner = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        status: 'verified',
    });
};

//unverify property owner
export const unverifyOwner = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        status: 'unverified',
    });
};

export const verifyProperty = async (propertyId) => {
    const propertyDocRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyDocRef, {
        status: 'verified',
    });
};

export const unverifyProperty = async (propertyId) => {
    const propertyDocRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyDocRef, {
        status: 'pending',
    });
};

//get all properties where ownerId === userId
export const getPropertiesByUser = async (userId) => {
    if (!userId) return [];

    try {
        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef, where("ownerId", "==", userId));
        const querySnapshot = await getDocs(q);

        //map docs into an array of objects
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching properties:", error);
        return [];
    }
};

//get booked room by user
export const getBookedRoomByUser = async (userId) => {
    if (!userId) return null;

    try {
        //get all properties
        const propertiesSnap = await getDocs(collection(db, "properties"));

        //loop each property and check its rooms subcollection
        for (const propertyDoc of propertiesSnap.docs) {
            const propertyId = propertyDoc.id;

            //build a query for the rooms subcollection of this property
            const roomsRef = collection(db, "properties", propertyId, "rooms");
            const q = query(roomsRef, where("seekerId", "==", userId));
            const roomsSnap = await getDocs(q);

            if (!roomsSnap.empty) {
                const roomDoc = roomsSnap.docs[0];
                return {
                    propertyId,      
                    roomId: roomDoc.id,
                    ...roomDoc.data(),
                };
            }
        }

        // no booked room found
        return null;
    } catch (error) {
        console.error("Error fetching booked room:", error);
        return null;
    }
};

