import { NbaApiService } from '../services/nba-api';
import { mapGame } from './mapGame';

// Utilidades de fecha 
function pad(n: number) {
    return String(n).padStart(2, '0');
}

function toLocalYYYYMMDD(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateISO: string, delta: number) {
    const d = new Date(dateISO + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    return toLocalYYYYMMDD(d);
}

// Función genérica para obtener y mapear partidos por fecha 
export async function getGamesByDateMapped(api: NbaApiService, dateISO: string) {
    const [gPrev, gDay, gNext] = await Promise.all([
        api.getGamesByDate(addDays(dateISO, -1)),
        api.getGamesByDate(dateISO),
        api.getGamesByDate(addDays(dateISO, +1))
    ]);

    const all = [...gPrev, ...gDay, ...gNext];
    const unique = Array.from(new Map(all.map(g => [g.id, g])).values());

    return unique
        .filter(g => {
            const local = new Date(g?.date?.start ?? '');
            if (isNaN(+local)) return false;
            return toLocalYYYYMMDD(local) === dateISO;
        })
        .map(mapGame);
}

// Filtro por estado 
export function filterByStatus(games: any[], status: string) {
    if (!status) return games;

    switch (status) {
        case 'Finished':
            return games.filter(g => g.status === 'Final');
        case 'Live':
            return games.filter(g => g.status === 'LIVE');
        case 'Scheduled':
            return games.filter(g => g.status === 'Programado');
        default:
            return games;
    }
}
