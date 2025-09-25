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
            // Created
            action = "created";
            ownerId = afterData.ownerId || "unknown";
        } else if (beforeData && afterData) {
            // Updated
            action = "updated";
            ownerId = afterData.ownerId || beforeData.ownerId || "unknown";

            // find changed fields
            Object.keys(afterData).forEach((key) => {
                if (JSON.stringify(afterData[key]) !== JSON.stringify(beforeData[key])) {
                    changedFields[key] = {
                        old: beforeData[key],
                        new: afterData[key],
                    };
                }
            });
        } else if (beforeData && !afterData) {
            // Deleted
            action = "deleted";
            ownerId = beforeData.ownerId || "unknown";
        }

        // Skip if we couldn’t determine action
        if (!action) return;

        // Build log object
        const log = {
            type: "property_update",
            action,
            propertyId,
            ownerId,
            changedFields,
            message: `Property ${propertyId} has been ${action}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Save to systemLogs
        await db.collection("systemLogs").add(log);
        console.log("System log added:", log);
    });


export const logUserChanges = functions.firestore
    .onDocumentWritten("users/{userId}", async (event) => {
        const userId = event.params.userId;
        const beforeData = event.data?.before?.data();
        const afterData = event.data?.after?.data();

        let action = "";
        let changedFields = {};
        let email = "";

        // Determine action type
        if (!beforeData && afterData) {
            // Created
            action = "created";
            email = afterData.email || "unknown";
        } else if (beforeData && afterData) {
            // Updated
            action = "updated";
            email = afterData.email || beforeData.email || "unknown";

            // find changed fields
            Object.keys(afterData).forEach((key) => {
                if (JSON.stringify(afterData[key]) !== JSON.stringify(beforeData[key])) {
                    changedFields[key] = {
                        old: beforeData[key],
                        new: afterData[key],
                    };
                }
            });
        } else if (beforeData && !afterData) {
            // Deleted
            action = "deleted";
            email = beforeData.email || "unknown";
        }

        if (!action) return;

        // Build log object
        const log = {
            type: "user_update",
            action,
            userId,
            email,
            changedFields,
            message: `User ${userId} ${action} their account`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Save to systemLogs
        await db.collection("systemLogs").add(log);
        console.log("System log added:", log);
    });

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
            // get ownerId from the property doc
            const propertyDoc = await db.collection("properties").doc(propertyId).get();
            ownerId = propertyDoc.data()?.ownerId || "unknown";
        } else if (beforeData && afterData) {
            action = "updated";
            const propertyDoc = await db.collection("properties").doc(propertyId).get();
            ownerId = propertyDoc.data()?.ownerId || "unknown";
        } else if (beforeData && !afterData) {
            action = "deleted";
            const propertyDoc = await db.collection("properties").doc(propertyId).get();
            ownerId = propertyDoc.data()?.ownerId || "unknown";
        }

        if (!action) return;

        const log = {
            type: "room_update",
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

export const logTransactionPayments = functions.firestore
    .onDocumentCreated("transactions/{transactionId}", async (event) => {
        const transactionId = event.params.transactionId;
        const data = event.data?.data();

        if (!data) return;

        // assuming these fields exist in the transaction doc:
        // seekerId, ownerId, totalAmount, description
        const seekerId = data.userId || "unknown-seeker";
        const ownerId = data.ownerId || "unknown-owner";
        const totalAmount = data.totalAmount/100 ?? 0;
        const description = data.description || "unspecified";

        const log = {
            type: "transaction_payment",
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