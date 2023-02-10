import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InviteComponent } from './components/invite.component';
import { ScanTestComponent } from './components/scan/scan-test.component';

const routes: Routes = [
  {
    path: 'scan',
    component: ScanTestComponent
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
