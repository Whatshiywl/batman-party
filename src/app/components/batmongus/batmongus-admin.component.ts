import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { BatmongusService, Player } from "./batmongus.service";
import { BatmongusButtonRoomService } from "./rooms/button/button-room.service";

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
    <div *ngSwitchCase="'button'">
      <label for="batmongusButtomRoomSize">Botões: </label>
      <input #batmongusButtomRoomSize type="number" step="1">
      <button (click)="resetButtonRoom(+batmongusButtomRoomSize.value)">
        Reset
      </button>
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
}
  `]
})
export class BatmongusAdminComponent {
  protected readonly players$: Observable<Player[]>;
  protected readonly rooms: Promise<string[]>;

  constructor(
    private batmongusService: BatmongusService,
    private batmongusButtonRoomService: BatmongusButtonRoomService
  ) {
    this.players$ = this.batmongusService.players$;
    this.rooms = this.batmongusService.getRooms();
  }

  resetButtonRoom(buttons: number) {
    return this.batmongusButtonRoomService.reset(buttons);
  }

}
