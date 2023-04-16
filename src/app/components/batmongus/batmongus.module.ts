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
import { ScanComponent } from "../scan/scan.component";
import { BatmongusAdminComponent } from "./batmongus-admin.component";
import { SharedModule } from "src/app/shared.module";
import { BatmongusSwitchRoomComponent } from "./rooms/switch/switch-room.component";
import { BatmongusSwitchRoomService } from "./rooms/switch/switch-room.service";
import { BatmongusGeniusRoomComponent } from "./rooms/genius/genius-room.component";
import { BatmongusGeniusRoomService } from "./rooms/genius/genius-room.service";

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
          BatmongusButtonRoomService
        ]
      },
      {
        path: 'rooms/genius',
        component: BatmongusGeniusRoomComponent,
        canActivate: [ SecretGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusGeniusRoomService
        ]
      },
      {
        path: 'rooms/switch',
        component: BatmongusSwitchRoomComponent,
        canActivate: [ SecretGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusSwitchRoomService
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
    BatmongusGeniusRoomService,
    BatmongusSwitchRoomService,
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
