import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.RIOT_API_KEY;
const REGION = 'europe';
const REGION_SUMMONER = 'EUW1';
const CACHE_FILE = path.join(__dirname, '../data/players-cache.json');
const FRIENDS_FILE = path.join(__dirname, '../data/friends.json');

// Leer amigos del archivo JSON
let FRIENDS = [];
try {
    const friendsData = fs.readFileSync(FRIENDS_FILE, 'utf-8');
    FRIENDS = JSON.parse(friendsData);
    console.log(`📋 Loaded ${FRIENDS.length} friends from friends.json`);
} catch (error) {
    console.error('❌ Error reading friends.json:', error.message);
    process.exit(1);
}

class RiotDataFetcher {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = `https://${REGION}.api.riotgames.com`;
        this.baseURLSummoner = `https://${REGION_SUMMONER}.api.riotgames.com`;
        this.headers = {
            'X-Riot-Token': this.apiKey
        };
    }

    async getAccountByGameName(name) {
        const [gameName, tagLine] = name.includes('#') 
            ? name.split('#') 
            : [name, 'EUW'];

        console.log(`${this.baseURL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
        const response = await fetch(
            `${this.baseURL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            { headers: this.headers }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText} para ${name}`);
        }

        return await response.json();
    }

    async getSummonerByPuuid(puuid) {
        console.log(`${this.baseURLSummoner}/lol/summoner/v4/summoners/by-puuid/${puuid}`);
        const response = await fetch(
            `${this.baseURLSummoner}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
            { headers: this.headers }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async getRankedStats(puuid) {
        const response = await fetch(
            `${this.baseURLSummoner}/lol/league/v4/entries/by-puuid/${puuid}`,
            { headers: this.headers }
        );
        console.log(`${this.baseURLSummoner}/lol/league/v4/entries/by-puuid/${puuid}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async fetchPlayerData(summonerName) {
        try {
            const accountData = await this.getAccountByGameName(summonerName);
            const invokerData = await this.getSummonerByPuuid(accountData.puuid);
            const rankedData = await this.getRankedStats(accountData.puuid);

            return rankedData.map(rankedInfo => ({
                name: accountData.gameName,
                level: invokerData.summonerLevel,
                iconId: invokerData.profileIconId,
                puuid: accountData.puuid,
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
        } catch (error) {
            console.error(`Error fetching data for ${summonerName}:`, error.message);
            return [];
        }
    }

    async fetchAllPlayers() {
        const allPlayers = [];

        for (const friendName of FRIENDS) {
            console.log(`Fetching data for ${friendName}...`);
            const playerData = await this.fetchPlayerData(friendName);
            if (playerData.length > 0) {
                allPlayers.push(...playerData);
            }
            // Pequeño delay para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return allPlayers;
    }
}

async function main() {
    if (!API_KEY) {
        console.error('❌ RIOT_API_KEY environment variable not set');
        process.exit(1);
    }

    try {
        console.log('🚀 Starting Riot data fetch...');
        const fetcher = new RiotDataFetcher(API_KEY);
        const players = await fetcher.fetchAllPlayers();

        // Crear directorio si no existe
        const dataDir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Guardar datos
        fs.writeFileSync(CACHE_FILE, JSON.stringify({
            timestamp: new Date().toISOString(),
            players
        }, null, 2));

        console.log(`✅ Successfully saved ${players.length} players to ${CACHE_FILE}`);
    } catch (error) {
        console.error('❌ Error fetching data:', error.message);
        process.exit(1);
    }
}

main();
