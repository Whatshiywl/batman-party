import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { BehaviorSubject, filter, map, Observable, Subject, switchMap, timer } from "rxjs";
import { BatmongusRoomService, Puzzle, SpotState } from "../room.service";

export interface GeniusPuzzle extends Puzzle {
  order: string[];
  position: number;
  showPosition: number;
  targetPosition: number;
}

export interface GeniusButton extends SpotState {
  color: string;
}

@Injectable()
export class BatmongusGeniusRoomService extends BatmongusRoomService<GeniusPuzzle> {
  public readonly showColor$: BehaviorSubject<string> = new BehaviorSubject('');
  public readonly buttons$: Observable<GeniusButton[]>;
  private readonly buttonsCol: AngularFirestoreCollection<GeniusButton>;
  private readonly buttonChange: Subject<string> = new Subject();

  private readonly colors = [
    'red',
    'green',
    'blue',
    'yellow',
    'purple',
    'orange',
    'cyan',
    'magenta',
    'lime',
  ];

  constructor(
    afs: AngularFirestore
  ) {
    super('genius', afs);
    this.room$.subscribe(room => this.showColor$.next(room?.order[room?.showPosition] || ''));
    this.buttonsCol = this.roomRef.collection('buttons');
    this.buttons$ = this.buttonsCol.valueChanges();
    this.getTimeout().then(timeout => this.timeout = timeout);

    this.buttonChange.pipe(
      switchMap(color => this.update(color)),
      filter(success => success),
      switchMap(() => timer(500)),
      switchMap(() => this.roomRef.get()),
      map(snapshot => snapshot.data()),
      filter(room => Boolean(room)),
      map(room => {
        if (!room) return false;
        const { targetPosition, order } = room;
        return targetPosition >= order.length;
      })
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  async claim() {
    return this.afs.firestore.runTransaction(async transaction => {
      const claimedAt = Date.now();
      const timestamp = claimedAt - this.timeout;
      const buttons = await this.buttonsCol.ref.where('claimedAt', '<', timestamp).get();
      if (buttons.size === 0) return null;
      const doc = buttons.docs[Math.floor(Math.random() * buttons.size)];
      if (!doc) return null;
      const { ref } = doc;
      await transaction.get(ref);
      transaction.update(ref, { claimedAt });
      return ref;
    });
  }

  pressButton(color: string) {
    this.buttonChange.next(color);
  }

  private update(color: string) {
    return this.afs.firestore.runTransaction(async transaction => {
      const room = await transaction.get(this.roomRef.ref);
      const { position, showPosition, targetPosition, order } = room.data() as GeniusPuzzle;
      const expectedColor = order[position];
      const correctColor = color === expectedColor;
      const lastPosition = position === targetPosition;
      const lastTargetPosition = targetPosition === order.length;
      const newPosition = correctColor ? (lastPosition ? 0 : position + 1) : 0;
      const newTargetPosition = correctColor? (lastPosition ? targetPosition + 1 : targetPosition) : 0;
      const newShowPosition = correctColor ? ((lastPosition && !lastTargetPosition) ? 0 : showPosition) : 0;
      transaction.update(this.roomRef.ref, {
        position: newPosition,
        showPosition: newShowPosition,
        targetPosition: newTargetPosition
      });
      return correctColor;
    });
  }

  updateShowPosition() {
    return this.afs.firestore.runTransaction(async transaction => {
      const room = await transaction.get(this.roomRef.ref);
      const { showPosition, targetPosition } = room.data() as GeniusPuzzle;
      const newShowPosition = (showPosition < targetPosition) ? showPosition + 1 : -1;
      transaction.update(this.roomRef.ref, { showPosition: newShowPosition });
      return newShowPosition;
    });
  }

  private generateNewOrder(colors: string[], orderLength: number) {
    const order = [];
    for (let i = 0; i < orderLength; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      order.push(randomColor);
    };
    return order;
  }

  async reset(numberOfButtons: number, orderLength: number) {
    const colors = this.colors.slice(0, numberOfButtons);
    const order = this.generateNewOrder(colors, orderLength);
    await this.roomRef.update({
      completed: false,
      order,
      position: 0,
      showPosition: 0,
      targetPosition: 0
    });
    const snapshot = await this.buttonsCol.ref.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
    for (const color of colors) {
      await this.buttonsCol.doc(color).set({
        claimedAt: 0,
        color
      });
    }
  }

}
