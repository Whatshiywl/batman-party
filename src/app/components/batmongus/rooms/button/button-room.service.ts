import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { filter, map, Subject, switchMap, tap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";
import { BatmongusService } from "../../batmongus.service";

export interface ButtonSpot extends RoomSpot {
  pressed: boolean;
}

export interface ButtonOptions extends RoomOptions {
  numberOfButtons: number;
}

@Injectable()
export class BatmongusButtonRoomService extends BatmongusRoomService<Room, ButtonSpot, RoomOptions> {
  private readonly buttonChange: Subject<{ index: string, pressed: boolean }> = new Subject();

  constructor(
    afs: AngularFirestore,
    batmongusService: BatmongusService,
  ) {
    super('button', afs, batmongusService);

    this.buttonChange.pipe(
      tap(({ index, pressed }) => this.setButtonState(index, pressed)),
      filter(({ pressed }) => pressed),
      switchMap(() => this.spotsCol.get()),
      map(snapshot => snapshot.docs.map(doc => doc.data())),
      map(buttons => {
        const now = Date.now();
        return buttons.every(button => {
          if (!button.pressed) return false;
          if ((now - button.claimedAt) > this.timeout) return false;
          return true;
        });
      })
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  pressButton(index: string) {
    this.buttonChange.next({ index, pressed: true });
  }

  releaseButton(index: string) {
    this.buttonChange.next({ index, pressed: false });
  }

  private setButtonState(index: string, pressed: boolean) {
    return this.spotsCol.doc(index).update({ pressed });
  }

  protected override async getRestartSpotStates({ numberOfButtons }: ButtonOptions) {
    const states: { key: string, value: Partial<ButtonSpot> }[] = [];
    for (let i = 0; i < numberOfButtons; i++) {
      states.push({ key: i.toString(), value: { pressed: false } });
    }
    return states;
  }

}
