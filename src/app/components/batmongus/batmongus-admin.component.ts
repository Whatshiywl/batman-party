import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { BatmongusService, Player } from "./batmongus.service";
import { BatmongusButtonRoomService, ButtonSpot } from "./rooms/button/button-room.service";
import { BatmongusSwitchRoomService, SwitchSpot } from "./rooms/switch/switch-room.service";
import { BatmongusGeniusRoomService, GeniusSpot, GeniusRoom } from "./rooms/genius/genius-room.service";
import { BatmongusWireRoomService, WireRoom } from "./rooms/wire/wire-room.service";
import { BatmongusMemoryRoomService, MemorySpot } from "./rooms/memory/memory-room.service";
import { BatmongusFuelIntakeRoomService, FuelState } from "./rooms/fuel-intake/fuel-intake-room.service";
import { BatmongusFuelDumpRoomService } from "./rooms/fuel-dump/fuel-dump-room.service";

@Component({
  selector: 'batmongus-admin',
  template: `
<div class="batmongus-admin-wrapper">
  <button (click)="resetBatmongusId()">Reset ID</button>
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
    <div *ngSwitchCase="'fuel-dump'" class="fuel-dump-room-wrapper">
      <div>
        <label for="batmongusFuelDumpRoomSize">Lugares: </label>
        <input #batmongusFuelDumpRoomSize type="number" step="1">
        <label for="batmongusFuelDumpRoomMax">Objetivo: </label>
        <input #batmongusFuelDumpRoomMax type="number" step="1">
        <button (click)="resetFuelDumpRoom(+batmongusFuelDumpRoomSize.value, +batmongusFuelDumpRoomMax.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="fuelDumpRoomCompleted$ | async">
        <span *ngIf="(fuelState$ | async) as state">{{ state.fuel }} / {{ state.max }}</span>
      </div>
    </div>
    <div *ngSwitchCase="'fuel-intake'" class="fuel-intake-room-wrapper">
      <div>
        <label for="batmongusFuelIntakeRoomSize">Lugares: </label>
        <input #batmongusFuelIntakeRoomSize type="number" step="1">
        <label for="batmongusFuelIntakeRoomMax">Capacidade máxima: </label>
        <input #batmongusFuelIntakeRoomMax type="number" step="1">
        <button (click)="resetFuelIntakeRoom(+batmongusFuelIntakeRoomSize.value, +batmongusFuelIntakeRoomMax.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="fuelIntakeRoomCompleted$ | async">
      </div>
    </div>
    <div *ngSwitchCase="'genius'" class="genius-room-wrapper">
      <div>
        <label for="batmongusGeniusRoomSize">Botões: </label>
        <input #batmongusGeniusRoomSize type="number" step="1">
        <label for="batmongusGeniusRoomLength">Ordem: </label>
        <input #batmongusGeniusRoomLength type="number" step="1">
        <button (click)="resetGeniusRoom(+batmongusGeniusRoomSize.value, +batmongusGeniusRoomLength.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="geniusRoomCompleted$ | async">
      </div>
      <div *ngIf="(geniusRoomState$ | async) as state" class="state-list">
        <div *ngFor="let color of state.order; let i = index"
        class="state-element"
        [style.background-color]="color"
        [style.opacity]="i <= state.targetPosition ? 1 : 0.3"
        [class.highlight]="state.position === i"></div>
      </div>
    </div>
    <div *ngSwitchCase="'memory'" class="memory-room-wrapper">
      <div>
        <label for="batmongusMemoryRoomSize">Pares: </label>
        <input #batmongusMemoryRoomSize type="number" step="1">
        <button (click)="resetMemoryRoom(+batmongusMemoryRoomSize.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="memoryRoomCompleted$ | async">
      </div>
      <div class="state-list">
        <div *ngFor="let card of (memoryRoomCards$ | async)"
        class="state-element"
        [class.highlight]="card.flipped"
        [style.opacity]="card.matched ? 0.3 : 1"><img [src]="card.image"></div>
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
    <div *ngSwitchCase="'wire'" class="wire-room-wrapper">
      <div>
        <label for="batmongusWireRoomSize">Fios: </label>
        <input #batmongusWireRoomSize type="number" step="1">
        <button (click)="resetWireRoom(+batmongusWireRoomSize.value)">
          Reset
        </button>
      </div>
      <div>
        <label>Completo: </label>
        <input type="checkbox" disabled [checked]="wireRoomCompleted$ | async">
      </div>
      <div class="state-list">
        <div *ngIf="(wireRoomState$ | async) as state"
        class="state-element"
        [style.backgroundColor]="state.target"></div>
      </div>
    </div>
  </div>
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
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: red;

      &.on {
        background-color: green;
      }

      &.highlight {
        box-shadow: 0 0 10px 5px black;
      }

      > img {
        width: 100%;
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
  protected readonly buttonRoomButtons$: Observable<ButtonSpot[]>;

  protected readonly fuelDumpRoomCompleted$: Observable<boolean>;
  protected readonly fuelIntakeRoomCompleted$: Observable<boolean>;
  protected readonly fuelState$: Observable<FuelState>;

  protected readonly geniusRoomCompleted$: Observable<boolean>;
  protected readonly geniusRoomButtons$: Observable<GeniusSpot[]>;
  protected readonly geniusRoomState$: Observable<GeniusRoom | undefined>;

  protected readonly memoryRoomCompleted$: Observable<boolean>;
  protected readonly memoryRoomCards$: Observable<MemorySpot[]>;

  protected readonly switchRoomCompleted$: Observable<boolean>;
  protected readonly switchRoomSwitches$: Observable<SwitchSpot[]>;

  protected readonly wireRoomCompleted$: Observable<boolean>;
  protected readonly wireRoomState$: Observable<WireRoom | undefined>;

  constructor(
    private batmongusService: BatmongusService,
    private batmongusButtonRoomService: BatmongusButtonRoomService,
    private batmongusFuelDumpRoomService: BatmongusFuelDumpRoomService,
    private batmongusFuelIntakeRoomService: BatmongusFuelIntakeRoomService,
    private batmongusGeniusRoomService: BatmongusGeniusRoomService,
    private batmongusMemoryRoomService: BatmongusMemoryRoomService,
    private batmongusSwitchRoomService: BatmongusSwitchRoomService,
    private batmongusWireRoomService: BatmongusWireRoomService,
  ) {
    this.players$ = this.batmongusService.players$;
    this.rooms = this.batmongusService.getRooms();

    this.buttonRoomCompleted$ = this.batmongusButtonRoomService.completed$;
    this.buttonRoomButtons$ = this.batmongusButtonRoomService.roomSpots$;

    this.fuelDumpRoomCompleted$ = this.batmongusFuelDumpRoomService.completed$;
    this.fuelIntakeRoomCompleted$ = this.batmongusFuelIntakeRoomService.completed$;
    this.fuelState$ = this.batmongusFuelDumpRoomService.fuelState$;

    this.geniusRoomCompleted$ = this.batmongusGeniusRoomService.completed$;
    this.geniusRoomButtons$ = this.batmongusGeniusRoomService.roomSpots$;
    this.geniusRoomState$ = this.batmongusGeniusRoomService.roomState$;

    this.memoryRoomCompleted$ = this.batmongusMemoryRoomService.completed$;
    this.memoryRoomCards$ = this.batmongusMemoryRoomService.roomSpots$;

    this.switchRoomCompleted$ = this.batmongusSwitchRoomService.completed$;
    this.switchRoomSwitches$ = this.batmongusSwitchRoomService.roomSpots$;

    this.wireRoomCompleted$ = this.batmongusWireRoomService.completed$;
    this.wireRoomState$ = this.batmongusWireRoomService.roomState$;
  }

  async resetBatmongusId() {
    await this.batmongusService.generateId();
  }

  resetButtonRoom(numberOfButtons: number) {
    return this.batmongusButtonRoomService.reset({ numberOfButtons });
  }

  resetFuelDumpRoom(numberOfSpots: number, target: number) {
    return this.batmongusFuelDumpRoomService.reset({ numberOfSpots, target });
  }

  resetFuelIntakeRoom(numberOfSpots: number, maxFuel: number) {
    return this.batmongusFuelIntakeRoomService.reset({ numberOfSpots, maxFuel });
  }

  resetGeniusRoom(numberOfButtons: number, orderLength: number) {
    return this.batmongusGeniusRoomService.reset({ numberOfButtons, orderLength });
  }

  resetMemoryRoom(numberOfPairs: number) {
    return this.batmongusMemoryRoomService.reset({ numberOfPairs });
  }

  resetSwitchRoom(numberOfSwitches: number) {
    return this.batmongusSwitchRoomService.reset({ numberOfSwitches });
  }

  resetWireRoom(numberOfWires: number) {
    return this.batmongusWireRoomService.reset({ numberOfWires });
  }

}
