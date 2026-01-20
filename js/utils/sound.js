import { isGitHubPages } from '../utils/helpers.js';

export function playSound(soundName) {
    try {
        // Crear elemento de audio
        const audio = isGitHubPages() ? new Audio(`https://github.com/DaniDM2/Lol-squad-ranking/tree/main/assets/sounds/${soundName}.mp3`) : new Audio(`/assets/sounds/${soundName}.mp3`);
        audio.volume = 0.5; // Volumen al 50%
        audio.play().catch(error => {
            console.log(`No se pudo reproducir el sonido: ${error}`);
        });
    } catch (error) {
        console.log(`Error al reproducir sonido: ${error}`);
    }
}

export function playRankingReadySound() {
    playSound('ranking-ready');
}
