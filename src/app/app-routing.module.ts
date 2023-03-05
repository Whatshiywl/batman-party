import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InviteComponent } from './components/invite.component';

const routes: Routes = [
  {
    path: 'scan',
    loadChildren: () => import('./components/scan/scan.module').then(m => m.ScanModule.asRouted())
  },
  {
    path: 'batmongus',
    loadChildren: () => import('./components/batmongus/batmongus.module').then(m => m.BatmongusModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)
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
