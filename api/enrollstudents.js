/* eslint-env node */
const admin = require("firebase-admin");

// Initialize Admin SDK if not already initialized.
if (!admin.apps.length) {
  // Parse the service account JSON from the environment variable.
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: If you use Firestore, set your database URL:
    // databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

module.exports = async (req, res) => {
  // Only allow POST requests.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, matricNumber, department, courses } = req.body;

  if (!name || !email || !matricNumber || !department) {
    return res.status(400).json({ error: "Missing required fields (name, email, matricNumber, or department)." });
  }

  try {
    const defaultPassword = "student123";
    const userRecord = await admin.auth().createUser({
      email,
      password: defaultPassword,
      displayName: name,
    });
    const uid = userRecord.uid;

    // Prepare user data.
    const userData = {
      userId: uid,
      email,
      matricNumber,
      role: "student",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Write to the "users" collection.
    await admin.firestore().doc(`users/${uid}`).set(userData);

    // Prepare student data.
    const studentData = {
      name,
      matricNumber,
      email,
      department,
      courses: courses || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      enrolledBy: "admin", // You can hardcode your admin ID or name here.
      authUserId: uid,
    };

    // Write to the "students" collection.
    await admin.firestore().collection("students").add(studentData);

    return res.status(200).json({ success: true, message: "Student enrolled successfully." });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return res.status(500).json({ error: error.message });
  }
};
