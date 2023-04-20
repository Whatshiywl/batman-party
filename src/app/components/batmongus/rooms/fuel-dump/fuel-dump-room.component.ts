import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusFuelDumpRoomService, FuelDumpOptions, FuelDumpRoom, FuelDumpSpot } from "./fuel-dump-room.service";
import { CommonModule } from "@angular/common";
import { BatmongusFuelIntakeRoomService, FuelState } from "../fuel-intake/fuel-intake-room.service";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && !(completed$ | async) && ref" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body fuel-dump-room">
      <div *ngIf="ref && !(completed$ | async) && (intakeState$ | async) as state"
      class="fuel-dumper noselect"
      (click)="onDumpFuel()">
        <div class="fuel-indicator" [style.height.%]="state.capacity * 100"></div>
      </div>
      <div *ngIf="ref && !(completed$ | async) && (dumpState$ | async) as state"
      class="fuel-gauge noselect">
        <div class="fuel-indicator" [style.height.%]="state.capacity * 100"></div>
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

.fuel-dump-room {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 30vh;

  > div {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: 20vh;
    height: 20vh;
    font-size: 15vh;

    &.fuel-dumper,
    &.fuel-gauge {
      background-color: #300;
      box-sizing: border-box;
      border: 3px solid #ccc;
    }

    &.fuel-gauge {
      position: absolute;
      right: 2vw;
      width: 10vw;
    }

    > .fuel-indicator {
      width: 100%;
      background-color: #dd0;
      font-size: 12px;
      color: black;
    }
  }
}
  `]
})
export class BatmongusFuelDumpRoomComponent extends BatmongusRoomComponent<
  FuelDumpRoom,
  FuelDumpSpot,
  FuelDumpOptions
> implements OnInit {
  protected dumpState$: Observable<FuelState>;
  protected intakeState$: Observable<FuelState>;

  constructor(
    private fuelDumpRoomService: BatmongusFuelDumpRoomService,
    private fuelIntakeRoomService: BatmongusFuelIntakeRoomService
  ) {
    super(fuelDumpRoomService);
    this.dumpState$ = this.fuelDumpRoomService.fuelState$;
    this.intakeState$ = this.fuelIntakeRoomService.fuelState$;
  }

  onDumpFuel() {
    if (!this.ref) return;
    this.fuelDumpRoomService.dumpFuel(this.ref.id);
  }

}
