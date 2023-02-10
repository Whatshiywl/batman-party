import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ScanModule } from "../scan/scan.module";
import { BatmongusComponent } from "./batmongus.component";
import { BatmongusService } from "./batmongus.service";
import { BatmongusButtonRoomComponent } from "./rooms/button-room.component";

const routes: Routes = [
  {
    path: '',
    component: BatmongusComponent,
    children: [
      {
        path: 'room/button',
        component: BatmongusButtonRoomComponent
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
  ],
  bootstrap: [BatmongusComponent]
})
export class BatmongusModule { }
