import { defineStore } from 'pinia'
import { Howl } from 'howler'
import helper from '@/includes/helper.js'

// `sound` starts life as a plain `{}`, so every access has to check that a Howl
// is actually loaded. Testing `sound.playing` alone is not enough — that is a
// method reference, truthy for any Howl regardless of playback state.
const isLoaded = (sound) => typeof sound?.playing === 'function'

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
            // The initial state is a bare `{}` — bail out until a Howl is loaded.
            if (!isLoaded(this.sound)) {
                return
            }

            if (this.sound.playing()) {
                this.sound.pause()
            }else {
                this.sound.play()
            }
        },
        progress() {
            if (!isLoaded(this.sound)) {
                return
            }

            const seek = this.sound.seek();
            const duration = this.sound.duration();

            this.seek = helper.formatTime(seek);
            this.duration = helper.formatTime(duration);
            // Howl.duration() is 0 until the track's metadata has loaded —
            // dividing by it would paint the bar `NaN%` wide.
            this.playerProgress = duration ? `${(seek / duration) * 100}%` : '0%'

            if(this.sound.playing()) {
                requestAnimationFrame(this.progress.bind(this));
            }
        },
        updateSeek(event){

            if (!isLoaded(this.sound)) {
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

            if(isLoaded(state.sound)) {
                return state.sound.playing()
            }

            return false
        },
    }
})
