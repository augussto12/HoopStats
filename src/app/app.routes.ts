import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TeamsComponent } from './teams/teams';
import { PlayersByTeam } from './players-by-team/players-by-team';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: PlayersByTeam }
];
