// functions/unseeder.js
const admin = require("firebase-admin");
const { readFileSync } = require("fs");

// Load your service account
const serviceAccount = JSON.parse(
    readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const deleteSeededUsers = async () => {
    try {
        // get all users from Auth
        let nextPageToken;
        let authUsers = [];
        do {
            const result = await admin.auth().listUsers(1000, nextPageToken);
            authUsers = authUsers.concat(result.users);
            nextPageToken = result.pageToken;
        } while (nextPageToken);

        // filter only seeded accounts (our dummy emails)
        const seededUsers = authUsers.filter(
            (u) =>
                u.email?.startsWith("seeker") ||
                u.email?.startsWith("owner")
        );

        console.log(`Found ${seededUsers.length} seeded users.`);

        // delete from Auth
        for (const user of seededUsers) {
            try {
                await admin.auth().deleteUser(user.uid);
                console.log(`✅ Deleted Auth user: ${user.email}`);

                // delete from Firestore
                await db.collection("users").doc(user.uid).delete();
                console.log(`   ➡️ Deleted Firestore doc for: ${user.email}`);
            } catch (err) {
                console.error(`❌ Error deleting ${user.email}:`, err);
            }
        }

        console.log("🎉 Unseeding complete!");
        process.exit();
    } catch (error) {
        console.error("Error during unseeding:", error);
        process.exit(1);
    }
};

deleteSeededUsers();
