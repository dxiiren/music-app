<template>
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">Upload</span>
            <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
            <!-- Upload Dropbox -->
            <div class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
                :class="{ ' bg-green-400 border-green-400 border-solid': isDragOver }" @drag.prevent.stop=""
                @dragstart.prevent.stop="" @dragend.prevent.stop="isDragOver = false"
                @dragover.prevent.stop="isDragOver = true" @dragenter.prevent.stop="isDragOver = true"
                @dragleave.prevent.stop="isDragOver = false" @drop.prevent.stop="upload($event)">
                <h5>Drop your files here</h5>
            </div>
            <label class="cursor-pointer inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-4">
                Upload files
                <input type="file" multiple @change="upload($event)" class="hidden" />
            </label>
            <hr class="my-6" />
            <!-- Progess Bars -->
            <div class="mb-4" v-for="(upload) in uploads" :key="upload.name">
                <!-- File Name -->
                <div class="font-bold text-sm" :class="upload.textClass">
                    <i :class="upload.icon"></i>
                    {{ upload.name }}
                </div>
                <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
                    <!-- Inner Progress Bar -->
                    <div class="transition-all progress-bar bg-blue-400" :class="upload.variant"
                        :style="{ width: upload.currentProgress + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from '@/includes/firebase';

export default {
    name: 'AppUpload',
    props: {
        addSong: {
            type: Function,
            required: true,
        },
    },
    data() {
        return {
            isDragOver: false,
            uploads: [],
        };
    },
    beforeUnmount() {
        this.uploads.forEach((upload) => {
            upload.task.cancel();
        });
    },
    methods: {
        upload($event) {
            this.isDragOver = false;

            const files = $event.dataTransfer
                ? [...$event.dataTransfer.files]
                : [...$event.target.files];

            files.forEach((file) => {

                if (file.type !== 'audio/mpeg' && file.type !== 'audio/wav') {
                    alert('Please upload an audio file.');
                    return;
                }

                if(!navigator.onLine) {
                    this.upload.push({
                        task: {},
                        currentProgress: 0,
                        name: file.name,
                        variant: 'bg-red-400',
                        icon: 'fas fa-times',
                        textClass: 'text-red-400'
                    });
                    return;
                }

                const storage = firebase.storage;
                const storageRef = firebase.ref(storage, `songs/${file.name}`);
                const task = firebase.uploadBytesResumable(storageRef, file);

                const uploadIndex = this.uploads.push({
                    task,
                    currentProgress: 0,
                    name: file.name,
                    variant: 'bg-blue-400',
                    icon: 'fas fa-spinner fa-spin',
                    textClass: ''
                }) - 1;

                task.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        this.uploads[uploadIndex].currentProgress = progress;
                    },
                    (error) => {
                        this.uploads[uploadIndex].variant = 'bg-red-400';
                        this.uploads[uploadIndex].icon = 'fas fa-times';
                        this.uploads[uploadIndex].textClass = 'text-red-400';
                        console.error('Upload failed:', error);
                    },
                    async () => {

                        const song = {
                            uid: firebase.auth.currentUser.uid,
                            display_name: firebase.auth.currentUser.displayName,
                            original_name: task.snapshot.ref.name,
                            modified_name: task.snapshot.ref.name,
                            genre: '',
                            comment_count: 0,
                        }

                        song.url = await firebase.getDownloadURL(task.snapshot.ref);

                        let docRef = await firebase.addDoc(firebase.collection(firebase.db, 'songs'), song);

                        this.uploads[uploadIndex].variant = 'bg-green-400';
                        this.uploads[uploadIndex].icon = 'fas fa-check';
                        this.uploads[uploadIndex].textClass = 'text-green-400';

                        this.addSong(docRef.id, song);      
                    }
                );
            });
        },
    },

}
</script>