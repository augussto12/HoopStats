import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TeamsComponent } from './teams/teams';
import { PlayersByTeam } from './players-by-team/players-by-team';
import { Games } from './games/games';
import { PlayerData } from './player-data/player-data';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: PlayersByTeam },
    { path: 'games', component: Games },
    { path: 'player/:id', component: PlayerData }
];
