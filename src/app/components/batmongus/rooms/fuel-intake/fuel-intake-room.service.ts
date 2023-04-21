import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Subject, filter, tap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";
import { SessionStorageService } from "src/app/shared/session-storage.service";
import { BatmongusService } from "../../batmongus.service";

export interface FuelIntakeRoom extends Room {
  maxFuel: number;
}

export interface FuelIntakeOptions extends RoomOptions {
  numberOfSpots: number;
  maxFuel: number;
}

export interface FuelState {
  fuel: number;
  max: number;
  capacity: number;
}

@Injectable()
export class BatmongusFuelIntakeRoomService extends BatmongusRoomService<FuelIntakeRoom, RoomSpot, FuelIntakeOptions> {
  readonly fuelState$: BehaviorSubject<FuelState>;
  private readonly fuelChange$: Subject<number> = new Subject();
  private maxFuel: number = 0;

  constructor(
    afs: AngularFirestore,
    private sessionStorageService: SessionStorageService,
    batmongusService: BatmongusService
  ) {
    super('fuel-intake', afs, batmongusService);
    this.room$.pipe(
      tap(room => this.maxFuel = room?.maxFuel || 0)
    ).subscribe(() => this.updateFuelState());

    this.fuelState$ = new BehaviorSubject(this.getFuelState());
    this.fuelChange$.pipe(
      filter(amount => this.fuel + amount <= this.maxFuel),
      tap(amount => this.fuel += amount)
    ).subscribe(() => this.updateFuelState());
  }

  get fuel() {
    return this.sessionStorageService.fuel;
  }

  set fuel(value: number) {
    this.sessionStorageService.fuel = value;
  }

  addFuel() {
    this.fuelChange$.next(1);
  }

  removeFuel() {
    this.fuelChange$.next(-1);
  }

  getMaxFuel() {
    return this.maxFuel;
  }

  getCapacity() {
    return this.fuel / this.maxFuel;
  }

  private updateFuelState() {
    this.fuelState$.next(this.getFuelState());
  }

  getFuelState() {
    return { fuel: this.fuel, max: this.maxFuel, capacity: this.getCapacity() };
  }

  protected override async getRestartPuzzleState({ maxFuel }: FuelIntakeOptions) {
    return { maxFuel };
  }

  protected override async getRestartSpotStates({ numberOfSpots }: FuelIntakeOptions) {
    const states: { key: string, value: Partial<RoomSpot> }[] = [];
    for (let i = 0; i < numberOfSpots; i++) {
      states.push({ key: i.toString(), value: { } });
    }
    return states;
  }

}
