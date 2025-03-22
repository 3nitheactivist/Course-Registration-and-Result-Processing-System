const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.enrollStudent = functions.https.onCall(async (data, context) => {
  // Verify that the request is from an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can enroll students.'
    );
  }

  const { name, email, matricNumber, department, courses } = data;

  // Validate required fields
  if (!name || !email || !matricNumber || !department) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields.'
    );
  }

  try {
    // Create Firebase Auth user with default password
    const defaultPassword = "student123";
    const userRecord = await admin.auth().createUser({
      email,
      password: defaultPassword,
      displayName: name,
    });

    // Add custom claims to identify user as student
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      student: true
    });

    // Create user document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email,
      matricNumber,
      role: 'student',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create student document
    await admin.firestore().collection('students').add({
      name,
      matricNumber,
      email,
      department,
      courses: courses || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      enrolledBy: context.auth.uid, // ID of admin who enrolled the student
      authUserId: userRecord.uid,
    });

    return { success: true, message: 'Student enrolled successfully' };
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});