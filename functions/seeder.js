const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { useId } = require("react");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "rume-admintest",
});

const db = admin.firestore();

async function seed() {
    const usersRef = db.collection("users");

    //dummy users
    const users = [
        {
            uid: "bNUk40iRIEY8GmqjEDUOzGkv3h23",
            email: "owner1@gmail.com",
            role: "owner",
            name: "Alice Owner",
            createdAt: admin.firestore.Timestamp.now(),
        },
        {
            uid: "46xZgRGpl6Tgs9U5zIFU3ptNcXq2",
            email: "seeker2@gmail.com",
            role: "seeker",
            name: "Bob Seeker",
            createdAt: admin.firestore.Timestamp.now(),
        },
        {
            uid: "50IN6QMyhsWNpvnKVLGHfJlq3nw2",
            email: "seeker1@gmail.com",
            role: "seeker",
            name: "Carol Seeker",
            createdAt: admin.firestore.Timestamp.now(),
        },
        {
            uid: "NsdBDd7c6aPRiaAg4NknosuPvMi2",
            email: "admin@gmail.com",
            role: "admin",
            name: "Dave Admin",
            createdAt: admin.firestore.Timestamp.now(),
        },
    ];

    try {
        for (const user of users) {
            await usersRef.doc(user.uid).set(user);
            console.log(`✅ Seeded user: ${user.name}`);
        }
        console.log("🎉 Seeding complete!");
    } catch (error) {
        console.error("❌ Error seeding users:", error);
    }
}

seed();