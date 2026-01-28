export default function renderPublicProfile() {
    return `
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Profile — FT_TRANSCENDENCE</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body class="min-h-screen text-white bg-stars">

    <!-- NAVBAR -->
    <header class="sticky top-0 z-50 bg-neon-violet backdrop-blur">
    <nav class="mx-auto max-w-6xl px-4 h-14 flex items-center">
        <!-- brand a sinistra -->
        <a href="/#"
        class="font-extrabold tracking-[0.3em] uppercase text-sm
                text-transparent bg-clip-text
                bg-gradient-to-r from-[#ff00ff] via-[#ffd54a] to-[#00fff0]">
        FT_TRANSCENDENCE
        </a>

        <!-- hamburger spinto completamente a destra -->
        <button id="nav-toggle"
        class="ml-auto h-10 w-10 grid place-items-center rounded-md border violet-outline hover:border-white/60">
        <span class="sr-only">Apri menu</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        </button>

        <!-- dropdown ancorato a destra -->
        <div id="nav-menu"
            class="hidden absolute right-4 top-14 w-48 rounded-lg border border-white/15
                    bg-black/80 backdrop-blur p-2 shadow-[0_0_20px_#7a00ff88]">
        <a class="block px-3 py-2 rounded hover:bg-white/10" href="#">Dashboard</a>
        <a class="block px-3 py-2 rounded hover:bg-white/10" href="#">Impostazioni</a>
        <a class="block px-3 py-2 rounded hover:bg-white/10" href="#">Logout</a>
        </div>
    </nav>
    </header>

    <!-- WRAPPER -->
    <main class="mx-auto max-w-6xl px-4 pt-8 pb-16 items-center justify-center">
        <!-- Testata profilo -->
        <section class="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur overflow-hidden">
        <!-- sfondo scenografico -->
        <div class="absolute inset-0 grid-80s opacity-30"></div>
        <div class="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">

            <!-- Avatar -->
            <div class="relative">
            <div class="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden
                        ring-2 ring-[#ff00ffaa] shadow-[0_0_40px_#ff00ff66]">
                <!-- placeholder immagine -->
                <img src="https://picsum.photos/300?grayscale" alt="Avatar"
                    class="w-full h-full object-cover">
            </div>
            <!-- alone neon -->
            <div class="pointer-events-none absolute inset-0 blur-2xl rounded-full
                        bg-[radial-gradient(circle,#ff00ff55,transparent_60%)]"></div>
            </div>

            <!-- Dati base -->
            <div class="text-center md:text-left">
            <h1 class="neon-title text-3xl md:text-4xl font-extrabold uppercase tracking-[0.25em]
                        text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#ffd54a] to-[#00fff0]">
                NICKNAME_PLACEHOLDER_PUBLIC
            </h1>
            <p class="mt-2 text-white/80 text-sm">
                Bio: testo descrittivo del giocatore, magari ci mettiamo un grado a seconda dell'ELO??.
            </p>

            <div class="mt-4 flex items-center justify-center md:justify-start gap-3">
                <button class="btn-neon text-xs">Challenge</button>
                <button class="btn-neon text-xs">Send Message</button>
            </div>
            </div>
        </div>
        </section>

        <!-- Statistiche -->
        <section class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Partite giocate -->
        <div class="rounded-xl border border-white/10 bg-black/40 p-5
                    shadow-[0_0_24px_#00fff033]">
            <div class="text-xs uppercase tracking-widest text-white/60">Games Played</div>
            <div class="mt-2 text-4xl font-extrabold">123</div>
        </div>
        <!-- Vinte -->
        <div class="rounded-xl border border-white/10 bg-black/40 p-5
                    shadow-[0_0_24px_#00ffb833]">
            <div class="text-xs uppercase tracking-widest text-white/60">Games Won</div>
            <div class="mt-2 text-4xl font-extrabold text-[#00ffea]">89</div>
        </div>
        <!-- Perse -->
        <div class="rounded-xl border border-white/10 bg-black/40 p-5
                    shadow-[0_0_24px_#ff00ff33]">
            <div class="text-xs uppercase tracking-widest text-white/60">Games Lost</div>
            <div class="mt-2 text-4xl font-extrabold text-[#ff61ff]">34</div>
        </div>
        </section>

        <!-- Cronologia partite (placeholder) -->
        <section class="mt-10 rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
        <header class="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10">
            <h2 class="uppercase tracking-[0.25em] text-sm text-white/80">Game History</h2>
            <!-- controls -->
            <div class="flex items-center gap-3 text-xs">
            <span id="games-range" class="text-white/60">1–3 of 3</span>
            <div class="flex items-center gap-2">
                <button id="games-prev"
                        class="h-8 px-3 rounded-md border border-white/15 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent">
                Prev
                </button>
                <button id="games-next"
                        class="h-8 px-3 rounded-md border border-white/15 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent">
                Next
                </button>
            </div>
            </div>
        </header>

        <ul class="divide-y divide-white/10">
            <!-- riga -->
            <li class="px-4 md:px-6 py-4 flex items-center gap-4">
            <div class="flex-1">
                <div class="text-sm">
                vs <span class="font-semibold"><a href="/#/publicprofile">PLAYER_001</a></span>
                <span class="mx-2 text-white/30">•</span>
                <span class="text-white/60">01/10/2025 21:04</span>
                </div>
                <div class="text-xs text-white/60">Map: PLACEHOLDER — Modalità: RANKED</div>
            </div>
            <div>
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold
                            bg-[#00ffe64d] border border-[#00ffe6a8] text-[#00ffe6]">WIN</span>
            </div>
            <div class="w-16 text-right font-semibold">2 - 0</div>
            </li>

            <!-- altre righe di esempio -->
            <li class="px-4 md:px-6 py-4 flex items-center gap-4">
            <div class="flex-1">
                <div class="text-sm">
                vs <span class="font-semibold"><a href="/#/publicprofile">PLAYER_002</a></span>
                <span class="mx-2 text-white/30">•</span>
                <span class="text-white/60">28/09/2025 18:12</span>
                </div>
                <div class="text-xs text-white/60">Map: PLACEHOLDER — Modalità: CASUAL</div>
            </div>
            <div>
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold
                            bg-[#ff00ff33] border border-[#ff00ffa8] text-[#ff86ff]">LOSE</span>
            </div>
            <div class="w-16 text-right font-semibold">1 - 2</div>
            </li>

            <li class="px-4 md:px-6 py-4 flex items-center gap-4">
            <div class="flex-1">
                <div class="text-sm">
                vs <span class="font-semibold"><a href="/#/publicprofile">PLAYER_003</a></span>
                <span class="mx-2 text-white/30">•</span>
                <span class="text-white/60">25/09/2025 22:40</span>
                </div>
                <div class="text-xs text-white/60">Map: PLACEHOLDER — Modalità: RANKED</div>
            </div>
            <div>
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold
                            bg-[#00ffe64d] border border-[#00ffe6a8] text-[#00ffe6]">WIN</span>
            </div>
            <div class="w-16 text-right font-semibold">2 - 1</div>
            </li>

            <!-- questa lista la riempiamo con una chiamata al db -->
        </ul>
        </section>
    </main>
    </body>
    <!-- per le funzioni aggiuntive e le chiamate al backend -> db -->
        <script type="module" src="/dist/dynamic.js"></script>
    `;
}
//# sourceMappingURL=publicProfile.js.map