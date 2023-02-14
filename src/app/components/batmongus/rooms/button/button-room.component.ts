import { Component, HostListener, OnInit } from "@angular/core";
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
    (touchstart)="press()"
    (touchend)="release()">
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
    width: 20vh;
    height: 20vh;
    border-radius: 50%;
    background-color: red;

    &.button-room-button-pressed {
      filter: brightness(50%);
    }
  }
}
  `]
})
export class BatmongusButtonRoomComponent extends BatmongusRoomComponent implements OnInit {
  protected button$: Observable<ButtonState| undefined>;

  constructor(
    private buttonRoomService: BatmongusButtonRoomService
  ) {
    super();
    this.button$ = this.buttonRoomService.getButton$(1);
  }

  ngOnInit(): void {
    this.setTimeout(10000);
  }

  @HostListener('window:beforeunload', [ '$event' ])
  async beforeUnloadHandler() {
    await this.release();
  }

  press() {
    return this.buttonRoomService.pressButton(1);
  }

  release() {
    return this.buttonRoomService.releaseButton(1);
  }

}
