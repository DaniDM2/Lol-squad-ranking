import { CONFIG } from '../config.js';

export class RiotClient {
    constructor() {
        this.baseURL = `https://${CONFIG.region}.api.riotgames.com`;
        this.baseURLSummoner = `https://${CONFIG.regionSummoner}.api.riotgames.com`;
        this.headers = {
            'X-Riot-Token': CONFIG.apiKey
        };
        this.cache = new Map();
    }

    // Obtener puuid y datos de cuenta
    async getAccountBygameName(name) {
        const cacheKey = `account-${name}`;
        
        // Verificar caché      
        if (this.isValidCache(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(
                `${this.baseURL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/EUW`,
                { headers: this.headers }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Guardar en caché
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error(`Error obteniendo account ${name}:`, error);
            throw error;
        }
    }

    //Obtiene datos de invocador (usa el puuid)
    async getSummonerByPuuid(puuid) {
        const cacheKey = `summoner-puuid-${puuid}`;
        // Verificar caché
        if (this.isValidCache(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }   
        try {
            const response = await fetch(
                `${this.baseURLSummoner}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
                { headers: this.headers }
            );
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            // Guardar en caché
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;    
        } catch (error) {
            console.error(`Error obteniendo summoner por puuid ${puuid}:`, error);
            throw error;
        }
    }
    // Obtener datos ranked de un jugador
    async getRankedStats(summonerId) {
        const cacheKey = `ranked-${summonerId}`;

        if (this.isValidCache(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }
        try {
            const response = await fetch(
                `${this.baseURLSummoner}/lol/league/v4/entries/by-puuid/${summonerId}`,
                { headers: this.headers }
            );
            const data = await response.json();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error(`Error obteniendo ranked stats:`, error);
            return [];
        }   
    }

    // Verificar si el caché es válido
    isValidCache(key) {
        if (!this.cache.has(key)) return false;
        
        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        return age < CONFIG.cacheDuration;
    }

    // Limpiar caché
    clearCache() {
        this.cache.clear();
        console.log('Caché limpiado');
    }
}