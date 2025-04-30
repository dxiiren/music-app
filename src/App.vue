<script>
import AppHeader from "./components/AppHeader.vue"
import AppAuth from "./components/AppAuth.vue"
import AppPlayer from "./components/AppPlayer.vue"
import { mapWritableState } from "pinia"
import useUserStore from "@/stores/user"
import firebase from "./includes/firebase"

export default {
    name: 'App',
    computed: {
        ...mapWritableState(useUserStore, ['userLoggedIn']),
    },
    created() {
        if (firebase.auth.currentUser) {
            this.userLoggedIn = true
        } else {
            this.userLoggedIn = false
        }
    },
    components: {
        AppHeader,
        AppAuth,
        AppPlayer,
    },
}
</script>

<template>
    <app-header></app-header>

    <router-view v-slot="{ Component }" mode="out-in">

        <transition name="fade">
            <component :is="Component">
            </component>
        </transition>

    </router-view>

    <app-player></app-player>

    <app-auth> </app-auth>
</template>

<style>
.fade-enter-from {
    opacity: 0;
}

.fade-enter-active {
    transition: all 0.5s ease;
}

.fade-leave-to {
    transition: all 0.5s ease;
    opacity: 0;
}

</style>
