import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const CODE_COLLECTION = "codes";


export const saveCode = async (html, css, js) => {
    try {
        await addDoc(collection(db, CODE_COLLECTION), {
          html,
          css,
          js,
          createdAt: new Date(),
        });
            console.log("Code saved successfully!");
      } catch (e) {
            console.error("Error saving code: ", e);
    }
};

export const getAllCodes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, CODE_COLLECTION));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error("Error fetching codes: ", e);
            return [];
      }
};

