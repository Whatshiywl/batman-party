import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InviteComponent } from './components/invite.component';

const routes: Routes = [
  {
    path: 'scan',
    loadChildren: () => import('./components/scan/scan.module').then(m => m.ScanModule)
  },
  {
    path: 'batmongus',
    loadChildren: () => import('./components/batmongus/batmongus.module').then(m => m.BatmongusModule)
  },
  {
    path: '',
    pathMatch: 'full',
    component: InviteComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
