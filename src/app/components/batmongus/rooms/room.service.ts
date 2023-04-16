import { AngularFirestoreDocument, AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Observable, map } from "rxjs";

export interface Puzzle {
  name: string;
  instructions: string;
  image: string;
  completed: boolean;
  timeout: number;
}

export interface SpotState {
  claimedAt: number;
}

export abstract class BatmongusRoomService<T extends Puzzle> {
  public readonly completed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected readonly roomRef: AngularFirestoreDocument<T>;
  protected readonly room$: Observable<T | undefined>;
  protected timeout: number = 0;

  constructor(
    roomName: string,
    protected afs: AngularFirestore,
  ) {
    this.roomRef = this.afs.collection('puzzles/batmongus/rooms').doc<T>(roomName);
    this.room$ = this.roomRef.valueChanges();
    this.room$.pipe(
      map(room => room?.completed || false)
    ).subscribe(completed => this.completed$.next(completed));
  }

  get roomState$() {
    return this.room$;
  }

  protected setCompleted(completed: boolean) {
    return this.roomRef.update({ completed } as Partial<T>);
  }

  async getTimeout() {
    if (this.timeout) return this.timeout;
    this.timeout = 1000 * ((await this.roomRef.ref.get()).data()?.timeout || 2);
    return this.timeout;
  }

}
