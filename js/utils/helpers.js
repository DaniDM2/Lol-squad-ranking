// Formatear fecha
export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mostrar/ocultar elementos
export function showElement(id) {
    const element = document.getElementById(id);
    if (element) element.style.display = 'block';
}

export function hideElement(id) {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
}

// Validar API Key
export function isValidApiKey(key) {
    return key && key.startsWith('RGAPI-') && key.length > 30;
}

// Mostrar notificación
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Cerrar al hacer clic
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

 // Agrupar jugadores por queueType
export function groupPlayersByQueueType(players) { 
    const groupedByQueue = {};
    players.forEach(player => {
        if (!groupedByQueue[player.queueType]) {
            groupedByQueue[player.queueType] = [];
        }
        groupedByQueue[player.queueType].push(player);
    });
    return groupedByQueue;
}