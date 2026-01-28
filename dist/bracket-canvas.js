// ---- Helpers per il tabellone ----
function nextPow2(n) { let p = 1; while (p < n)
    p <<= 1; return p; }
function seedPlayers(players) {
    const n = players.length;
    const pairs = [];
    for (let i = 0; i < Math.floor(n / 2); i++)
        pairs.push([players[i], players[n - 1 - i]]);
    if (n % 2 === 1)
        pairs.push([players[Math.floor(n / 2)], "BYE"]);
    return pairs;
}
function buildBracket(playersIn, twoLegged = false) {
    const target = nextPow2(playersIn.length);
    const players = playersIn.slice();
    while (players.length < target)
        players.push("BYE");
    const rounds = [];
    const legs = twoLegged ? 2 : 1;
    // Round 1
    const firstPairs = seedPlayers(players);
    rounds.push(firstPairs.map(([a, b]) => ({ a, b, legs })));
    // Round successivi (TBD)
    let slots = firstPairs.length;
    while (slots > 1) {
        slots >>= 1;
        rounds.push(Array.from({ length: slots }, () => ({ a: "TBD", b: "TBD", legs })));
    }
    // Propaga BYE (auto-advance)
    for (let r = 0; r < rounds.length - 1; r++) {
        const curr = rounds[r], next = rounds[r + 1];
        for (let i = 0; i < curr.length; i++) {
            const m = curr[i];
            const winner = m.a === "BYE" ? m.b : (m.b === "BYE" ? m.a : "TBD");
            if (winner !== "TBD") {
                const tIdx = Math.floor(i / 2);
                const slot = (i % 2 === 0) ? "a" : "b";
                next[tIdx][slot] = winner;
            }
        }
    }
    return rounds;
}
// ---- Canvas utilities ----
function setupCanvas(c) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = c.getBoundingClientRect();
    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(rect.height * dpr);
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // coord in CSS pixels
    return ctx;
}
function roundRect(ctx, x, y, w, h, r = 12) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function drawGlowBox(ctx, x, y, w, h) {
    // bordo violet + glow
    ctx.save();
    roundRect(ctx, x, y, w, h, 12);
    ctx.fillStyle = "#170030";
    ctx.fill();
    ctx.shadowColor = "#7a00ffaa";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.stroke();
    ctx.restore();
}
// Linee con glow ciano
function drawNeonLine(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = "#00fff0";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00fff0";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}
// ---- Render del bracket su canvas ----
function renderBracket(canvas, rounds) {
    // ---- Layout parametri (puoi regolarli) ----
    const padX = 32, padY = 24;
    const boxW = 200, boxH = 56;
    const colGap = 80;
    const vGapMin = 28;
    const cols = rounds.length;
    const r0Count = rounds[0].length;
    // ---- Dimensioni necessarie (in CSS px) ----
    const neededHeight = padY * 2 + r0Count * boxH + (r0Count - 1) * vGapMin;
    const neededWidth = padX * 2 + cols * boxW + (cols - 1) * colGap;
    // Imposto dimensioni CSS del canvas -> abilita lo scroll nel wrapper
    canvas.style.height = `${neededHeight}px`;
    canvas.style.width = `${neededWidth}px`;
    // Ora posso creare il contesto scalato correttamente
    const ctx = setupCanvas(canvas); // <- usa getBoundingClientRect aggiornato
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    // ---- Calcolo posizioni colonne ----
    const colX = Array.from({ length: cols }, (_, r) => padX + r * (boxW + colGap));
    // ---- Y dei box per round 0 ----
    const y0 = [];
    const startY = Math.max(padY, (height - (r0Count * boxH + (r0Count - 1) * vGapMin)) / 2);
    for (let i = 0; i < r0Count; i++)
        y0.push(startY + i * (boxH + vGapMin));
    // ---- yPositions[round][match] ----
    const yPositions = [y0];
    for (let r = 1; r < cols; r++) {
        const prev = yPositions[r - 1];
        const currCount = rounds[r].length;
        const curr = [];
        for (let i = 0; i < currCount; i++) {
            const yA = prev[i * 2];
            const yB = prev[i * 2 + 1];
            curr.push((yA + yB) / 2);
        }
        yPositions.push(curr);
    }
    // ---- Connessioni (sotto i box) ----
    for (let r = 1; r < cols; r++) {
        for (let i = 0; i < rounds[r].length; i++) {
            const parentX = colX[r];
            const parentY = yPositions[r][i] + boxH / 2;
            const child1X = colX[r - 1] + boxW;
            const child1Y = yPositions[r - 1][i * 2] + boxH / 2;
            const child2X = child1X;
            const child2Y = yPositions[r - 1][i * 2 + 1] + boxH / 2;
            drawNeonLine(ctx, child1X, child1Y, parentX, parentY);
            drawNeonLine(ctx, child2X, child2Y, parentX, parentY);
        }
    }
    // ---- Box + testi ----
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textBaseline = "middle";
    for (let r = 0; r < cols; r++) {
        for (let i = 0; i < rounds[r].length; i++) {
            const m = rounds[r][i];
            const x = colX[r];
            const y = yPositions[r][i];
            drawGlowBox(ctx, x, y, boxW, boxH);
            const row1Y = y + boxH * 0.33;
            const row2Y = y + boxH * 0.72;
            ctx.fillStyle = "white";
            ctx.globalAlpha = 0.95;
            ctx.fillText(String(m.a), x + 10, row1Y);
            ctx.fillText(String(m.b), x + 10, row2Y);
            if (r === 0) {
                ctx.globalAlpha = 0.6;
                ctx.fillText("Round 1", x + boxW - 58, y + 14);
            }
            ctx.globalAlpha = 1;
            if (m.legs === 2) {
                ctx.save();
                const bx = x + boxW - 56, by = y + boxH - 18, bw = 48, bh = 16;
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                roundRect(ctx, bx, by, bw, bh, 6);
                ctx.fill();
                ctx.fillStyle = "rgba(255,255,255,0.7)";
                ctx.font = "10px ui-sans-serif";
                ctx.fillText("A/R", bx + 14, by + bh / 2);
                ctx.restore();
            }
        }
    }
}
// ---- Hook UI ----
const canvas = document.getElementById("bracket-canvas");
const inputCount = document.getElementById("players-count");
const inputNames = document.getElementById("players-names");
const btn = document.getElementById("btn-draw");
function drawFromForm() {
    if (!canvas)
        return;
    const n = Math.max(2, Number((inputCount === null || inputCount === void 0 ? void 0 : inputCount.value) || 8));
    const names = ((inputNames === null || inputNames === void 0 ? void 0 : inputNames.value) || "")
        .split(",").map(s => s.trim()).filter(Boolean);
    const players = names.length ? names.slice(0, n) : Array.from({ length: n }, (_, i) => `P${i + 1}`);
    const rounds = buildBracket(players);
    renderBracket(canvas, rounds);
}
// ridisegna su resize (responsive)
window.addEventListener("resize", () => drawFromForm());
btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", () => drawFromForm());
// primo render
drawFromForm();
export {};
//# sourceMappingURL=bracket-canvas.js.map