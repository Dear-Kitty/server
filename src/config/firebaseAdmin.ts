import firebase from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const admin = firebase.initializeApp({
  credential: applicationDefault(),
});

export const db = getFirestore();
