import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Subject, filter, map, switchMap, tap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";
import { BatmongusFuelIntakeRoomService, FuelState } from "../fuel-intake/fuel-intake-room.service";
import { BatmongusService } from "../../batmongus.service";

export interface FuelDumpRoom extends Room {
  target: number;
}

export interface FuelDumpSpot extends RoomSpot {
  fuel: number;
}

export interface FuelDumpOptions extends RoomOptions {
  numberOfSpots: number;
  target: number;
}

@Injectable()
export class BatmongusFuelDumpRoomService extends BatmongusRoomService<FuelDumpRoom, FuelDumpSpot, FuelDumpOptions> {
  readonly fuelState$: BehaviorSubject<FuelState>;
  private readonly dumpingFuel$: Subject<string> = new Subject();
  private fuel: number = 0;
  private target: number = 0;

  constructor(
    afs: AngularFirestore,
    private fuelIntakeRoomService: BatmongusFuelIntakeRoomService,
    batmongusService: BatmongusService,
  ) {
    super('fuel-dump', afs, batmongusService);
    this.room$.pipe(
      tap(room => this.target = room?.target || 0)
    ).subscribe(() => this.updateFuelState());

    this.fuelState$ = new BehaviorSubject(this.getFuelState());
    this.spots$.pipe(
      map(spots => spots.reduce((acc, spot) => acc + spot.fuel, 0)),
      tap(fuel => this.fuel = fuel),
    ).subscribe(() => this.updateFuelState());
    this.dumpingFuel$.pipe(
      filter(() => this.fuelIntakeRoomService.fuel > 0),
      tap(() => this.fuelIntakeRoomService.removeFuel()),
      tap((index) => this.updateFuel(index)),
      switchMap(() => this.spotsCol.get()),
      map(snapshot => snapshot.docs.map(doc => doc.data())),
      map(spots => spots.reduce((acc, spot) => acc + spot.fuel, 0) >= this.target),
      filter(Boolean),
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  dumpFuel(index: string) {
    this.dumpingFuel$.next(index);
  }

  getTarget() {
    return this.target;
  }

  getCapacity() {
    return this.fuel / this.target;
  }

  private updateFuelState() {
    this.fuelState$.next(this.getFuelState());
  }

  getFuelState() {
    return { fuel: this.fuel, max: this.target, capacity: this.getCapacity() };
  }

  private updateFuel(index: string) {
    return this.afs.firestore.runTransaction(async transaction => {
      const spot = await transaction.get(this.spotsCol.doc(index).ref);
      const { fuel } = spot.data() as FuelDumpSpot;
      transaction.update(spot.ref, { fuel: fuel + 1 });
    });
  }

  public override async setCompleted(completed: boolean) {
    await Promise.all([
      super.setCompleted(completed),
      this.fuelIntakeRoomService.setCompleted(completed)
    ]);
  }

  protected override async getRestartPuzzleState({ target }: FuelDumpOptions) {
    return { target };
  }

  protected override async getRestartSpotStates({ numberOfSpots }: FuelDumpOptions) {
    const states: { key: string, value: Partial<FuelDumpSpot> }[] = [];
    for (let i = 0; i < numberOfSpots; i++) {
      states.push({ key: i.toString(), value: { fuel: 0 } });
    }
    return states;
  }

}
