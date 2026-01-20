import { CONFIG, saveApiKey } from './config.js';
import { RiotClient } from './api/riot-client.js';
import { PlayerCard } from './components/player-card.js';
import { sortPlayers } from './utils/ranking-calc.js';
import { showElement, hideElement, showNotification, groupPlayersByQueueType } from './utils/helpers.js';

class App {
    constructor() {
        this.riotClient = new RiotClient();
        this.players = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        this.checkApiKey();
        this.updateLastUpdateTime();
    }

    bindEvents() {
        // Botón de actualizar
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadAllPlayers();
        });

        // Botón de configuración
        document.getElementById('configBtn').addEventListener('click', () => {
            this.showConfigModal();
        });

        // Si no hay API key, mostrar modal automáticamente
        if (!CONFIG.apiKey) {
            setTimeout(() => this.showConfigModal(), 1000);
        }
    }

    checkApiKey() {
        if (CONFIG.apiKey) {
            // Cargar datos automáticamente si hay API key
            this.loadAllPlayers();
        }
    }

    async loadAllPlayers() {
        if (!CONFIG.apiKey) {
            this.showConfigModal();
            return;
        }

        showElement('loading');
        hideElement('error');

        try {
            this.players = [];
            
            // Cargar datos de cada amigo
            for (const friendName of CONFIG.friends) {
                try {
                    const playerList = await this.loadPlayerData(friendName);
                    if (playerList && playerList.length > 0) {
                        this.players.push(...playerList);
                    }
                } catch (error) {
                    console.error(`Error cargando ${friendName}:`, error);
                }
            }

            // Ordenar por puntuación
            this.players = sortPlayers(this.players);
            
            // Renderizar
            this.render();
            
            // Actualizar timestamp
            this.updateLastUpdateTime();
            
            // Notificación
            showNotification('¡Ranking actualizado!', 'success');
            
        } catch (error) {
            this.showError('Error cargando datos: ' + error.message);
        } finally {
            hideElement('loading');
        }
    }

    async loadPlayerData(summonerName) {
        // Obtener datos básicos
        const accountData = await this.riotClient.getAccountBygameName(summonerName);
        const invokerData = await this.riotClient.getSummonerByPuuid(accountData.puuid);
        
        // Obtener datos ranked
        const rankedData = await this.riotClient.getRankedStats(accountData.puuid);
        
        // Crear un jugador por cada tipo de cola ranked
        return rankedData.map(rankedInfo => ({
            name: accountData.gameName,
            level: invokerData.summonerLevel,
            iconId: invokerData.profileIconId,
            puuid: accountData.puuid,
            // Datos ranked
            queueType: rankedInfo.queueType,
            tier: rankedInfo.tier || 'UNRANKED',
            rank: rankedInfo.rank || '',
            leaguePoints: rankedInfo.leaguePoints || 0,
            wins: rankedInfo.wins || 0,
            losses: rankedInfo.losses || 0,
            hotStreak: rankedInfo.hotStreak || false,
            veteran: rankedInfo.veteran || false,
            freshBlood: rankedInfo.freshBlood || false
        }));
    }

    render() {
        const container = document.getElementById('tabs-container');
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <h3>No hay jugadores cargados</h3>
                    <p>¡Agrega a tus amigos en la configuración!</p>
                </div>
            `;
            return;
        }

        // Agrupar jugadores por queueType
        const groupedByQueue = groupPlayersByQueueType(this.players);;

        const queueTypes = Object.keys(groupedByQueue);

        // Crear tabs
        const tabsHTML = `
            <div class="tabs-wrapper">
                <div class="tabs-buttons">
                    ${queueTypes.map((queueType, index) => `
                        <button class="tab-button ${index === 0 ? 'active' : ''}" data-queue="${queueType}">
                            ${CONFIG.queueNames[queueType] || queueType}
                        </button>
                    `).join('')}
                </div>
                
                <div class="tabs-content">
                    ${queueTypes.map((queueType, index) => {
                        const players = groupedByQueue[queueType];
                        const cardsHTML = players
                            .map(player => {
                                const card = new PlayerCard(player);
                                return card.render();
                            })
                            .join('');

                        return `
                            <div class="tab-panel ${index === 0 ? 'active' : ''}" data-queue="${queueType}">
                                <div class="ranking-grid">
                                    ${cardsHTML}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        container.innerHTML = tabsHTML;

        // Agregar event listeners a los tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const queueType = e.target.dataset.queue;
                
                // Remover clase active de todos los tabs
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                
                // Agregar clase active al tab clickeado
                e.target.classList.add('active');
                document.querySelector(`.tab-panel[data-queue="${queueType}"]`).classList.add('active');
            });
        });
    }

    showConfigModal() {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <h2><i class="fas fa-cog"></i> Configuración</h2>
                    
                    <div class="form-group">
                        <label for="apiKey">API Key de Riot:</label>
                        <input type="password" id="apiKey" 
                               placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                               value="${CONFIG.apiKey || ''}">
                        <small class="help-text">
                            <a href="https://developer.riotgames.com/" target="_blank">
                                Obtén tu API Key aquí
                            </a> (dura 24 horas)
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label>Amigos (uno por línea):</label>
                        <textarea id="friendsList" rows="6">${CONFIG.friends.join('\n')}</textarea>
                    </div>
                    
                    <div class="modal-actions">
                        <button id="saveConfig" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                        <button id="closeConfig" class="btn btn-secondary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Configurar eventos del modal
        document.getElementById('saveConfig').addEventListener('click', () => {
            this.saveConfig(modalContainer);
        });

        document.getElementById('closeConfig').addEventListener('click', () => {
            modalContainer.remove();
        });

        // Cerrar al hacer clic fuera
        modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                modalContainer.remove();
            }
        });
    }

    saveConfig(modalContainer) {
        const apiKey = document.getElementById('apiKey').value.trim();
        const friendsList = document.getElementById('friendsList').value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (apiKey) {
            saveApiKey(apiKey);
            CONFIG.friends = friendsList;
            localStorage.setItem('lol_friends', JSON.stringify(friendsList));
            
            showNotification('Configuración guardada', 'success');
            modalContainer.remove();
            
            // Recargar datos con nueva configuración
            this.loadAllPlayers();
        } else {
            showNotification('La API Key es requerida', 'error');
        }
    }

    updateLastUpdateTime() {
        const element = document.getElementById('last-update');
        if (element) {
            const now = new Date();
            element.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Error:</strong> ${message}
        `;
        showElement('error');
    }
}

// Inicializar la app cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});