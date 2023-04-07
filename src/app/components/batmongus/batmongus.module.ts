import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SecretGuard } from "src/app/components/secret/secret.guard";
import { SecretModule } from "src/app/components/secret/secret.module";
import { ScanModule } from "../scan/scan.module";
import { BatmongusComponent } from "./batmongus.component";
import { BatmongusService } from "./batmongus.service";
import { BatmongusButtonRoomService } from "./rooms/button/button-room.service";
import { BatmongusButtonRoomComponent } from "./rooms/button/button-room.component";
import { BATMONGUS_ROOM_TIMEOUT } from "./batmongus.types";
import { ScanComponent } from "../scan/scan.component";
import { BatmongusAdminComponent } from "./batmongus-admin.component";
import { ModalComponent } from "../modal/modal.component";
import { SharedModule } from "src/app/shared.module";

const routes: Routes = [
  {
    path: '',
    component: BatmongusComponent,
    children: [
      {
        path: 'rooms/button',
        component: BatmongusButtonRoomComponent,
        canActivate: [ SecretGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusButtonRoomService,
          { provide: BATMONGUS_ROOM_TIMEOUT, useValue: 10000 }
        ]
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
    SecretModule,
    ScanModule
  ],
  declarations: [
    BatmongusAdminComponent
  ],
  providers: [
    BatmongusService,
    BatmongusButtonRoomService,
    { provide: BATMONGUS_ROOM_TIMEOUT, useValue: 0 }
  ],
  exports: [
    ScanComponent,
    BatmongusAdminComponent
  ]
})
export class BatmongusAdminModule { }

@NgModule({
  imports: [
    CommonModule,
    BatmongusAdminModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    BatmongusComponent
  ],
  exports: [
    BatmongusComponent
  ]
})
export class BatmongusModule { }
