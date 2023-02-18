import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AdminComponent } from "./admin.component";
import { AdminService } from "./admin.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: AdminComponent
    }])
  ],
  declarations: [
    AdminComponent
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule { }
