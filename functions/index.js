const { setGlobalOptions } = require("firebase-functions/v2/options");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

//automatically delete firebase auth user when firestore doc is deleted
exports.deleteAuthUser = onDocumentDeleted(
    "users/{userId}",
    async (event) => {
        const uid = event.params.userId; //firestore doc id must match auth uid

        try {
            await admin.auth().deleteUser(uid);
            console.log(`Deleted auth user with UID: ${uid}`);
        } catch (error) {
            console.error("Error deleting auth user:", error);
        }
    }
);