import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InviteComponent } from './components/invite.component';
import { ScanComponent } from './components/scan.component';

const routes: Routes = [
  {
    path: 'scan',
    component: ScanComponent
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
