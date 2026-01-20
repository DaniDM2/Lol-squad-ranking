// Utilidad para reproducir sonidos

export function playSound(soundName) {
    try {
        // Crear elemento de audio
        const audio = new Audio(`/assets/sounds/${soundName}.mp3`);
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
