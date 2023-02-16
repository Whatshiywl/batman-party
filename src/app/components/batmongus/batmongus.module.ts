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
    RouterModule.forChild(routes),
    SecretModule,
    ScanModule
  ],
  declarations: [
    BatmongusComponent,
    BatmongusButtonRoomComponent
  ],
  providers: [
    BatmongusService
  ],
  exports: [
    BatmongusComponent
  ]
})
export class BatmongusModule { }
