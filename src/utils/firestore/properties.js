import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

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

export const verifyProperty = async (propertyId) => {
    const propertyDocRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyDocRef, {
        status: 'verified',
        dateVerified: serverTimestamp()
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

//pending properties listener
export const listenForPendingProperties = (callback) => {
    const q = query(
        collection(db, "properties"),
        where("status", "==", "pending")
    );

    return onSnapshot(q, (snapshot) => {
        const pending = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(pending);
    });
};
