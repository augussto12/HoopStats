import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TeamsComponent } from './teams/teams';
import { PlayersByTeam } from './players-by-team/players-by-team';
import { Games } from './games/games';
import { PlayerData } from './player-data/player-data';
import { GameDetails } from './game-details/game-details';
import { HeadToHead } from './head-to-head/head-to-head';
import { Players } from './players/players';
import { Standings } from './standings/standings';
import { Login } from './login/login';
import { Register } from './register/register';
import { Profile } from './profile/profile';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: PlayersByTeam },
    { path: 'games', component: Games },
    { path: 'game-details/:id', component: GameDetails },
    { path: 'player/:id', component: PlayerData },
    { path: 'headtohead', component: HeadToHead },
    { path: 'players', component: Players },
    { path: 'standings', component: Standings },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'profile', component: Profile },
    {
        path: 'favorites',
        loadComponent: () =>
            import('./favorites/favorites').then(m => m.Favorites) // ← coincide con export class Favorites
    },
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: '**', redirectTo: 'home' }
];