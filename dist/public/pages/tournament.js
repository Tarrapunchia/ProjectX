export default function renderTournament() {
    return `
    <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tournament — FT_TRANSCENDENCE</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body class="min-h-screen text-white bg-stars overflow-auto">
  <!-- Navbar -->
  <header class="sticky top-0 z-50 bg-neon-violet backdrop-blur">
    <nav class="mx-auto max-w-6xl px-4 h-14 flex items-center">
      <span class="font-extrabold tracking-[0.3em] uppercase text-sm text-transparent bg-clip-text
                   bg-gradient-to-r from-[#ff00ff] via-[#ffd54a] to-[#00fff0]">
        FT_TRANSCENDENCE
      </span>
      <span class="ml-auto text-xs opacity-75">Tournament</span>
    </nav>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-6 space-y-4">
    <!-- Controls -->
    <section class="card-neon">
      <form id="controls" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-widest text-white/60 mb-1">Number of Players</label>
          <input id="players-count" class="input-neon" type="number" min="2" step="1" value="32">
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs uppercase tracking-widest text-white/60 mb-1">Names</label>
          <input id="players-names" class="input-neon" placeholder="P1,P2,P3,P4,P5,P6,P7,P8">
        </div>
        <div class="md:col-span-2">
          <button id="btn-draw" type="button" class="btn-neon btn-neon--compact">Create</button>
        </div>
      </form>
    </section>

    <!-- Canvas wrapper -->
    <!-- <section class="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-3
                    overflow-auto">
    <canvas id="bracket-canvas" class="block"></canvas>
    </section> -->
    <section class="rounded-2xl border border-white/10 bg-black/40 backdrop-blur overflow-auto ">
    <!-- padding SOLO qui, fuori dallo scroll -->
    <div class="p-3">
    <!-- area scrollabile, SENZA padding -->
    <div class="">
        <!-- inline-block evita che il canvas si allarghi a 100% -->
        <div class="inline-block">
        <canvas id="bracket-canvas" class="block"></canvas>
        </div>
    </div>
    </div>
</section>
  </main>

  <script type="module" src="/dist/bracket-canvas.js"></script>
</body>
    `;
}
//# sourceMappingURL=tournament.js.map