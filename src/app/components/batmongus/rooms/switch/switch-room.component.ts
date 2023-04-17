import { Component, OnInit } from "@angular/core";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusSwitchRoomService, SwitchOptions, SwitchRoom, SwitchSpot } from "./switch-room.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && !(completed$ | async) && ref" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body button-room">
      <div *ngIf="ref && !(completed$ | async) && (spot$ | async) as switch"
      class="button-room-button noselect"
      [class.switch-room-switch-pressed]="switch.activated"
      (click)="onToggle()">
        {{ +ref.id + 1 }}
      </div>
      <div *ngIf="!(completed$ | async) && !ref">Sala cheia, volte mais tarde.</div>
      <div *ngIf="completed$ | async">Feito!</div>
    </div>
  </div>
  `,
  styles: [`
.counter {
  font-size: 25vh;
}

.button-room {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 30vh;

  > div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20vh;
    height: 20vh;
    border-radius: 50%;
    font-size: 15vh;
    background-color: red;

    &.switch-room-switch-pressed {
      background-color: green;
    }
  }
}
  `]
})
export class BatmongusSwitchRoomComponent extends BatmongusRoomComponent<
  SwitchRoom,
  SwitchSpot,
  SwitchOptions
> implements OnInit {

  constructor(
    private switchRoomService: BatmongusSwitchRoomService
  ) {
    super(switchRoomService);
  }

  protected onToggle() {
    if (!this.ref) return;
    this.switchRoomService.toggleSwitch(this.ref.id);
  }

}
