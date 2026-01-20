export function calculateScore(player) {
    if (!player.tier || player.tier === 'UNRANKED') {
        return player.level || 0; // Solo nivel si es unranked
    }

    // Puntos por tier
    const tierPoints = {
        'IRON': 100, 'BRONZE': 200, 'SILVER': 300,
        'GOLD': 400, 'PLATINUM': 500, 'DIAMOND': 600,
        'MASTER': 700, 'GRANDMASTER': 800, 'CHALLENGER': 900
    };

    // Puntos por división
    const rankPoints = {
        'IV': 0, 'III': 25, 'II': 50, 'I': 75
    };

    // Calcular winrate
    const totalGames = (player.wins || 0) + (player.losses || 0);
    const winrate = totalGames > 0 ? (player.wins / totalGames) * 100 : 0;

    // Fórmula de puntuación
    const score = 
        (tierPoints[player.tier] || 0) +
        (rankPoints[player.rank] || 0) +
        (player.leaguePoints || 0) +
        (winrate * 2) + // Winrate tiene peso doble
        (player.hotStreak ? 50 : 0) + // Bonus por racha
        (player.level || 0) / 10; // Pequeño bonus por nivel

    return Math.round(score);
}

// Ordenar jugadores por puntuación
export function sortPlayers(players) {
    return [...players].sort((a, b) => {
        const scoreA = calculateScore(a);
        const scoreB = calculateScore(b);
        return scoreB - scoreA; // Descendente
    });
}

// Agrupar por tier
export function groupByTier(players) {
    const groups = {};
    
    players.forEach(player => {
        const tier = player.tier || 'UNRANKED';
        if (!groups[tier]) groups[tier] = [];
        groups[tier].push(player);
    });
    
    return groups;
}