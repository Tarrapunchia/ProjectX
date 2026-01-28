import renderHome from "./pages/index.js";
import renderLogin from "./pages/login.js";
import renderPrivateProfile from "./pages/privateProfile.js";
import renderPublicProfile from "./pages/publicProfile.js";
import renderRegistration from "./pages/registration.js";
import renderTournament from "./pages/tournament.js";
// function renderHome(): string {
//     return `
//     <section>
//         <h2>Home</h2>
//         <p>
//             Benvenuto nella nostra mini SPA senza framework,
//             solo TypeScript
//         </p>
//         <p>
//             Prova a cliccare su <span>About</span> nella navbar
//             per cambiare pagina senza ricaricare il browser.
//         </p>
//     </section>
//     `
// }
function renderAbout() {
    return `
    <section>
        <h2>Home</h2>
        <p>
            Routes gestite con un router
            semplicissimo basato su <span>hash</span>.
        </p>
        <ul>
            <li>Frontend: HTML + tailwind</li>
            <li>Logica: TypeScript compilato in JavaScript</li>
            <li>Routing: <span>window.location.hash</span></li>
        </ul>
    </section>
    `;
}
function renderNotFound() {
    return `
    <section class="space-y-4">
        <h2>404</h2>
        <p>La pagina che cerchi non esiste.</p>
        <a href="#/">Torna alla Home</a>
    </section>
    `;
}
const routes = [
    { path: '#/', render: renderHome },
    { path: '#/login', render: renderLogin },
    { path: '#/tournament', render: renderTournament },
    { path: '#/registration', render: renderRegistration },
    { path: '#/privateprofile', render: renderPrivateProfile },
    { path: '#/publicprofile', render: renderPublicProfile },
    { path: '#/about', render: renderAbout },
];
function findRoute(path) {
    return routes.find((route) => route.path === path);
}
function renderRoute() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const hash = window.location.hash || '#/'; // default = home
    const route = findRoute(hash);
    console.log(window.location.hash);
    if (!route) {
        app.innerHTML = renderNotFound();
    }
    else {
        app.innerHTML = route.render();
    }
}
// quando cambia hash cambio la pagina
window.addEventListener("hashchange", () => { renderRoute(); });
// quando la pagina e' caricata la prima volta imposto hash come home, se non c'e'
window.addEventListener("DOMContentLoaded", () => {
    if (!window.location.hash) {
        window.location.hash = '#/';
    }
    renderRoute();
});
//# sourceMappingURL=main.js.map