// Rendered by src/main.js instead of mounting the app when the Firebase
// config is empty (see src/includes/firebase-config.js). Renders the real UI
// shell (header, hero, playlist card with static demo songs) plus a smaller
// dismissible setup notice, so the page shows the actual app instead of only
// a banner card. Markup mirrors AppHeader.vue / HomeView.vue / SongItem.vue —
// keep them visually in sync. The CSS pipeline (Tailwind + main.css) is
// imported unconditionally in main.js, so the app's classes are available.

const demoSongs = [
    { name: 'Sunset Boulevard', artist: 'Demo Artist', comments: 4 },
    { name: 'Midnight Drive', artist: 'The Placeholders', comments: 2 },
    { name: 'Ocean Avenue', artist: 'Sample Sounds', comments: 7 },
    { name: 'City Lights', artist: 'Demo Artist', comments: 1 },
]

export function renderFirebaseNotConfigured(el) {
    if (!el) return

    const songItems = demoSongs
        .map(
            (song) => `
            <li data-demo-song class="flex justify-between items-center p-3 pl-6 transition duration-300 hover:bg-gray-50"
                title="Demo song — configure Firebase to play">
                <div>
                    <span class="font-bold block text-gray-600 song-item">${song.name}</span>
                    <span class="text-gray-500 text-sm">${song.artist}</span>
                </div>
                <div class="text-gray-600 text-lg">
                    <span class="comments">
                        <i class="fa fa-comments text-gray-600"></i>
                        ${song.comments}
                    </span>
                </div>
            </li>`,
        )
        .join('')

    el.innerHTML = `
        <!-- Header (mirrors AppHeader.vue) -->
        <header id="header" class="bg-gray-700">
            <nav class="container mx-auto flex justify-start items-center py-5 px-4">
                <span class="text-white font-bold uppercase text-2xl mr-4">Music</span>
                <div class="flex flex-grow items-center">
                    <ul class="flex flex-row mt-1">
                        <li><a class="px-2 text-white" href="#">About</a></li>
                        <li><a class="px-2 text-white" href="#">Login / Register</a></li>
                    </ul>
                </div>
            </nav>
        </header>

        <!-- Setup notice (dismissible) -->
        <div data-demo-notice class="container mx-auto mt-6 px-4">
            <div class="flex items-start justify-between gap-4 bg-amber-50 border border-amber-300 text-amber-800 rounded px-6 py-4">
                <div>
                    <p class="font-bold mb-1">&#127925; Firebase not configured &mdash; showing a demo playlist</p>
                    <p class="text-sm leading-relaxed">
                        Copy <code class="bg-amber-100 px-1 rounded">.env.example</code> to
                        <code class="bg-amber-100 px-1 rounded">.env</code>, fill the
                        <code class="bg-amber-100 px-1 rounded">VITE_FIREBASE_API_KEY</code> and friends
                        from your Firebase console, then restart the dev server. Details in the
                        README's <strong>Firebase setup</strong> section.
                    </p>
                </div>
                <button type="button" data-demo-dismiss aria-label="Dismiss setup notice"
                    class="text-amber-500 hover:text-amber-700 text-lg leading-none cursor-pointer shrink-0">
                    &#10005;
                </button>
            </div>
        </div>

        <!-- Hero + playlist (mirrors HomeView.vue) -->
        <main>
            <section class="mb-8 py-20 text-white text-center relative">
                <div class="absolute inset-0 w-full h-full bg-contain introduction-bg"
                    style="background-image: url(assets/img/header.png)"></div>
                <div class="container mx-auto">
                    <div class="text-white main-header-content">
                        <h1 class="font-bold text-5xl mb-5">Listen to Great Music!</h1>
                        <p class="w-full md:w-8/12 mx-auto">
                            Browse the playlist, register an account, upload your own tracks and
                            play them through the persistent player bar &mdash; all powered by
                            Firebase once it is configured.
                        </p>
                    </div>
                </div>

                <img class="relative block mx-auto mt-5 -mb-20 w-auto max-w-full"
                    src="/assets/img/introduction-music.png" />
            </section>

            <section class="container mx-auto mb-16">
                <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
                        <span class="card-title">Songs</span>
                        <i class="fa fa-headphones-alt float-right text-yellow-400 text-xl"></i>
                    </div>
                    <ol id="playlist">
                        ${songItems}
                    </ol>
                    <p class="px-6 py-4 text-gray-500 text-sm border-t border-gray-200">
                        Demo playlist &mdash; these sample tracks are not playable until Firebase
                        is configured.
                    </p>
                </div>
            </section>
        </main>
    `

    const dismissBtn = el.querySelector('[data-demo-dismiss]')
    const notice = el.querySelector('[data-demo-notice]')
    if (dismissBtn && notice) {
        dismissBtn.addEventListener('click', () => notice.remove())
    }
}
