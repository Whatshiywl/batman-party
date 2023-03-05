import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BatmongusAdminModule } from "../batmongus/batmongus.module";
import { AdminComponent } from "./admin.component";
import { AdminService } from "./admin.service";

@NgModule({
  imports: [
    CommonModule,
    BatmongusAdminModule,
    RouterModule.forChild([{
      path: '',
      component: AdminComponent
    }]),
  ],
  declarations: [
    AdminComponent
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule { }
