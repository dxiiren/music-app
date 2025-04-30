<template>
    <main>
        <!-- Music Header -->
        <section v-if="song" class="w-full mb-8 py-14 text-center text-white relative">
            <div class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
                style="background-image: url(/assets/img/song-header.png)"></div>
            <div class="container mx-auto flex items-center">
                <!-- Play/Pause Button -->
                <button type="button" id="play-btn"
                    class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none cursor-pointer"
                    @click.prevent="newSong(song)">
                    <i class="fa" :class="{ 'fa-play': !isPlaying, 'fa-pause': isPlaying }">
                    </i>
                </button>
                <div class="z-50 text-left ml-8">
                    <!-- Song Info -->
                    <div class="text-3xl font-bold">
                        {{ song.modified_name ? song.modified_name : 'unknown name' }}
                    </div>
                    <div>{{ song.genre ? song.genre : 'unknown genre' }}</div>
                    <div class="song-price"> {{ $n(1, "currency") }}</div>
                </div>
            </div>
        </section>

        <!-- Form -->
        <section v-if="song" class="container mx-auto mt-6" id="comments">
            <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
                    <!-- Comment Count -->
                    <!-- <span class="card-title">{{ 'Comments (' + totalComments + ')' }}</span> -->
                    <span class="card-title">
                        {{ $tc("song.comment_count", totalComments, { count: totalComments }) }}
                    </span>
                    <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
                </div>
                <div class="p-6">
                    <div class="text-white text-center font-bold p-4 rounded mb-4" v-if="store_show_alert"
                        :class="store_alert_variant">
                        <i class="fas fa-info-circle"></i> {{ store_alert_message }}
                    </div>

                    <vee-form @submit="createComment" :validation-schema="schema" :initial-values="initialValues"
                        ref="commentForm" @input="unsavedForms = true" v-slot="{ errors }" v-if="userLoggedIn">
                        <vee-field as="textarea" name="comment" placeholder="Your comment here..."
                            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4" />

                        <div class="text-red-600 mb-4" v-for="error in errors" :key="error">
                            {{ error }}
                        </div>

                        <button type="submit" class="py-1.5 px-3 rounded text-white bg-green-600 block cursor-pointer"
                            :disabled="store_in_submission">
                            Submit
                        </button>
                    </vee-form>

                    <!-- Sort Comments -->
                    <select
                        class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        v-model="sortWay">
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
            </div>
        </section>

        <!-- Comments -->
        <ul class="container mx-auto">
            <li class="p-6 bg-gray-50 border border-gray-200" v-for="comment in sortedComments" :key="comment.id">
                <!-- Comment Author -->
                <div class="mb-5">
                    <div class="font-bold">{{ comment.name }}</div>
                    <time>{{ comment.date }}</time>
                </div>

                <p>
                    {{ comment.content }}
                </p>
            </li>
        </ul>
    </main>
</template>

<script>
import firebase from '@/includes/firebase'
import { mapState, mapActions } from 'pinia'
import useUserStore from '@/stores/user'
import usePlayerStore from '@/stores/player'

export default {
    name: 'SongView',
    data() {
        return {
            song: {},
            sortWay: 'latest', // oldest or latest
            comments: [],
            initialValues: {
                comment: '',
            },
            schema: {
                comment: {
                    required: true,
                    min: 3,
                    max: 500,
                },
            },
            unsavedForms: false,
            store_in_submission: false,
            store_show_alert: false,
            store_alert_variant: 'bg-blue-500',
            store_alert_message: 'Please wait! Saving comment',
        }
    },
    // async created() {

    //     const { sort } = this.$route.query

    //     if (sort || sort === 'latest' || sort === 'oldest') {
    //         this.sortWay = sort
    //     }

    //     this.fetchSongDetails()
    //     this.fetchComments()
    // },
    async beforeRouteEnter(to, from, next) {
        next((vm) => {
            const { sort } = vm.$route.query

            if (sort || sort === 'latest' || sort === 'oldest') {
                vm.sortWay = sort
            }

            vm.fetchSongDetails(to)
            vm.fetchComments(to)
        })
    },
    watch: {
        sortWay(newValue) {
            if (newValue === this.$route.query?.sortWay) {
                return
            }

            this.$router.push({ query: { sortWay: newValue } })
        },
    },
    beforeRouteLeave(to, from, next) {
        if (this.unsavedForms) {
            const answer = confirm('You have unsaved changes. Do you really want to leave?')
            next(answer)
        } else {
            next()
        }
    },
    computed: {
        ...mapState(useUserStore, ['userLoggedIn']),
        ...mapState(usePlayerStore, ['isPlaying']),
        totalComments() {
            return this.comments.length
        },
        sortedComments() {
            return [...this.comments].sort((a, b) => {
                if (this.sortWay === 'latest') {
                    return new Date(b.date) - new Date(a.date)
                } else {
                    return new Date(a.date) - new Date(b.date)
                }
            })
        },
    },
    methods: {
        ...mapActions(usePlayerStore, ['newSong']),
        async createComment(value, { resetForm }) {
            this.store_in_submission = true
            this.store_show_alert = true
            this.store_alert_variant = 'bg-blue-500'
            this.store_alert_message = 'Please wait! Saving comment'

            try {
                const comment = {
                    uid: firebase.auth.currentUser.uid,
                    name: firebase.auth.currentUser.displayName,
                    sid: this.song.id,
                    content: value.comment,
                    date: new Date().toISOString(),
                }

                //store comment in firebase
                let docRef = await firebase.addDoc(
                    firebase.collection(firebase.db, 'comments'),
                    comment,
                )

                this.comments.push({
                    id: docRef.id,
                    ...comment,
                })

                //update comment count in song
                this.song.comment_count = this.totalComments
                const songRef = firebase.doc(firebase.db, 'songs', this.$route.params.id)
                await firebase.updateDoc(songRef, {
                    comment_count: this.song.comment_count,
                })

            } catch (error) {
                this.store_in_submission = false
                this.store_alert_variant = 'bg-red-500'
                this.store_alert_message = 'An unexpected error occurred. Please try again later.'
                console.error('Error saving comment:', error)
                return
            }

            this.store_show_alert = true
            this.store_alert_variant = 'bg-green-500'
            this.store_alert_message = 'comment saved successfully!'
            this.unsavedForms = false
            this.store_in_submission = false
            this.sortWay = 'latest'

            resetForm()
        },
        async fetchSongDetails(to) {
            const songRef = firebase.doc(firebase.db, 'songs', to.params.id)
            const songSnap = await firebase.getDoc(songRef)

            if (!songSnap.exists()) {
                console.log('No matching song found.')
                this.$router.push({ name: 'home' })
            }

            this.song = {
                id: songSnap.id,
                ...songSnap.data(),
            }
        },
        async fetchComments(to) {
            const commentsRef = firebase.collection(firebase.db, 'comments')
            const commentQuery = firebase.query(
                commentsRef,
                firebase.where('sid', '==', to.params.id),
            )

            const querySnapshot = await firebase.getDocs(commentQuery)

            querySnapshot.forEach((doc) => {
                this.comments.push({
                    id: doc.id,
                    ...doc.data(),
                })
            })
        },
    },
}
</script>
