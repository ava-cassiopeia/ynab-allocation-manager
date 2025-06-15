import "dotenv/config";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from 'firebase-admin/firestore';

initializeApp();

export const helloWorld = onRequest(async (req, res) => {
  try {
    await getFirestore().collection("allocations").add({test: "test"});

    const snapshot = await getFirestore().collection("allocations").get();
    const allocations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(allocations);
  } catch (error) {
    res.json({error});
  }
});
