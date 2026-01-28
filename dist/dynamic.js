// ===== Friends grid (placeholder + paginazione 10 per pagina) =====
const friendsGrid = document.getElementById("friends-grid");
const friendsPrev = document.getElementById("friends-prev");
const friendsNext = document.getElementById("friends-next");
const friendsRange = document.getElementById("friends-range");
if (friendsGrid && friendsPrev && friendsNext && friendsRange) {
    // Dummy data (sostituire poi con dati reali dal backend)
    const FRIENDS = Array.from({ length: 42 }, (_, i) => ({
        id: i + 1,
        nick: `FRIEND_${String(i + 1).padStart(3, "0")}`,
        avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
        status: (i % 3 === 0) ? "online" : "offline",
    }));
    const PAGE_SIZE = 12;
    let page = 1;
    const total = FRIENDS.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    function renderPage(p) {
        page = Math.min(Math.max(1, p), totalPages);
        const start = (page - 1) * PAGE_SIZE;
        const slice = FRIENDS.slice(start, start + PAGE_SIZE);
        friendsGrid.innerHTML = slice.map(f => `
        <article class="card-neon relative overflow-hidden">
            <div class="flex items-center gap-4">
            <div class="relative">
                <img src="${f.avatar}" alt="${f.nick}"
                    class="w-14 h-14 rounded-full object-cover ring-2 ring-[#ff00ffaa] shadow-[0_0_20px_#ff00ff66]">
                <span class="absolute -right-1 -bottom-1 inline-block w-3 h-3 rounded-full
                            ${f.status === "online" ? "bg-emerald-400" : "bg-zinc-500"}
                            ring-2 ring-black"></span>
            </div>
            <div class="min-w-0">
                <div class="font-semibold truncate">${f.nick}</div>
                <div class="text-xs text-white/60">${f.status === "online" ? "Online" : "Offline"}</div>
            </div>
            </div>

            <div class="mt-4 flex gap-2">
                <a href="./publicProfile.html" class="flex-1 text-center btn-neon btn-neon--compact">View</a>
                <button class="flex-1 btn-neon btn-neon--compact">Challenge</button>
            </div>
        </article>
        `).join("");
        const from = total ? start + 1 : 0;
        const to = Math.min(start + PAGE_SIZE, total);
        friendsRange.textContent = `${from}–${to} di ${total}`;
        friendsPrev.disabled = (page <= 1);
        friendsNext.disabled = (page >= totalPages);
    }
    friendsPrev.addEventListener("click", () => renderPage(page - 1));
    friendsNext.addEventListener("click", () => renderPage(page + 1));
    renderPage(1);
}
export {};
//# sourceMappingURL=dynamic.js.map