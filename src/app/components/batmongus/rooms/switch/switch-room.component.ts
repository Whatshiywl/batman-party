import { Component, OnInit } from "@angular/core";
import { DocumentReference } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusSwitchRoomService, SwitchState } from "./switch-room.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body button-room">
      <div *ngIf="!(completed$ | async) && ref"
      class="button-room-button noselect"
      [class.switch-room-switch-pressed]="(switch$ | async)?.activated"
      (click)="onToggle()">
        {{ +ref.id + 1 }}
      </div>
      <div *ngIf="!(completed$ | async) && ref === null">This room is full</div>
      <div *ngIf="completed$ | async">Done!</div>
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
export class BatmongusSwitchRoomComponent extends BatmongusRoomComponent implements OnInit {
  protected switch$?: Observable<SwitchState | undefined>;
  protected completed$: Observable<boolean>;
  protected ref?: DocumentReference<SwitchState> | null;

  constructor(
    private switchRoomService: BatmongusSwitchRoomService
  ) {
    super();
    this.completed$ = this.switchRoomService.completed$;
  }

  async ngOnInit() {
    const timeout = await this.switchRoomService.getTimeout();
    this.ref = await this.switchRoomService.claim();
    this.setTimeout(timeout);
    if (!this.ref) return;
    this.switch$ = this.switchRoomService.getSwitch(this.ref.id);
  }

  protected onToggle() {
    if (!this.ref) return;
    this.switchRoomService.toggleSwitch(this.ref.id);
  }

}
