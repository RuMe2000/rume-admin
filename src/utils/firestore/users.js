import { collection, query, where, getDocs, deleteDoc, getDoc, doc, updateDoc, getCountFromServer, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

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

//get owner name by property id
export const getOwnerNameByPropertyId = async (propertyId) => {
    try {
        // fetch the property doc
        const propertySnap = await getDoc(doc(db, "properties", propertyId));
        if (!propertySnap.exists()) return "aaaaa";

        const propertyData = propertySnap.data();
        const ownerId = propertyData.ownerId;
        if (!ownerId) return "bbbbb";

        // fetch the owner user doc
        const ownerSnap = await getDoc(doc(db, "users", ownerId));
        if (!ownerSnap.exists()) return "ccccc";

        const ownerData = ownerSnap.data();
        const first =
            ownerData.firstName?.charAt(0).toUpperCase() +
            ownerData.firstName?.slice(1) ?? "";
        const last =
            ownerData.lastName?.charAt(0).toUpperCase() +
            ownerData.lastName?.slice(1) ?? "";

        return (first || last) ? `${first} ${last}`.trim() : "ddddd";
    } catch (err) {
        console.error("Error fetching owner name:", err);
        return "fffff";
    }
};

//get seeker age
function calculateAge(dob) {
    const today = new Date();
    const birthDate = dob instanceof Date ? dob : dob.toDate(); // handle Timestamp or Date
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export async function getAgeBracketDistribution() {
    const seekersQuery = query(collection(db, "users"), where("role", "==", "seeker"));
    const snap = await getDocs(seekersQuery);

    // Initialize brackets
    const brackets = {
        "<18": 0,
        "18-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45-54": 0,
        "55+": 0,
    };

    snap.forEach((doc) => {
        const data = doc.data();
        if (data.dateOfBirth) {
            const age = calculateAge(data.dateOfBirth);

            if (age < 18) brackets["<18"]++;
            else if (age >= 18 && age <= 24) brackets["18-24"]++;
            else if (age >= 25 && age <= 34) brackets["25-34"]++;
            else if (age >= 35 && age <= 44) brackets["35-44"]++;
            else if (age >= 45 && age <= 54) brackets["45-54"]++;
            else if (age >= 55) brackets["55+"]++;
        }
    });

    return brackets;
}

//get verified and unverified owner count
export const getOwnerCountByStatus = async () => {
    try {
        const ownersQuery = query(collection(db, "users"), where("role", "==", "owner"));
        const snapshot = await getDocs(ownersQuery);

        let verified = 0;
        let unverified = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === "verified") {
                verified++;
            } else {
                unverified++;
            }
        });

        return { verified, unverified, total: verified + unverified };
    } catch (error) {
        console.error("Error fetching owner count by status:", error);
        return { verified: 0, unverified: 0, total: 0 };
    }
};

// Get count of Seekers and Owners
export const getUserRoleCounts = async () => {
    try {
        const seekersQuery = query(collection(db, "users"), where("role", "==", "seeker"));
        const ownersQuery = query(collection(db, "users"), where("role", "==", "owner"));

        const [seekersSnap, ownersSnap] = await Promise.all([
            getCountFromServer(seekersQuery),
            getCountFromServer(ownersQuery),
        ]);

        return {
            seekers: seekersSnap.data().count,
            owners: ownersSnap.data().count,
        };
    } catch (error) {
        console.error("Error getting user role counts:", error);
        return { seekers: 0, owners: 0 };
    }
};

