import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, filter, map, Subject, switchMap, timer } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";

export interface GeniusRoom extends Room {
  order: string[];
  position: number;
  showPosition: number;
  targetPosition: number;
}

export interface GeniusSpot extends RoomSpot {
  color: string;
}

export interface GeniusOptions extends RoomOptions {
  numberOfButtons: number;
  orderLength: number;
}

@Injectable()
export class BatmongusGeniusRoomService extends BatmongusRoomService<GeniusRoom, GeniusSpot, GeniusOptions> {
  public readonly showColor$: BehaviorSubject<string> = new BehaviorSubject('');
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

  pressButton(color: string) {
    this.buttonChange.next(color);
  }

  private update(color: string) {
    return this.afs.firestore.runTransaction(async transaction => {
      const room = await transaction.get(this.roomRef.ref);
      const { position, showPosition, targetPosition, order } = room.data() as GeniusRoom;
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
      const { showPosition, targetPosition } = room.data() as GeniusRoom;
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

  protected override async getRestartPuzzleState({ numberOfButtons, orderLength }: GeniusOptions) {
    const colors = this.colors.slice(0, numberOfButtons);
    const order = this.generateNewOrder(colors, orderLength);
    return {
      order,
      position: 0,
      showPosition: 0,
      targetPosition: 0
    };
  }

  protected override async getRestartSpotStates({ numberOfButtons }: GeniusOptions) {
    const colors = this.colors.slice(0, numberOfButtons);
    return colors.map(color => ({
      key: color, value: { color }
    }));
  }

}
