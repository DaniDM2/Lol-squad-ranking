// Configuración de la aplicación
export const CONFIG = {
    // LISTA DE AMIGOS - ¡MODIFICA ESTO!
    friends: [
        "Teserhela",
        "Fartinete",
        "Rubitativo"
    ],
    
    // Región del servidor
    region: "europe", // euw1, na1, la1, la2, etc.
    regionSummoner: "EUW1", // EUW, NA, LAN, LAS, etc.
    
    // API Key (se pide al usuario)
    apiKey: localStorage.getItem('lol_api_key') || '',
    
    // Configuración de caché (24 horas)
    cacheDuration: 24 * 60 * 60 * 1000,
    
    // Colores por rango
    rankColors: {
        IRON: '#A19D94',
        BRONZE: '#CD7F32',
        SILVER: '#C0C0C0',
        GOLD: '#FFD700',
        PLATINUM: '#00E6E6',
        DIAMOND: '#B366FF',
        MASTER: '#E6B800',
        GRANDMASTER: '#FF3333',
        CHALLENGER: '#1A1AFF',
        UNRANKED: '#666666'
    },
    // Mapeo de queueType a nombres legibles
    queueNames: {
        'RANKED_SOLO_5x5': 'Solo 5v5',
        'RANKED_FLEX_SR': 'Flex 5v5',
        'RANKED_FLEX_TT': 'Flex 3v3'
    }
};

// Guardar nueva API Key
export function saveApiKey(key) {
    CONFIG.apiKey = key;
    localStorage.setItem('lol_api_key', key);
    console.log('API Key guardada localmente');
}