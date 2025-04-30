<template>
    <!-- Main Content -->
    <main>
        <section class="container mx-auto mt-6">
            <div class="md:grid md:grid-cols-3 md:gap-4">
                <div class="col-span-1">
                    <app-upload :addSong="addSong"></app-upload>
                </div>
                <div class="col-span-2">
                    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
                            <span class="card-title">My Songs</span>
                            <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
                        </div>
                        <div class="p-6">
                            <!-- Composition Items -->
                            <composition-item v-for="(song, idx) in songs" :key="song.id" :song="song"
                                :updateSong="updateSong" :removeSong="removeSong"
                                :updateUnsavedChangeFlag="updateUnsavedChangeFlag" :index="idx">

                            </composition-item>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import AppUpload from '@/components/Upload.vue';
import firebase from '@/includes/firebase';
import CompositionItem from '@/components/CompositionItem.vue';

export default {
    name: 'ManageView',
    components: {
        AppUpload, CompositionItem
    },
    data() {
        return {
            songs: [],
            unsavedForms: false
        };
    },
    created() {
        this.loadSongs();
    },
    beforeRouteLeave(to, from, next) {
        if (this.unsavedForms) {
            const answer = confirm('You have unsaved changes. Do you really want to leave?');
            next(answer);
        } else {
            next();
        }
    },
    methods: {
        addSong(docId, songData) {
            const song = {
                ...songData,
                id: docId,
            }

            this.songs.push(song);
        },
        updateSong(index, values) {
            this.songs[index].modified_name = values.modified_name;
            this.songs[index].genre = values.genre;
        },
        removeSong(index) {
            this.songs.splice(index, 1);
        },
        loadSongs() {
            const songsRef = firebase.collection(firebase.db, 'songs');
            const songsQuery = firebase.query(
                songsRef,
                firebase.where('uid', '==', firebase.auth.currentUser.uid)
            );

            firebase.getDocs(songsQuery).then((querySnapshot) => {
                this.songs = [];
                querySnapshot.forEach((doc) => {
                    this.songs.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });
            });
        },
        updateUnsavedChangeFlag() {
            this.unsavedForms = true;
        },
    }
}
</script>