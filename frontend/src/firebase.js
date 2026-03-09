// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Настройки твоего проекта Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAQuD8TUGxPGOp_9m-Yw2r8BAn49fGI_os",
  authDomain: "my-student-network-backend.firebaseapp.com",
  projectId: "my-student-network-backend",
  storageBucket: "my-student-network-backend.firebasestorage.app",
  messagingSenderId: "1035111411544",
  appId: "1:1035111411544:web:1935364e324857d0be3f2d",
  measurementId: "G-566SRQZNCS"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт только Storage
export const storage = getStorage(app);
export const auth = getAuth(app);