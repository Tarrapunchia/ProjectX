export default function renderHome() {
    return `
    <!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FT_TRANSCENDENCE</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body class="min-h-screen text-white bg-stars flex items-center justify-center overflow-hidden">
  <div class="relative w-full max-w-5xl mx-auto aspect-[16/9] flex items-center justify-center">

    <!-- Sole -->
    <div class="absolute inset-x-0 -top-16 sm:-top-20 md:-top-24 flex justify-center">
      <div class="w-36 h-36 sm:w-44 sm:h-44 md:w-60 md:h-60 rounded-full
                  bg-gradient-to-b from-pink-500 via-yellow-400 to-yellow-600
                  shadow-[0_0_60px_#ff00ffaa] relative overflow-hidden">
        <div class="absolute inset-0 flex flex-col justify-center gap-2 opacity-80">
          <div class="h-[3px] bg-pink-500/80 mx-6"></div>
          <div class="h-[3px] bg-pink-500/80 mx-8"></div>
          <div class="h-[3px] bg-pink-500/80 mx-10"></div>
        </div>
      </div>
    </div>

    <!-- Montagna -->
    <div class="mountain-wire absolute inset-x-[-10%] top-[10%] h-[65%] opacity-90"></div>

    <!-- Griglia -->
    <div class="grid-80s absolute inset-x-[-20%] -bottom-10 h-[45%] skew-y-12"></div>

    <!-- Contenuto -->
    <main class="relative z-10 text-center px-6">
      <h1 class="neon-title text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-[0.35em]
                 text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#ffd54a] to-[#00fff0] mb-6">
        FT_TRANSCENDENCE
      </h1>
      <p class="max-w-xl mx-auto text-sm md:text-base text-slate-100/85 mb-8">
        A simple game for simple people.
      </p>
      <a href="/#/login">
        <button id="neon-btn" class="btn-neon text-[0.75rem] sm:text-xs md:text-sm">ENTER THE GRID</button>
      </a>
    </main>
  </div>

  <script type="module" src="/dist/dynamic.js"></script>
</body>
</html>

    `;
}
//# sourceMappingURL=index.js.map