// ========================
// Usuario
// ========================
export interface User {
    id: number;
    username: string;
    email: string;
    fullname?: string;

    role?: 'admin' | 'member';

    // estados reales según BD
    status?: 'active' | 'pending' | 'accepted' | 'rejected' | 'kicked' | 'inactive';

    _new?: boolean;
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

    home?: {
        id: number;
        name?: string;
        logo?: string;
        pts?: number | null;
    };

    visitors?: {
        id: number;
        name?: string;
        logo?: string;
        pts?: number | null;
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
    puntos_local_real: number;
    puntos_visitante_real: number;
    game_date: string;
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


export interface MyLeague {
    id: number;
    name: string;
    privacy: 'public' | 'private';
    is_admin: boolean;
}


export interface AdminLeagueResponse {
    league: {
        id: number;
        name: string;
        privacy: 'public' | 'private';
        description: string | null;
        created_by: number;
        is_admin: boolean;
    };
    members: any[]; // si querés lo tipamos bien después
    invites: any[];
}

export interface MyCreatedLeague {
    league: {
        id: number;
        name: string;
        description: string | null;
        created_by: number;
        privacy: 'private' | 'public';
        max_teams: number;
        status: string;
        created_at: string;
    };
    members: any[];
}

export interface NotificationItem {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    is_read: boolean;
    created_at: string;
    data?: any;
}

export interface League {
    id: number;
    name: string;
    description: string | null;

    privacy: 'public' | 'private';

    creator_username: string;

    current_users: number;
    max_teams: number | null;

    status_code: string;
    status_description: string;

    created_at: string;
}

