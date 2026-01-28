import Chart, {} from 'chart.js/auto';
const gamesPlayed = document.getElementById("games");
if (!gamesPlayed) {
    console.error('Canvas \'games\' non trovato');
}
else {
    (async function () {
        const data = [
            { type: 'Games Won', count: 10 },
            { type: 'Games Lost', count: 20 },
        ];
        new Chart(gamesPlayed, {
            type: 'doughnut',
            data: {
                labels: data.map(row => row.type),
                datasets: [
                    {
                        data: data.map(row => row.count)
                    }
                ]
            }
        });
    })();
}
//# sourceMappingURL=chart.js.map