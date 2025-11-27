import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { TeamsComponent } from './features/teams/teams/teams';
import { PlayersByTeam } from './features/teams/players-by-team/players-by-team';
import { Games } from './features/game/games/games';
import { PlayerData } from './features/player/player-data/player-data';
import { GameDetails } from './features/game/game-details/game-details';
import { HeadToHead } from './features/game/head-to-head/head-to-head';
import { Players } from './features/player/players/players';
import { Standings } from './features/standings/standings';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { Favorites } from './features/favorites/favorites';
import { Prediction } from './features/predictions/prediction/prediction';
import { MyPredictions } from './features/predictions/my-predictions/my-predictions';
import { StandingsPredictions } from './features/predictions/standings-predictions/standings-predictions';
import { FantasyHome } from './features/fantasy/fantasy-home/fantasy-home';
import { MyTeam } from './features/fantasy/my-team/my-team';
import { StandingsFantasy } from './features/fantasy/standings-fantasy/standings-fantasy';
import { AuthGuard } from './auth-guard';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { VerifyEmail } from './components/auth/verify-email/verify-email';
import { ResetPassword } from './components/auth/reset-password/reset-password';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { CreateLeagueComponent } from './features/fantasy/create-league/create-league';
import { AdminLeagueComponent } from './features/fantasy/admin-league/admin-league';
import { MyLeagues } from './features/fantasy/my-leagues/my-leagues';

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

    { path: 'forgot-password', component: ForgotPassword },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'reset-password', component: ResetPassword },

    // rutas protegidas
    // rutas protegidas
    {
        path: 'favorites',
        component: Favorites,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'predictions',
        component: Prediction,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'my-predictions',
        component: MyPredictions,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'standings-predictions',
        component: StandingsPredictions,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'fantasy-home',
        component: FantasyHome,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'my-team',
        component: MyTeam,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'my-leagues',
        component: MyLeagues,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'standings-fantasy',
        component: StandingsFantasy,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'create-league',
        component: CreateLeagueComponent,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },
    {
        path: 'admin-league',
        component: AdminLeagueComponent,
        canActivate: [AuthGuard, EmailVerifiedGuard]
    },


    { path: '**', redirectTo: '' }
];
