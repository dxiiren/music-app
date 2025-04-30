import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'
// import ManageView from '../views/ManageView.vue'
// import SongView from '../views/SongView.vue'
import useUserStore from '@/stores/user.js'

const routes = [
    {
        path: '/',
        name: 'home',
        // component: HomeView,
        component: () => import('../views/HomeView.vue'),
    },
    {
        path: '/about',
        name: 'about',
        // component: AboutView,
        component: () => import('../views/AboutView.vue'),
    },
    {
        path: '/manage',
        name: 'manage',
        // component: ManageView,
        component: () => import('../views/ManageView.vue'),
        meta: { requiresAuth: true },
    },
    {
        name: 'song',
        path: '/song/:id',
        // component: SongView,
        component: () => import('../views/SongView.vue'),
    },
    {
        path: '/:catchAll(.*)*',
        redirect: { name: 'home' },
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    linkActiveClass: 'text-yellow-500',
})

router.beforeEach((to, from, next) => {
    if (!to.meta.requiresAuth) {
        next()
        return
    }

    const userStore = useUserStore()

    if (userStore.userLoggedIn) {
        next()
    } else {
        next({
            name: 'home',
        })
    }
})

export default router
