import {Routes} from '@angular/router';

import {AppPage} from './pages/app/app';
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
];
