export default {
    formatTime: function (seconds) {
        let minutes = Math.floor(seconds / 60) || 0;
        seconds = Math.round( seconds - minutes * 60 ) || 0;
        return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
    },
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    getRandomArray: function (array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}