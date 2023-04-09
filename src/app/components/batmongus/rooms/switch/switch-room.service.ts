import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { BehaviorSubject, filter, map, mergeMap, Subject, switchMap, tap } from "rxjs";
import { Puzzle } from "../../batmongus.service";

export interface SwitchPuzzle extends Puzzle {
  numberOfSwitches: number;
}

export interface SwitchState {
  claimedAt: number;
  activated: boolean;
}

@Injectable()
export class BatmongusSwitchRoomService {
  public readonly completed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly roomRef: AngularFirestoreDocument<SwitchPuzzle>;
  private readonly switchesCol: AngularFirestoreCollection<SwitchState>;
  private readonly switchChange: Subject<string> = new Subject();
  private timeout: number = 0;
  private numberOfSwitches: number = 0;

  constructor(
    private afs: AngularFirestore
  ) {
    this.roomRef = this.afs.collection('puzzles/batmongus/rooms').doc<SwitchPuzzle>('switch');
    this.roomRef.valueChanges().pipe(
      tap(room => this.numberOfSwitches = room?.numberOfSwitches || 0),
      map(room => room?.completed || false)
    ).subscribe(completed => this.completed$.next(completed));
    this.switchesCol = this.roomRef.collection('switches');
    this.getTimeout().then(timeout => this.timeout = timeout);

    this.switchChange.pipe(
      mergeMap(index => this.toggleSwitchesFromIndex(index)),
      filter(hello => hello),
      switchMap(() => this.switchesCol.get()),
      map(snapshot => snapshot.docs.map(doc => doc.data())),
      map(switches => {
        return switches.every(switchButton => {
          if (!switchButton.activated) return false;
          return true;
        });
      })
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  async claim() {
    return this.afs.firestore.runTransaction(async transaction => {
      const claimedAt = Date.now();
      const timestamp = claimedAt - this.timeout;
      const switches = await this.switchesCol.ref.where('claimedAt', '<', timestamp).get();
      const doc = switches.docs[Math.floor(Math.random() * switches.size)];
      if (!doc) return;
      const { ref } = doc;
      await transaction.get(ref);
      transaction.update(ref, { claimedAt });
      return ref;
    });
  }

  toggleSwitch(index: string) {
    this.switchChange.next(index);
  }

  private toggleSwitchesFromIndex(index: string) {
    const previousSwitchIndex = ((parseInt(index) + this.numberOfSwitches - 1) % this.numberOfSwitches).toString();
    const nextSwitchIndex = ((parseInt(index) + 1) % this.numberOfSwitches).toString();
    return this.afs.firestore.runTransaction(async transaction => {
      const switches = await Promise.all([
        transaction.get(this.switchesCol.doc(previousSwitchIndex).ref),
        transaction.get(this.switchesCol.doc(index).ref),
        transaction.get(this.switchesCol.doc(nextSwitchIndex).ref)
      ]);
      const updates = switches.map(doc => ({ doc, activated: !(doc.data()?.activated || false)}));
      updates.forEach(({ doc, activated }) => transaction.update(doc.ref, { activated }));
      return updates[1].activated;
    });
  }

  getSwitch(index: string) {
    return this.switchesCol.doc(index).valueChanges();
  }

  private setCompleted(completed: boolean) {
    return this.roomRef.update({ completed });
  }

  async reset(numberOfSwitches: number) {
    await this.roomRef.update({ completed: false, numberOfSwitches });
    const snapshot = await this.switchesCol.ref.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
    for (let i = 0; i < numberOfSwitches; i++) {
      await this.switchesCol.doc(i.toString()).set({
        claimedAt: 0,
        activated: false
      });
    }
  }

  async getTimeout() {
    if (this.timeout) return this.timeout;
    this.timeout = 1000 * ((await this.roomRef.ref.get()).data()?.timeout || 2);
    return this.timeout;
  }

}
