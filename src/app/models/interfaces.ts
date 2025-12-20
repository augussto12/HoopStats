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

export interface MappedGame {
  id: number;
  arena: string;
  dateReadable: string;
  dateISO: string | null;
  timeLocal: string;
  status: string; 
  period: number | null;
  clock: string | null;
  visitors: {
    id: number;
    name: string;
    code: string;
    logo: string;
    pts: number | null;
  };
  home: {
    id: number;
    name: string;
    code: string;
    logo: string;
    pts: number | null;
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
    my_team: {
        id: number;
        name: string;
        is_admin: boolean;
        status: string;
        status_desc: string;
        joined_at: string;
        points: number;
        position: number;
    };
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

export interface MyLeague {
    league: {
        id: number;
        name: string;
        description: string | null;
        privacy: 'public' | 'private';
        max_teams: number | null;
        created_at: string;
        status_code?: string;
        status_description?: string;
    };

    me: {
        team_id: number;
        team_name: string;
        is_admin: boolean;
        points: string;
        status: string;
        status_desc: string;
        joined_at: string;
    };

    teams: {
        team_id: number;
        team_name: string;
        user_id: number;
        owner: string;
        points: string;
        status: string;
        status_desc: string;
        is_admin: boolean;
    }[];

    recent_trades: any[];
}

// Un trade agrupado por timestamp
export interface LeagueTrade {
    timestamp: string;
    team_name: string;
    user_name: string;
    entran: string[] | null;
    salen: string[] | null;
}

// Mercado de jugadores en la liga
export interface LeagueMarketStat {
    full_name: string;
    total_adds: number;
    total_drops: number;
}

// Equipo dentro de la liga
export interface LeagueTeam {
    team_id: number;
    team_name: string;
    owner: string;
    points: number;
    status: string;
    status_desc: string;
    is_admin: boolean;
}

// Info general de la liga
export interface LeagueInfo {
    id: number;
    name: string;
    description: string;
    privacy: 'public' | 'private';
    max_teams: number;
    created_at: string;
}

export interface LeagueDetailsResponse {
    league: LeagueInfo;
    teams: LeagueTeam[];
}

export interface DreamTeamPlayer {
  id: number;
  full_name: string;
  team_logo: string;
  fantasy_points: number;
  position: string;
  photo_url?: string;
}