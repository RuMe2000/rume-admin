import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load service account
const serviceAccount = JSON.parse(
    readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com"
});

const db = admin.firestore();

async function fixSeekerStatuses() {
    console.log("🔍 Updating seeker statuses...");

    // Get all seekers
    const seekersSnap = await db.collection("users").where("role", "==", "seeker").get();

    if (seekersSnap.empty) {
        console.log("⚠️ No seekers found.");
        return;
    }

    for (const seekerDoc of seekersSnap.docs) {
        const seekerId = seekerDoc.id;

        // Check if this seeker has any bookings
        const bookingsSnap = await db.collection("bookings").where("seekerId", "==", seekerId).where("status", "==", "booked").get();

        const status = bookingsSnap.empty ? "searching" : "booked";

        // Update seeker status
        await db.collection("users").doc(seekerId).update({ status });

        console.log(`✅ Updated seeker ${seekerId} → ${status}`);
    }

    console.log("🎉 All seekers updated!");
}

fixSeekerStatuses()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
