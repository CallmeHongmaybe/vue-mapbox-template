import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeApp } from 'firebase/app'
import {
    browserLocalPersistence,
    getAuth,
    setPersistence
} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { createStore } from 'vuex'


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// utils
// const db = firebase.firestore()
let auth = getAuth()

let store = createStore({
    state: {
        isLoggedIn: false,
        user: null,
        db: null
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setIsLoggedIn(state, value) {
            state.isLoggedIn = value
        },
        setDb(state, db) {
            state.db = db
        }
    },
    actions: {
        login({ commit }, user) {
            // Here you can call your API to login the user
            // and then commit the mutation
            commit('setUser', user)
            commit('setIsLoggedIn', true)
            commit('setDb', db)
        },
        logout({ commit }) {
            // Here you can call your API to logout the user
            // and then commit the mutation
            commit('setUser', null)
            commit('setIsLoggedIn', false)
            commit('setDb', null)
        },
    },
})

setPersistence(auth, browserLocalPersistence)

auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in. You can fetch and commit user data to your Vuex store here.
        // console.log('user', user.email.split("@")[0])
        store.dispatch('login', user)

        // Proceed with routing to dashboard or a protected route
    } else {
        // No user is logged in. You can redirect to login page here.
        store.dispatch('logout')
    }
});


const app = createApp(App);
// const auth = getAuth(app);

// setPersistence(auth, browserLocalPersistence)

app.use(router)
app.use(store)
app.mount('#app')
