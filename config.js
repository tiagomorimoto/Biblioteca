import firebase from "firebase";
const firebaseConfig = {
    apiKey: "AIzaSyDx684HGb_UmxLojB4vE4-KLlT4T3zJi_4",
    authDomain: "biblioteca-6dde6.firebaseapp.com",
    projectId: "biblioteca-6dde6",
    storageBucket: "biblioteca-6dde6.appspot.com",
    messagingSenderId: "278264019867",
    appId: "1:278264019867:web:949b9aa9605eccc454ff3e"
  };
  firebase.initializeApp(firebaseConfig) 
  export default firebase.firestore()