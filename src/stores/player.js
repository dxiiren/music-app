import { defineStore } from 'pinia'
import { Howl } from 'howler'
import helper from '@/includes/helper.js'

export default defineStore('player', {
    state: () => ({
        currentSong: {},
        sound: {},
        seek: "00:00",
        duration: "00:00",
        playerProgress: "0%",
    }),
    actions: {
        async newSong(song) {

            if(this.sound instanceof Howl) {
                this.sound.stop()
                this.sound.unload()
            }

            this.currentSong = song

            this.sound = new Howl({
                src: [song.url],
                html5: true,
            });

            this.sound.play();

            this.sound.on('play', () => {
                requestAnimationFrame(this.progress.bind(this))
            });
        },

        async toggleAudio() {
            if (!this.sound.playing) {
                return
            }

            if (this.sound.playing()) {
                this.sound.pause()
            }else {
                this.sound.play()
            }
        },
        progress() {
            this.seek = helper.formatTime(this.sound.seek());
            this.duration = helper.formatTime(this.sound.duration());
            this.playerProgress = `${(this.sound.seek() / this.sound.duration()) * 100}%`

            if(this.sound.playing()) {
                requestAnimationFrame(this.progress.bind(this));
            }
        },
        updateSeek(event){

            if (!this.sound.playing) {
                return
            }

            const { x:currentProgress, width } = event.target.getBoundingClientRect();
            const clickedX = event.clientX - currentProgress;
            const percent = clickedX / width;
            const seconds = percent * this.sound.duration();

            this.sound.seek(seconds);
            this.sound.pause()
            this.sound.play();
            this.sound.once('seek', this.progress.bind(this))
        }
    },
    getters: {
        isPlaying: (state) => {
            
            if(state.sound.playing) {
                return state.sound.playing()
            }

            return false
        },
    }
})
