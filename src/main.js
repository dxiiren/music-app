import './assets/base.css'
import './assets/main.css'
import 'nprogress/nprogress.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VeeValidationPlugin from './includes/validation'
import firebase from './includes/firebase'
import Icon from './directives/icon'
import i186 from './includes/i18n'
import { registerSW } from 'virtual:pwa-register'
import GlobalComponents from './includes/_global'
import progressBar from './includes/progress-bar'

registerSW({ immediate: true });
progressBar(router);

let app;

firebase.onAuthStateChanged(firebase.auth, () => {
    if (!app) {
        app = createApp(App);

        app.use(createPinia());
        app.use(router);
        app.use(i186);
        app.use(VeeValidationPlugin);
        app.use(GlobalComponents);
        app.directive('icon', Icon);

        app.mount('#app');
    }
});
