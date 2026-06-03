import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyC8jj4fIKwRwZMTGYA3XUZY5H_LGP-RZ5c',
  authDomain: 't3lola-64ba8.firebaseapp.com',
  projectId: 't3lola-64ba8',
  storageBucket: 't3lola-64ba8.firebasestorage.app',
  messagingSenderId: '214219539984',
  appId: '1:214219539984:web:9f2cbd516786fcd38aac95',
  measurementId: 'G-K1HL0YHLQ6',
  databaseURL: 'https://t3lola-64ba8-default-rtdb.firebaseio.com'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
