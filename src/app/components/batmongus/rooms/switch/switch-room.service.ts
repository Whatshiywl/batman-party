import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { filter, map, mergeMap, Subject, switchMap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";

export interface SwitchRoom extends Room {
  numberOfSwitches: number;
}

export interface SwitchSpot extends RoomSpot {
  activated: boolean;
}

export interface SwitchOptions extends RoomOptions {
  numberOfSwitches: number;
}

@Injectable()
export class BatmongusSwitchRoomService extends BatmongusRoomService<SwitchRoom, SwitchSpot, SwitchOptions> {
  private readonly switchChange: Subject<string> = new Subject();
  private numberOfSwitches: number = 0;

  constructor(
    afs: AngularFirestore
  ) {
    super('switch', afs);
    this.room$.subscribe(room => this.numberOfSwitches = room?.numberOfSwitches || 0);

    this.switchChange.pipe(
      mergeMap(index => this.toggleSwitchesFromIndex(index)),
      filter(activated => activated),
      switchMap(() => this.spotsCol.get()),
      map(snapshot => snapshot.docs.map(doc => doc.data())),
      map(switches => {
        return switches.every(switchButton => {
          if (!switchButton.activated) return false;
          return true;
        });
      })
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  toggleSwitch(index: string) {
    this.switchChange.next(index);
  }

  private toggleSwitchesFromIndex(index: string) {
    const previousSwitchIndex = ((parseInt(index) + this.numberOfSwitches - 1) % this.numberOfSwitches).toString();
    const nextSwitchIndex = ((parseInt(index) + 1) % this.numberOfSwitches).toString();
    return this.afs.firestore.runTransaction(async transaction => {
      const switches = await Promise.all([
        transaction.get(this.spotsCol.doc(previousSwitchIndex).ref),
        transaction.get(this.spotsCol.doc(index).ref),
        transaction.get(this.spotsCol.doc(nextSwitchIndex).ref)
      ]);
      const updates = switches.map(doc => ({ doc, activated: !(doc.data()?.activated || false)}));
      updates.forEach(({ doc, activated }) => transaction.update(doc.ref, { activated }));
      return updates[1].activated;
    });
  }

  protected override async getRestartPuzzleState({ numberOfSwitches }: SwitchOptions) {
    return { numberOfSwitches };
  }

  protected override async getRestartSpotStates({ numberOfSwitches }: SwitchOptions) {
    const states: { key: string, value: Partial<SwitchSpot> }[] = [];
    for (let i = 0; i < numberOfSwitches; i++) {
      states.push({ key: i.toString(), value: { activated: false } });
    }
    return states;
  }

}
