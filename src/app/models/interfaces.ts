// ========================
// Usuario
// ========================
export interface User {
    id?: number;
    fullname?: string;
    username?: string;
    email: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not';

    totalPredictionPoints?: number;

    favorites?: {
        teams: any[];
        players: any[];
    };

    fantasy?: FantasyTeam;
}

// ========================
// Jugador NBA API
// ========================
export interface Player {
    id: number;
    firstname: string;
    lastname: string;
    birth?: {
        date?: string;
        country?: string;
    };
    height?: {
        meters?: string;
        inches?: string;
    };
    weight?: {
        kilograms?: string;
        pounds?: string;
    };
    college?: string;
    nba?: {
        start?: number;
        pro?: number;
    };
    leagues?: {
        standard?: {
            pos?: string;
            jersey?: string;
            active?: boolean;
            teamId?: number;
        };
    };
}

// ========================
// Estadísticas de jugador
// ========================
export interface PlayerStats {
    player: {
        id: number;
        firstname: string;
        lastname: string;
    };
    team: Team;
    game: { id: number };
    points: number;
    assists: number;
    blocks: number;
    defReb: number;
    offReb: number;
    totReb: number;
    fgm: number;
    fga: number;
    fgp: number;
    ftm: number;
    fta: number;
    ftp: number;
    steals: number;
    turnovers: number;
    pFouls: number;
    min?: string;
    tpm: number;
}

export interface TopStat {
    category: string;
    player: string;
    value: number;
}


// ========================
// Partido (mapeado)
// ========================
export interface Game {
    id: number;
    date: string;
    stage?: number;
    period?: number;
    clock?: string;
    arena?: string;
    status?: {
        short?: string;
        long?: string;
    };
    home: {
        id: number;
        name: string;
        logo?: string;
        pts?: number;
    };
    visitors: {
        id: number;
        name: string;
        logo?: string;
        pts?: number;
    };
}

export interface PlayerGroup {
    team: Team;
    players: PlayerStats[];
}

// ========================
// Equipo NBA
// ========================
export interface Team {
    id: number;
    name: string;
    logo: string;
    code?: string;
    nickname?: string;
    city?: string;
    allStar?: boolean;
    nbaFranchise?: boolean;
    leagues: {
        standard: {
            conference: string | null;
            division: string | null;
        };
    };
}

// ========================
// Predicción (BACKEND FORMAT)
// ========================
export interface Prediction {
    id?: number;
    user_id?: number;

    game_id: number;
    home_team: string;
    visitor_team: string;

    puntos_local_prediccion: number;
    puntos_visitante_prediccion: number;

    puntos_obtenidos?: number;
    procesada?: boolean;

    created_at?: string;
}

export interface DbPrediction {
    id: number;
    game_id: number;
    home_team: string;
    visitor_team: string;
    puntos_local_prediccion: number;
    puntos_visitante_prediccion: number;
    puntos_obtenidos?: number;
    procesada: boolean;
}


// ========================
// Fantasy
// ========================
export interface FantasyPlayer {
    id: number;
    name: string;
    price: number;
    totalPts?: number;
}

export interface FantasyTeam {
    id?: number;
    name: string;
    totalPoints: number;
    budget: number;
    players: FantasyPlayer[];
}

// ========================
// Login / Register Response
// ========================
export interface AuthResponse {
    message: string;
    token: string;
    user: {
        id: number;
        email: string;
        fullname?: string;
        username?: string;
        gender?: string;
    };
}

export interface CountryOption {
    name: string;
}