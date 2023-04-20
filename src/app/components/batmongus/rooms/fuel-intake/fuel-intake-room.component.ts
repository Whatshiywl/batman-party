import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusFuelIntakeRoomService, FuelIntakeOptions, FuelIntakeRoom, FuelState } from "./fuel-intake-room.service";
import { CommonModule } from "@angular/common";
import { RoomSpot } from "../room.service";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && !(completed$ | async) && ref" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body fuel-intake-room">
      <div *ngIf="ref && !(completed$ | async) && (state$ | async) as state"
      class="fuel-intaker noselect"
      (click)="onAddFuel()">
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

.fuel-intake-room {
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
    background-blend-mode: screen;
    font-size: 15vh;

    &.fuel-intaker {
      background-color: #300;
      box-sizing: border-box;
      border: 3px solid #ccc;

      > .fuel-indicator {
        width: 100%;
        background-color: #dd0;
        font-size: 12px;
        color: black;
      }
    }
  }
}
  `]
})
export class BatmongusFuelIntakeRoomComponent extends BatmongusRoomComponent<
  FuelIntakeRoom,
  RoomSpot,
  FuelIntakeOptions
> implements OnInit {
  protected state$: Observable<FuelState>;

  constructor(
    private fuelIntakeRoomService: BatmongusFuelIntakeRoomService
  ) {
    super(fuelIntakeRoomService);
    this.state$ = this.fuelIntakeRoomService.fuelState$;
  }

  onAddFuel() {
    this.fuelIntakeRoomService.addFuel();
  }

}
