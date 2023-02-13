import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SecretGuard } from "src/app/shared/secret/secret.guard";
import { SecretModule } from "src/app/shared/secret/secret.module";
import { ScanModule } from "../scan/scan.module";
import { BatmongusComponent } from "./batmongus.component";
import { BatmongusService } from "./batmongus.service";
import { BatmongusButtomRoomService } from "./rooms/button/button-room.service";
import { BatmongusButtonRoomComponent } from "./rooms/button/button-room.component";

const routes: Routes = [
  {
    path: '',
    component: BatmongusComponent,
    children: [
      {
        path: 'rooms/button',
        component: BatmongusButtonRoomComponent,
        canActivate: [ SecretGuard ],
        data: { rejectTo: '/batmongus' }
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SecretModule,
    ScanModule
  ],
  declarations: [
    BatmongusComponent,
    BatmongusButtonRoomComponent
  ],
  providers: [
    BatmongusService,
    BatmongusButtomRoomService
  ],
  exports: [
    BatmongusComponent
  ]
})
export class BatmongusModule { }
