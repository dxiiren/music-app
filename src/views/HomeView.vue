<template>
    <main>
        <!-- Introduction -->
        <section class="mb-8 py-20 text-white text-center relative">
            <div class="absolute inset-0 w-full h-full bg-contain introduction-bg"
                style="background-image: url(assets/img/header.png)"></div>
            <div class="container mx-auto">
                <div class="text-white main-header-content">
                    <h1 class="font-bold text-5xl mb-5">{{  $t("home.listen") }}</h1>
                    <p class="w-full md:w-8/12 mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus et dolor
                        mollis, congue augue non, venenatis elit. Nunc justo eros, suscipit ac aliquet
                        imperdiet, venenatis et sapien. Duis sed magna pulvinar, fringilla lorem eget,
                        ullamcorper urna.
                    </p>
                </div>
            </div>

            <img class="relative block mx-auto mt-5 -mb-20 w-auto max-w-full"
                src="/assets/img/introduction-music.png" />
        </section>

        <!-- Main Content -->
        <section class="container mx-auto">
            <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200" 
                    v-icon.right.yellow="'headphones-alt'"
                    >
                    <span class="card-title">Songs</span>
                    <!-- Icon -->
                    <!-- <i class="fa fa-headphones-alt float-right text-green-400 text-xl"></i> -->

                </div>
                <!-- Playlist -->
                <ol id="playlist">
                    <song-item v-for="(song, idx) in songs" :key="song.id" :song="song" :index="idx" />
                </ol>
                <!-- .. end Playlist -->
            </div>
        </section>
    </main>
</template>

<script>
import firebase from '@/includes/firebase'
import SongItem from '@/components/SongItem.vue'

export default {
    name: 'HomeView',
    components: {
        SongItem,
    },
    data() {
        return {
            songs: [],
            lastDoc: null,
            noMoreSongs: false,
            perPage: 7,
            pendingRequest: false,
        }
    },
    created() {
        this.loadSongs()
        window.addEventListener('scroll', this.handleScroll)
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
        handleScroll() {
            const { scrollTop, offsetHeight } = document.documentElement
            const { innerHeight } = window
            const bottomOfPage = Math.round(scrollTop + innerHeight) === Math.round(offsetHeight)

            if (bottomOfPage) {
                this.loadSongs()
            }
        },
        async loadSongs() {

            if (this.pendingRequest || this.noMoreSongs)
                return

            this.pendingRequest = true

            try {
                const songsQuery = this.baseQuery();
                const querySnapshot = await firebase.getDocs(songsQuery)

                querySnapshot.forEach((doc) => {
                    this.songs.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })

                this.pendingRequest = false

                if (!querySnapshot.empty) {
                    this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
                }

                if (querySnapshot.size < this.perPage) {
                    this.noMoreSongs = true
                }
            } catch (error) {
                console.error('Failed to load songs:', error)
            }
        },
        baseQuery() {
            return this.lastDoc ? this.getNextPage() : this.getFirstPage()
        },
        getFirstPage() {
            return firebase.query(
                firebase.collection(firebase.db, 'songs'),
                firebase.orderBy('modified_name'),
                firebase.limit(this.perPage),
            )
        },
        getNextPage() {
            return firebase.query(
                firebase.collection(firebase.db, 'songs'),
                firebase.orderBy('modified_name'),
                firebase.startAfter(this.lastDoc),
                firebase.limit(this.perPage),
            )
        },
    },
}
</script>
