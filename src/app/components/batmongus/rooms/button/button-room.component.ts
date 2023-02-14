import { Component, OnInit } from "@angular/core";
import { DocumentReference } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusButtonRoomService, ButtonState } from "./button-room.service";

@Component({
  selector: 'batman-batmongus-button-room',
  template: `
  <div class="batman-flex-body button-room">
    <div
    class="button-room-button"
    [class.button-room-button-pressed]="(button$ | async)?.pressed"
    (mousedown)="press()"
    (touchstart)="press()"
    (mouseup)="release()"
    (touchend)="release()">
      {{ ref?.id || '' }}
    </div>
  </div>
  `,
  styles: [`
.button-room {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 30vh;

  > .button-room-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20vh;
    height: 20vh;
    border-radius: 50%;
    background-color: red;
    font-size: 15vh;

    &.button-room-button-pressed {
      filter: brightness(50%);
    }
  }
}
  `]
})
export class BatmongusButtonRoomComponent extends BatmongusRoomComponent implements OnInit {
  protected button$?: Observable<ButtonState | undefined>;
  protected ref?: DocumentReference<ButtonState>;


  constructor(
    private buttonRoomService: BatmongusButtonRoomService
  ) {
    super();
  }

  async ngOnInit() {
    this.setTimeout(10000);
    this.ref = await this.buttonRoomService.claim(this.timeoutValue);
    this.button$ = this.buttonRoomService.getButton$(this.ref.id);
  }

  protected press() {
    if (!this.ref) return;
    return this.buttonRoomService.pressButton(this.ref.id);
  }

  protected async release() {
    if (!this.ref) return;
    return this.buttonRoomService.releaseButton(this.ref.id);
  }

}
