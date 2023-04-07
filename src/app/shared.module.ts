import { NgModule } from "@angular/core";
import { ModalComponent } from "./components/modal/modal.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ModalComponent
  ],
  exports: [
    ModalComponent
  ]
})
export class SharedModule { }
