/* eslint-env node */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.enrollStudent = functions.https.onCall(async (data, context) => {
  // Ensure the request is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  // Optionally, check if the calling user is an admin.
  // if (!context.auth.token.admin) {
  //   throw new functions.https.HttpsError("permission-denied", "User is not an admin.");
  // }

  const { name, email, matricNumber, department, courses } = data;

  if (!name || !email || !matricNumber || !department) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields (name, email, matricNumber, or department)."
    );
  }

  try {
    // Create a new user account with a default password.
    const defaultPassword = "student123";
    const userRecord = await admin.auth().createUser({
      email: email,
      password: defaultPassword,
      displayName: name,
    });
    const uid = userRecord.uid;

    // Prepare user data.
    const userData = {
      userId: uid,
      email: email,
      matricNumber: matricNumber,
      role: "student",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Write to the "users" collection using the student's UID as the document ID.
    await admin.firestore().doc(`users/${uid}`).set(userData);

    // Prepare student data.
    const studentData = {
      name: name,
      matricNumber: matricNumber,
      email: email,
      department: department,
      courses: courses || [], // Ensure courses is an array.
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      enrolledBy: context.auth.uid, // The admin who enrolled the student.
      authUserId: uid,
    };

    // Write to the "students" collection.
    await admin.firestore().collection("students").add(studentData);

    return { success: true, message: "Student enrolled successfully." };
  } catch (error) {
    console.error("Error enrolling student:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
