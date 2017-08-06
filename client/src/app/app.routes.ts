import { Routes } from '@angular/router';
import { MainComponent } from './containers/main';
import { NoContentComponent } from './containers/no-content';

export const ROUTES: Routes = [
  { path: '',      component: MainComponent },
  { path: '**',    component: NoContentComponent }
];
