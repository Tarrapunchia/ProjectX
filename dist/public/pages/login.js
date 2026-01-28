export default function renderLogin() {
    return `
    <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login — FT_TRANSCENDENCE</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body class="min-h-screen text-white bg-stars">
  <!-- Navbar viola neon con hamburger a destra -->
  <header class="sticky top-0 z-50 bg-neon-violet backdrop-blur">
    <nav class="mx-auto max-w-6xl px-4 h-14 flex items-center">
      <a href="/#"
         class="font-extrabold tracking-[0.3em] uppercase text-sm
                text-transparent bg-clip-text
                bg-gradient-to-r from-[#ff00ff] via-[#ffd54a] to-[#00fff0]">
        FT_TRANSCENDENCE
      </a>
      <button id="nav-toggle"
        class="ml-auto h-10 w-10 grid place-items-center rounded-md border violet-outline hover:border-white/60">
        <span class="sr-only">Open Menu</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div id="nav-menu"
           class="hidden absolute right-4 top-14 w-48 rounded-lg border border-white/15
                  bg-black/80 backdrop-blur p-2 shadow-[0_0_20px_#7a00ff88]">
        <a class="block px-3 py-2 rounded hover:bg-white/10" href="/profile.html">Profile</a>
        <a class="block px-3 py-2 rounded hover:bg-white/10" href="#">Settings</a>
        <a class="block px-3 py-2 rounded hover:bg-white/10" href="#">Help</a>
      </div>
    </nav>
  </header>

  <!-- Contenuto -->
  <main class="mx-auto max-w-6xl px-4 py-10 grid place-items-center">
    <section class="card-neon w-full max-w-md relative overflow-hidden">
      <!-- accenti neon -->
      <div class="pointer-events-none absolute -inset-24 opacity-30
                  bg-[radial-gradient(circle,#ff00ff66,transparent_60%)] blur-3xl"></div>

      <div class="relative z-10">
        <h1 class="neon-title text-center text-3xl font-extrabold uppercase tracking-[0.3em]
                   text-transparent bg-clip-text
                   bg-gradient-to-r from-[#ff00ff] via-[#ffd54a] to-[#00fff0]">
          LOGIN
        </h1>

        <form class="mt-8 space-y-4" action="#" method="post">
          <div>
            <label class="block text-xs uppercase tracking-widest text-white/60 mb-1">Email</label>
            <input class="input-neon" type="email" name="email" placeholder="nome@dominio.it" />
          </div>

          <div>
            <label class="block text-xs uppercase tracking-widest text-white/60 mb-1">Password</label>
            <input class="input-neon" type="password" name="password" placeholder="••••••••" />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-white/70">
              <input type="checkbox" class="accent-fuchsia-500" />
              Stay Connected
            </label>
            <a href="#" class="text-white/70 hover:text-white">Lost your password?</a>
          </div>
            <!-- <button type="submit" class="btn-neon w-full">
                Log In
            </button> -->
        </form>
        <!-- CHIARAMENTE IN PRODUZIONE VA SCOMMENTATO IL BOTTONE DENTRO IL FORM EH -->
        <br><a href="/#/privateprofile">
            <button class="btn-neon w-full" title="PER ORA VA DIRETTAMENTE ALLA PAGINA PROFILO">
                Log In
            </button>
          </a>

        <div class="my-6 divider-neon">OR</div>

        <!-- Placeholder OAuth Google -->
        <button class="btn-google" type="button" id="login-google">
          <!-- logo GOOGLE -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.79 32.657 29.267 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.152 7.961 3.039l5.657-5.657C33.64 6.053 28.999 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.815C14.594 16.736 18.981 14 24 14c3.059 0 5.842 1.152 7.961 3.039l5.657-5.657C33.64 6.053 28.999 4 24 4c-7.73 0-14.308 4.399-17.694 10.691z"/>
            <path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.977 13.409-5.197l-6.198-5.238C29.06 35.091 26.657 36 24 36c-5.24 0-9.772-3.363-11.287-8.016l-6.545 5.038C9.53 39.586 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.017 3.157-3.596 5.64-6.892 6.565l6.198 5.238C36.289 40.647 44 36 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <a href="/auth/google">Continue with Google</a>
        </button>

        <p class="mt-6 text-center text-sm text-white/70">
          New to Ft_Transcendence? <a class="underline hover:text-white" href="/#/registration">Registration</a>
        </p>
      </div>
    </section>
  </main>

  <script type="module" src="/dist/dynamic.js"></script>
</body>
`;
}
//# sourceMappingURL=login.js.map