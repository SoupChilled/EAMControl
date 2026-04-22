import {initializeApp} from "firebase/app";
import {getDatabase, ref, set, onValue} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// LISTENER
export const listenESP32 = (callback) => {
  const ESP32Ref = ref(db, "/ESP32");
  return onValue(ESP32Ref, (snapshot) => {
    callback(snapshot.val() || []);
  });
};

export const listenLights = (callback) => {
  const lightsRef = ref(db, "/lights");
  return onValue(lightsRef, (snapshot) => {
    callback(snapshot.val() || []);
  });
};

export const listenActuators = (callback) => {
  const actuatorsRef = ref(db, "/actuators");
  return onValue(actuatorsRef, (snapshot) => {
    callback(snapshot.val() || []);
  });
};

// TOGGLE
export const toggleESP32 = async(location, value) => {
  try{
    await set(ref(db, `ESP32/${location}`), value);
    console.log("Valor actualizado a:", value);
  } catch(error){
    console.error("Error al actualizar:", error);
  }
};

export const toggleLight = async(location, value) => {
  try{
    await set(ref(db, `lights/${location}`), value);
    console.log("Valor actualizado a:", value);
  } catch(error){
    console.error("Error al actualizar:", error);
  }
};

export const toggleActuator = async(location, value) => {
  try{
    await set(ref(db, `actuators/${location}`), value);
    console.log("Valor actualizado a:", value);
  } catch(error){
    console.error("Error al actualizar:", error);
  }
};