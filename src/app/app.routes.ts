import {Routes} from '@angular/router';

import {AppPage} from './pages/app/app';
import {AuthPage} from './pages/auth/auth';
import {IndexPage} from './pages/index';

export const routes: Routes = [
  {
    path: '',
    component: IndexPage,
  },
  {
    path: 'app',
    component: AppPage,
  },
  {
    path: 'auth',
    component: AuthPage,
  },
];
