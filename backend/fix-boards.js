const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Replace this ID with your actual User ID from your Profile page
const USER_ID = "JQmrwXjKxzPTMtymgmH4x6ACFSq2";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixOldBoards() {
    console.log("🛠️ Starting Board Fixes...");

    try {
        const snapshot = await db.collection('boards').get();
        let fixedCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // If the board has "system" or no createdBy (old format), assign it to you
            if (!data.createdBy || data.createdBy === "system") {
                await db.collection('boards').doc(doc.id).update({
                    createdBy: USER_ID
                });
                console.log(`✅ Fixed Board [${doc.id}] : "${data.name}" -> Now owned by you!`);
                fixedCount++;
            }
        }

        console.log(`🎉 Finished! Fixed ${fixedCount} boards.`);
    } catch (error) {
        console.error("❌ Error updating boards:", error);
    }
}

fixOldBoards();
