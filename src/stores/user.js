import { defineStore } from 'pinia'
import firebase from '@/includes/firebase'

export default defineStore('user', {
    state: () => ({
        userLoggedIn: false,
    }),
    actions: {
        async logout() {
            await firebase.signOut(firebase.auth)
            this.userLoggedIn = false
        },

        async login(formData) {
            let userCredential = null

            userCredential = await firebase.signInWithEmailAndPassword(
                firebase.auth,
                formData.email,
                formData.password,
            )

            this.userLoggedIn = true

            console.log('User logged in:', userCredential)
        },

        async register(formData) {
            let userCredential = null

            userCredential = await firebase.createUserWithEmailAndPassword(
                firebase.auth,
                formData.email,
                formData.password,
            )

            await firebase.setDoc(firebase.doc(firebase.db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                name: formData.name,
                email: formData.email,
                age: formData.age,
                country: formData.country,
            })

            //update profile
            await firebase.updateProfile(userCredential.user, {
                displayName: formData.name,
            })

            this.userLoggedIn = true

            console.log('User registered:', userCredential)
        },
    },
})
