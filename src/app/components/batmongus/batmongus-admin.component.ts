import { Component } from "@angular/core";
import { BatmongusService } from "./batmongus.service";
import { BatmongusButtonRoomService } from "./rooms/button/button-room.service";

@Component({
  selector: 'batmongus-admin',
  template: `
<div class="batmongus-admin-wrapper">
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
}
  `]
})
export class BatmongusAdminComponent {
  protected readonly rooms: Promise<string[]>;

  constructor(
    private batmongusService: BatmongusService,
    private batmongusButtonRoomService: BatmongusButtonRoomService
  ) {
    this.rooms = this.batmongusService.getRooms();
  }

  resetButtonRoom(buttons: number) {
    return this.batmongusButtonRoomService.reset(buttons);
  }

}
