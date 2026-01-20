import { CONFIG } from '../config.js';
import { calculateScore } from '../utils/ranking-calc.js';

export class PlayerCard {
    constructor(playerData) {
        this.player = playerData;
        this.score = calculateScore(playerData);
    }

    getPlayerPhotoUrl() {
        // Buscar foto personalizada en assets
        const playerNameLowercase = this.player.name.toLowerCase().replace(/\s+/g, '-');
        
        // Detectar si está en GitHub Pages o en local
        const isGitHubPages = window.location.hostname.includes('github.io');
        const isLocalFile = window.location.protocol === 'file:';
        
        let assetPhotoUrl;
        if (isGitHubPages) {
            // URL para GitHub Pages
            assetPhotoUrl = `/blob/main/assets/player-photos/${playerNameLowercase}.jpg`;
        } else {
            // URL para desarrollo local
            assetPhotoUrl = `/assets/player-photos/${playerNameLowercase}.jpg`;
        }
        
        return assetPhotoUrl;
    }

    render() {
        const winrate = this.calculateWinrate();
        const tier = this.player.tier || 'UNRANKED';
        const rankColor = CONFIG.rankColors[tier] || CONFIG.rankColors.UNRANKED;
        
        return `
            <div class="player-card" data-tier="${tier.toLowerCase()}" data-score="${this.score.toFixed(0)}">
                <div class="player-header" style="border-left-color: ${rankColor}">
                    <div class="player-icon">
                        <img src="${this.getPlayerPhotoUrl()}" 
                             alt="${this.player.name}"
                             onerror="this.src='https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/6.jpg'">
                    </div>
                    
                    <div class="player-info">
                        <h3 class="player-name">${this.player.name}</h3>
                        <div class="player-level">
                            <i class="fas fa-level-up-alt"></i> Nivel ${this.player.level || '?'}
                        </div>
                        
                        <div class="player-rank" style="color: ${rankColor}">
                            ${this.getRankDisplay()}
                            ${this.player.hotStreak ? ' <span class="hot-streak">🔥</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="player-stats">
                    ${this.renderStatsGrid(winrate)}
                    ${this.renderWinrateBar(winrate)}
                </div>
                
                <div class="player-footer">
                    <div class="player-score">
                        <span class="score-label">Puntuación:</span>
                        <span class="score-value">${this.score.toFixed(0)}</span>
                    </div>
                    <div class="last-updated">
                        Actualizado ahora
                    </div>
                </div>
            </div>
        `;
    }

    calculateWinrate() {
        if (!this.player.wins && !this.player.losses) return 0;
        const total = this.player.wins + this.player.losses;
        return (this.player.wins / total) * 100;
    }

    getRankDisplay() {
        if (!this.player.tier || this.player.tier === 'UNRANKED') {
            return 'Unranked';
        }
        
        const lp = this.player.leaguePoints ? ` • ${this.player.leaguePoints} LP` : '';
        return `${this.player.tier} ${this.player.rank || ''}${lp}`;
    }

    renderStatsGrid(winrate) {
        return `
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-value">${this.player.wins || 0}</div>
                    <div class="stat-label">Victorias</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${this.player.losses || 0}</div>
                    <div class="stat-label">Derrotas</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${winrate.toFixed(1)}%</div>
                    <div class="stat-label">Winrate</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${(this.player.wins || 0) + (this.player.losses || 0)}</div>
                    <div class="stat-label">Partidas</div>
                </div>
            </div>
        `;
    }

    renderWinrateBar(winrate) {
        return `
            <div class="winrate-bar">
                <div class="winrate-fill" style="width: ${Math.min(winrate, 100)}%"></div>
                <div class="winrate-labels">
                    <span>0%</span>
                    <span>${winrate.toFixed(1)}%</span>
                    <span>100%</span>
                </div>
            </div>
        `;
    }
}