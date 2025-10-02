const admin = require("firebase-admin");
const { readFileSync } = require("fs");

const serviceAccount = JSON.parse(
    readFileSync("./serviceAccountKey.json", "utf8")
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const randomFirstNames = ["Apple", "Earl", "Karla", "Khryz", "Kyle", "Carl", "John Paul", "Yhl", "Errol", "Dave", "Zuher", "Gabriel", "Russel", "Shane", "Samantha"];
const randomLastNames = ["Mandap", "Dela Cruz", "Gacias", "Armentia", "Franial", "Cerna", "Facinabao", "Pasinag", "Carreon", "Ortiz", "Dondiego", "Ubas", "Balala", "Alfaro", "Sagosaurus"];
const randomAddresses = [
    "Purok Maligaya, Concepcion, Isulan, Sultan Kudarat",
    "Bo. 2, Tacurong",
    "Santol St. Brgy. Macopa, Digos",
    "Rotonda, Tupi, South Cotabato",
    "Bo. 7, Koronadal City, South Cotabato",
    "Kukoba, Maasim, Saranggani",
    "Prk. Inisog, Brgy. Lalayan, Isulan",
    "Barangay Ginebra, Tondo, Manila",
    "Lapu-lapu, Cebu",
    "Jaro, La Paz, Iloilo",
];
const randomPhone = () =>
    `09${Math.floor(100000000 + Math.random() * 900000000)}`;

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Get random profile image
async function getRandomProfileImage(gender = "male") {
    try {
        const response = await fetch(`https://randomuser.me/api/?gender=${gender}`);
        const data = await response.json();
        return data.results[0].picture.medium || null;
    } catch (err) {
        console.error("Error fetching profile image:", err);
        return null;
    }
}

const createUsers = async () => {
    const seekers = Array.from({ length: 15 }).map((_, i) => ({
        email: `seeker${i + 1}@example.com`,
        password: "password123",
        firstName: randomFrom(randomFirstNames),
        lastName: randomFrom(randomLastNames),
        sex: Math.random() > 0.5 ? "Male" : "Female",
        role: "seeker",
        dateOfBirth: admin.firestore.Timestamp.fromDate(
            new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        ),
        address: randomFrom(randomAddresses),
        phoneNumber: randomPhone(),
        profileImageUrl: null,
        status: "active",
    }));

    const owners = Array.from({ length: 15 }).map((_, i) => ({
        email: `owner${i + 1}@example.com`,
        password: "password123",
        firstName: randomFrom(randomFirstNames),
        lastName: randomFrom(randomLastNames),
        gender: Math.random() > 0.5 ? "Male" : "Female",
        role: "owner",
        dateOfBirth: admin.firestore.Timestamp.fromDate(
            new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        ),
        address: randomFrom(randomAddresses),
        phoneNumber: randomPhone(),
        profileImageUrl: null,
        propertyId: null,
        status: "unverified",
    }));

    const allUsers = [...seekers, ...owners];

    for (const user of allUsers) {
        try {
            // Create Auth account
            const createdUser = await admin.auth().createUser({
                email: user.email,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
            });

            console.log(`✅ Created user: ${user.email}`);

            // Assign random profile image
            const genderForImage =
                user.role === "seeker"
                    ? user.sex.toLowerCase()
                    : user.gender.toLowerCase();

            const profileImageUrl = await getRandomProfileImage(genderForImage);

            // Build Firestore doc
            const userDoc =
                user.role === "seeker"
                    ? {
                        uid: createdUser.uid,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        sex: user.sex,
                        role: "seeker",
                        dateOfBirth: user.dateOfBirth,
                        address: user.address,
                        phoneNumber: user.phoneNumber,
                        profileImageUrl,
                        status: "active",
                        createdAt: admin.firestore.Timestamp.now(),
                    }
                    : {
                        uid: createdUser.uid,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        gender: user.gender,
                        role: "owner",
                        dateOfBirth: user.dateOfBirth,
                        address: user.address,
                        phoneNumber: user.phoneNumber,
                        profileImageUrl,
                        propertyId: null,
                        status: "unverified",
                        createdAt: admin.firestore.Timestamp.now(),
                    };

            // Save in Firestore
            await db.collection("users").doc(createdUser.uid).set(userDoc);

            console.log(`   ➡️ Added ${user.role} to Firestore: ${user.email}`);
        } catch (error) {
            if (error.code === "auth/email-already-exists") {
                console.log(`⚠️ User already exists: ${user.email}`);
            } else {
                console.error(`❌ Error creating ${user.email}:`, error);
            }
        }
    }

    console.log("🎉 Seeding complete!");
    process.exit();
};

createUsers();
