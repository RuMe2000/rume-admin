// functions/index.js
import * as functions from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

admin.initializeApp();
const db = getFirestore();

export const logPropertyChanges = functions.firestore
    .onDocumentWritten("properties/{propertyId}", async (event) => {
        const propertyId = event.params.propertyId;
        const beforeData = event.data?.before?.data();
        const afterData = event.data?.after?.data();

        let action = "";
        let ownerId = "";
        let changedFields = {};

        // Determine action type
        if (!beforeData && afterData) {
            action = "created";
            ownerId = afterData.ownerId || "unknown";
        } else if (beforeData && afterData) {
            action = "updated";
            ownerId = afterData.ownerId || beforeData.ownerId || "unknown";

            // Detect changed fields
            Object.keys(afterData).forEach((key) => {
                if (JSON.stringify(afterData[key]) !== JSON.stringify(beforeData[key])) {
                    changedFields[key] = {
                        old: beforeData[key],
                        new: afterData[key],
                    };
                }
            });
        } else if (beforeData && !afterData) {
            action = "deleted";
            ownerId = beforeData.ownerId || "unknown";
        }

        if (!action) return;

        const log = {
            type: "property_update",
            category: "property",
            action,
            propertyId,
            ownerId,
            changedFields,
            message: `Property ${propertyId} has been ${action}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("systemLogs").add(log);
        console.log("System log added:", log);
    });


// 🧑 User Logs
export const logUserChanges = functions.firestore
    .onDocumentWritten("users/{userId}", async (event) => {
        const userId = event.params.userId;
        const beforeData = event.data?.before?.data();
        const afterData = event.data?.after?.data();

        let action = "";
        let changedFields = {};
        let email = "";

        if (!beforeData && afterData) {
            action = "created";
            email = afterData.email || "unknown";
        } else if (beforeData && afterData) {
            action = "updated";
            email = afterData.email || beforeData.email || "unknown";

            Object.keys(afterData).forEach((key) => {
                if (JSON.stringify(afterData[key]) !== JSON.stringify(beforeData[key])) {
                    changedFields[key] = {
                        old: beforeData[key],
                        new: afterData[key],
                    };
                }
            });
        } else if (beforeData && !afterData) {
            action = "deleted";
            email = beforeData.email || "unknown";
        }

        if (!action) return;

        const log = {
            type: "user_update",
            category: "user",
            action,
            userId,
            email,
            changedFields,
            message: `User ${userId} ${action} their account`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("systemLogs").add(log);
        console.log("System log added:", log);
    });


//Room Logs
export const logRoomChanges = functions.firestore
    .onDocumentWritten("properties/{propertyId}/rooms/{roomId}", async (event) => {
        const propertyId = event.params.propertyId;
        const roomId = event.params.roomId;

        const beforeData = event.data?.before?.data();
        const afterData = event.data?.after?.data();

        let action = "";
        let ownerId = "";

        if (!beforeData && afterData) {
            action = "created";
        } else if (beforeData && afterData) {
            action = "updated";
        } else if (beforeData && !afterData) {
            action = "deleted";
        }

        // Retrieve ownerId from property doc
        const propertyDoc = await db.collection("properties").doc(propertyId).get();
        ownerId = propertyDoc.data()?.ownerId || "unknown";

        if (!action) return;

        const log = {
            type: "room_update",
            category: "room",
            action,
            propertyId,
            roomId,
            ownerId,
            message: `${ownerId} has ${action} room ${roomId} in property ${propertyId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("systemLogs").add(log);
        console.log("System log added:", log);
    });


//Transaction Logs
export const logTransactionPayments = functions.firestore
    .onDocumentCreated("transactions/{transactionId}", async (event) => {
        const transactionId = event.params.transactionId;
        const data = event.data?.data();

        if (!data) return;

        const seekerId = data.userId || "unknown-seeker";
        const ownerId = data.ownerId || "unknown-owner";
        const totalAmount = data.totalAmount ? data.totalAmount / 100 : 0;
        const description = data.description || "unspecified";

        const log = {
            type: "transaction_payment",
            category: "transaction",
            transactionId,
            seekerId,
            ownerId,
            totalAmount,
            description,
            message: `${seekerId} has paid ${ownerId} ₱${totalAmount} for ${description}.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("systemLogs").add(log);
        console.log("System log added:", log);
    });


export const setDefaultSeekerStatus = functions.firestore.onDocumentCreated(
    "users/{userId}",
    async (event) => {
        const newUser = event.data?.data();

        if (!newUser) return;
        if (newUser.role === "seeker") {
            await db.collection("users").doc(event.params.userId).update({
                status: "searching",
            });
            console.log(`✅ Set seeker ${event.params.userId} to "searching"`);
        }
    }
);


export const updateSeekerStatusOnBookingChange = functions.firestore.onDocumentWritten(
    "bookings/{bookingId}",
    async (event) => {
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();

        // If booking was deleted
        if (before && !after) {
            const seekerId = before.seekerId;
            await checkAndUpdateSeekerStatus(seekerId);
            return;
        }

        // If booking was created or updated
        if (after) {
            const seekerId = after.seekerId;
            await checkAndUpdateSeekerStatus(seekerId);
        }
    }
);


async function checkAndUpdateSeekerStatus(seekerId) {
    const bookingsSnap = await db
        .collection("bookings")
        .where("seekerId", "==", seekerId)
        .where("status", "==", "booked")
        .get();

    const hasBooking = !bookingsSnap.empty;
    const newStatus = hasBooking ? "booked" : "searching";

    await db.collection("users").doc(seekerId).update({ status: newStatus });
    console.log(`🔄 Seeker ${seekerId} updated to ${newStatus}`);
}
