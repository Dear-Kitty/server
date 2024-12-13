import admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

admin.initializeApp({
  credential: applicationDefault(),
});

export default admin;
export const db = getFirestore();
