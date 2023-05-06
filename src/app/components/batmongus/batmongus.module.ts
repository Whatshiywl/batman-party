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
import { BatmongusWireRoomComponent } from "./rooms/wire/wire-room.component";
import { BatmongusWireRoomService } from "./rooms/wire/wire-room.service";
import { BatmongusMemoryRoomComponent } from "./rooms/memory/memory-room.component";
import { BatmongusMemoryRoomService } from "./rooms/memory/memory-room.service";
import { BatmongusFuelIntakeRoomComponent } from "./rooms/fuel-intake/fuel-intake-room.component";
import { BatmongusFuelIntakeRoomService } from "./rooms/fuel-intake/fuel-intake-room.service";
import { BatmongusFuelDumpRoomComponent } from "./rooms/fuel-dump/fuel-dump-room.component";
import { BatmongusFuelDumpRoomService } from "./rooms/fuel-dump/fuel-dump-room.service";
import { BatmongusGuard } from "./batmongus.guard";

const routes: Routes = [
  {
    path: '',
    component: BatmongusComponent,
    canActivate: [ BatmongusGuard ],
    children: [
      {
        path: 'rooms/button',
        component: BatmongusButtonRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusButtonRoomService
        ]
      },
      {
        path: 'rooms/fuel-dump',
        component: BatmongusFuelDumpRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusFuelDumpRoomService,
          BatmongusFuelIntakeRoomService
        ]
      },
      {
        path: 'rooms/fuel-intake',
        component: BatmongusFuelIntakeRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusFuelIntakeRoomService
        ]
      },
      {
        path: 'rooms/genius',
        component: BatmongusGeniusRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusGeniusRoomService
        ]
      },
      {
        path: 'rooms/memory',
        component: BatmongusMemoryRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusMemoryRoomService
        ]
      },
      {
        path: 'rooms/switch',
        component: BatmongusSwitchRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusSwitchRoomService
        ]
      },
      {
        path: 'rooms/wire',
        component: BatmongusWireRoomComponent,
        canActivate: [ SecretGuard, BatmongusGuard ],
        data: { rejectTo: '/batmongus' },
        providers: [
          BatmongusWireRoomService
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
    BatmongusGuard,
    BatmongusService,
    BatmongusButtonRoomService,
    BatmongusFuelDumpRoomService,
    BatmongusFuelIntakeRoomService,
    BatmongusGeniusRoomService,
    BatmongusMemoryRoomService,
    BatmongusSwitchRoomService,
    BatmongusWireRoomService,
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
