import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const addTestDocument = async () => {
  try {
    const docRef = await addDoc(collection(db, "testCollection"), {
      name: "Test Document",
      timestamp: new Date(),
    });
    console.log("Document written with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
};

export default addTestDocument;
