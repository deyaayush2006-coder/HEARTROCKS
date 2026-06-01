const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://heartrock-5baf0-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const firestore = admin.firestore();
const realtimeDB = admin.database();

module.exports = {
    firestore,
    realtimeDB
};