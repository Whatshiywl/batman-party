import { Inject, Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { BehaviorSubject, filter, map, Subject, switchMap, tap } from "rxjs";
import { Puzzle } from "../../batmongus.service";
import { BATMONGUS_ROOM_TIMEOUT } from "../../batmongus.types";

export interface ButtonState {
  claimedAt: number;
  pressed: boolean;
}

@Injectable()
export class BatmongusButtonRoomService {
  public readonly completed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly roomRef: AngularFirestoreDocument<Puzzle>;
  private readonly buttonsCol: AngularFirestoreCollection<ButtonState>;
  private readonly buttonChange: Subject<{ index: string, pressed: boolean }> = new Subject();

  constructor(
    private afs: AngularFirestore,
    @Inject(BATMONGUS_ROOM_TIMEOUT) private readonly injectedTimeout: number,
  ) {
    this.roomRef = this.afs.collection('puzzles/batmongus/rooms').doc<Puzzle>('button');
    this.roomRef.valueChanges().pipe(map(room => room?.completed || false)).subscribe(completed => this.completed$.next(completed));
    this.buttonsCol = this.roomRef.collection('buttons');

    this.buttonChange.pipe(
      tap(({ index, pressed }) => this.setButtonState(index, pressed)),
      filter(({ pressed }) => pressed),
      switchMap(() => this.buttonsCol.get()),
      map(snapshot => snapshot.docs.map(doc => doc.data())),
      map(buttons => {
        const now = Date.now();
        return buttons.every(button => {
          if (!button.pressed) return false;
          if ((now - button.claimedAt) > this.injectedTimeout) return false;
          return true;
        });
      })
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  async claim(timeout: number) {
    return this.afs.firestore.runTransaction(async transaction => {
      const claimedAt = Date.now();
      const timestamp = claimedAt - timeout;
      const buttons = await this.buttonsCol.ref.where('claimedAt', '<', timestamp).get();
      const doc = buttons.docs[Math.floor(Math.random() * buttons.size)];
      if (!doc) return;
      const { ref } = doc;
      await transaction.get(ref);
      transaction.update(ref, { claimedAt, pressed: false });
      return ref;
    });
  }

  pressButton(index: string) {
    this.buttonChange.next({ index, pressed: true });
  }

  releaseButton(index: string) {
    this.buttonChange.next({ index, pressed: false });
  }

  private setButtonState(index: string, pressed: boolean) {
    return this.buttonsCol.doc(index).update({ pressed });
  }

  getButton$(index: string) {
    return this.buttonsCol.doc(index).valueChanges();
  }

  private setCompleted(completed: boolean) {
    return this.roomRef.update({ completed });
  }

  async reset(buttons: number) {
    await this.roomRef.update({ completed: false });
    const snapshot = await this.buttonsCol.ref.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
    for (let i = 0; i < buttons; i++) {
      await this.buttonsCol.doc(i.toString()).set({
        claimedAt: 0,
        pressed: false
      });
    }
  }

}
