import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

let firebaseConfig = {
    apiKey: "AIzaSyAdHEM03pwTUXPKolhXN1wG7DEaIcdNkas",
    authDomain: "sistema-76280.firebaseapp.com",
    projectId: "sistema-76280",
    storageBucket: "sistema-76280.appspot.com",
    messagingSenderId: "732520260305",
    appId: "1:732520260305:web:e7bd7346a8c776ee6d5bf0",
    measurementId: "G-CT7ZZ5RVGR"
  };
  

// se não tiver nenhuma conexão aberta vai executar o if e abrir a conexão
if(!firebase.apps.lenght){
    firebase.initializeApp(firebaseConfig);
}

export default firebase;