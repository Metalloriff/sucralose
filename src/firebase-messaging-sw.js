// @ts-nocheck

importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

const config = {
	apiKey: "AIzaSyDmojC5Kl5vtST4vIyW81UfCrR6B18HnKw",
	authDomain: "sucralose-74a13.firebaseapp.com",
	projectId: "sucralose-74a13",
	storageBucket: "sucralose-74a13.appspot.com",
	messagingSenderId: "43887129209",
	appId: "1:43887129209:web:7d607e00a979144af85aa8"
};

firebase.initializeApp(config);
firebase.messaging();