export interface User {
    fullname: string;
    username: string;
    email: string;
    password: string;
    gender: 'male' | 'female' | 'other' | 'prefer_not';
    totalPredictionPoints: number;
    favorites: {
        teams: any[];
        players: any[];
    };
    fantasy: FantasyTeam;
}


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


export interface TopStat {
    category: string;
    player: string;
    value: number;
}

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


export interface PlayerGroup {
    team: Team;
    players: PlayerStats[];
}

export interface Prediction {
    id?: string;
    idUser: string | number;
    idGame: number;
    homeTeam: string;
    visitorTeam: string;
    puntosLocalPrediccion: number;
    puntosVisitantePrediccion: number;
    puntosObtenidos: number;
    procesada: boolean;
}

export interface CountryOption {
    name: string;
}

export interface FantasyPlayer {
    id: number;
    name: string;
    price: number;
    totalPts?: number;
}

export interface FantasyTeam {
    name: string;
    totalPoints: number;
    budget: number;
    players: FantasyPlayer[];
}
