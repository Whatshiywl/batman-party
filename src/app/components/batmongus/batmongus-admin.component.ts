import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { BatmongusService, Player } from "./batmongus.service";
import { BatmongusButtonRoomService, ButtonState } from "./rooms/button/button-room.service";
import { BatmongusSwitchRoomService, SwitchState } from "./rooms/switch/switch-room.service";

@Component({
  selector: 'batmongus-admin',
  template: `
<div class="batmongus-admin-wrapper">
  <h1>Players</h1>
  <table class="batmongus-players">
    <tbody>
      <tr
        *ngFor="let player of (players$ | async)"
        class="batmongus-player"
        [class.dead]="!player.alive"
      >
        <td>{{ player.id }}</td>
      </tr>
    </tbody>
  </table>
  <h1>Rooms</h1>
  <select
    #batmongusAdminRooms
    name="batmongus-rooms"
    id="batmongus-rooms">
    <option
      *ngFor="let room of (rooms | async)"
      [value]="room">
      {{ room }}
    </option>
  </select>
  <div [ngSwitch]="batmongusAdminRooms.value">
    <div *ngSwitchCase="'button'" class="button-room-wrapper">
      <div>
        <label>Botões: </label>
        <input #batmongusButtomRoomSize type="number" step="1">
        <button (click)="resetButtonRoom(+batmongusButtomRoomSize.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="buttonRoomCompleted$ | async">
      </div>
      <div class="state-list">
        <div *ngFor="let button of (buttonRoomButtons$ | async)"
        class="state-element"
        [class.on]="button.pressed"></div>
      </div>
    </div>
    <div *ngSwitchCase="'switch'" class="switch-room-wrapper">
      <div>
        <label for="batmongusSwitchRoomSize">Interruptores: </label>
        <input #batmongusSwitchRoomSize type="number" step="1">
        <button (click)="resetSwitchRoom(+batmongusSwitchRoomSize.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="switchRoomCompleted$ | async">
      </div>
      <div class="state-list">
        <div *ngFor="let switch of (switchRoomSwitches$ | async)"
        class="state-element"
        [class.on]="switch.activated"></div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
.batmongus-admin-wrapper {
  display: flex;
  flex-direction: column;

  .batmongus-player.dead {
    text-decoration: line-through;
  }

  .state-list {
    display: flex;
    justify-content: space-around;

    .state-element {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: red;

      &.on {
        background-color: green;
      }
    }
  }
}
  `]
})
export class BatmongusAdminComponent {
  protected readonly players$: Observable<Player[]>;
  protected readonly rooms: Promise<string[]>;

  protected readonly buttonRoomCompleted$: Observable<boolean>;
  protected readonly buttonRoomButtons$: Observable<ButtonState[]>;

  protected readonly switchRoomCompleted$: Observable<boolean>;
  protected readonly switchRoomSwitches$: Observable<SwitchState[]>;

  constructor(
    private batmongusService: BatmongusService,
    private batmongusButtonRoomService: BatmongusButtonRoomService,
    private batmongusSwitchRoomService: BatmongusSwitchRoomService,
  ) {
    this.players$ = this.batmongusService.players$;
    this.rooms = this.batmongusService.getRooms();

    this.buttonRoomCompleted$ = this.batmongusButtonRoomService.completed$;
    this.buttonRoomButtons$ = this.batmongusButtonRoomService.buttons$;

    this.switchRoomCompleted$ = this.batmongusSwitchRoomService.completed$;
    this.switchRoomSwitches$ = this.batmongusSwitchRoomService.switches$;
  }

  resetButtonRoom(buttons: number) {
    return this.batmongusButtonRoomService.reset(buttons);
  }

  resetSwitchRoom(switches: number) {
    return this.batmongusSwitchRoomService.reset(switches);
  }

}
