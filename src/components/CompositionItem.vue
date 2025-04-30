<template>
    <div class="border border-gray-200 p-3 mb-4 rounded">
        <div
            class="text-white text-center font-bold p-4 rounded mb-4"
            v-if="delete_show_alert"
            :class="delete_alert_variant"
        >
            <i class="fas fa-info-circle"></i> {{ delete_alert_message }}
        </div>

        <div v-show="!showForm">
            <!-- delete -->
            <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
            <button
                class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right cursor-pointer"
                @click.prevent="deleteSong"
                :disabled="delete_in_submission"
            >
                <i class="fa fa-times"></i>
            </button>
            <!-- edit  -->
            <button
                class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right cursor-pointer"
                @click.prevent="showForm = !showForm"
            >
                <i class="fa fa-pencil-alt"></i>
            </button>
        </div>

        <div v-show="showForm">
            <div
                class="text-white text-center font-bold p-4 rounded mb-4"
                v-if="update_show_alert"
                :class="update_alert_variant"
            >
                <i class="fas fa-info-circle"></i> {{ update_alert_message }}
            </div>

            <vee-form
                :validation-schema="schema"
                @submit="update"
                :initial-values="song"
                ref="editSongForm"
            >
                <div class="mb-3">
                    <label class="inline-block mb-2">Song Title</label>
                    <vee-field
                        name="modified_name"
                        type="text"
                        placeholder="Enter Song Title"
                        :bails="false"
                        v-slot="{ field, errors }"
                        @input="updateUnsavedChangeFlag(true)"
                    >
                        <input
                            type="text"
                            v-bind="field"
                            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        />
                        <div class="text-red-600" v-for="error in errors" :key="error">
                            {{ error }}
                        </div>
                    </vee-field>
                </div>
                <div class="mb-3">
                    <label class="inline-block mb-2">Song Genre</label>
                    <vee-field
                        name="genre"
                        type="text"
                        placeholder="Enter Genre"
                        :bails="false"
                        v-slot="{ field, errors }"
                        @input="updateUnsavedChangeFlag(true)"
                    >
                        <input
                            type="text"
                            v-bind="field"
                            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        />
                        <div class="text-red-600" v-for="error in errors" :key="error">
                            {{ error }}
                        </div>
                    </vee-field>
                </div>
                <button
                    type="submit"
                    class="py-1.5 px-3 rounded text-white bg-green-600 m-2 cursor-pointer"
                    :disabled="update_in_submission"
                >
                    Submit
                </button>
                <button
                    type="button"
                    class="py-1.5 px-3 rounded text-white bg-gray-600 cursor-pointer"
                    @click.prevent="showForm = !showForm"
                >
                    Go Back
                </button>
            </vee-form>
        </div>
    </div>
</template>

<script>
import firebase from '@/includes/firebase'

export default {
    name: 'CompositionItem',
    props: {
        song: {
            type: Object,
            required: true,
        },
        updateSong: {
            type: Function,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        removeSong: {
            type: Function,
            required: true,
        },
        updateUnsavedChangeFlag: {
            type: Function,
            required: true,
        },
    },
    data() {
        return {
            showForm: false,
            schema: {
                modified_name: {
                    required: true,
                    min: 3,
                    max: 50,
                },
                genre: {
                    required: true,
                    min: 3,
                    max: 50,
                    alpha_spaces: true,
                },
            },
            update_in_submission: false,
            update_show_alert: false,
            update_alert_variant: 'bg-blue-500',
            update_alert_message: 'Please wait! Updating song information.',

            delete_in_submission: false,
            delete_show_alert: false,
            delete_alert_variant: 'bg-blue-500',
            delete_alert_message: 'Please wait! Deleting song.',
        }
    },
    methods: {
        async deleteSong() {

            let result = confirm('Are you sure you want to delete this song? This action cannot be undone.')
            if (!result) {
                return
            }

            this.delete_in_submission = true
            this.delete_show_alert = true
            this.delete_alert_variant = 'bg-blue-500'
            this.delete_alert_message = 'Please wait! Deleting song.'

            try {
                const songRef = firebase.doc(firebase.db, 'songs', this.song.id)
                await firebase.deleteDoc(songRef)

                const storage = firebase.storage;
                const storageRef = firebase.ref(storage, `songs/${this.song.original_name}`);
                await firebase.deleteObject(storageRef);

            } catch (error) {
                this.delete_in_submission = false
                this.delete_alert_variant = 'bg-red-500'
                this.delete_alert_message = 'An unexpected error occurred. Please try again later.'
                console.error('Error deleting song:', error)
                return
            }

            this.delete_show_alert = true
            this.delete_alert_variant = 'bg-green-500'
            this.delete_alert_message = 'Song deleted successfully!'
            this.removeSong(this.index)
        },
        async update(values) {
            this.update_in_submission = true
            this.update_show_alert = true
            this.update_alert_variant = 'bg-blue-500'
            this.update_alert_message = 'Please wait! Updating song information.'

            try {
                const songRef = firebase.doc(firebase.db, 'songs', this.song.id)

                await firebase.updateDoc(songRef, {
                    modified_name: values.modified_name,
                    genre: values.genre,
                })
            } catch (error) {
                this.update_in_submission = false
                this.update_alert_variant = 'bg-red-500'
                this.update_alert_message = 'An unexpected error occurred. Please try again later.'
                console.error('Error updating song:', error)
                return
            }

            this.update_show_alert = true
            this.update_alert_variant = 'bg-green-500'
            this.update_alert_message = 'Song updated successfully!'
            this.updateSong(this.index, values)
            this.updateUnsavedChangeFlag(false)
        },
    },
}
</script>
