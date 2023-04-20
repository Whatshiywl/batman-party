import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Observable, map } from "rxjs";

export interface Room {
  name: string;
  instructions: string;
  image: string;
  completed: boolean;
  timeout: number;
}

export interface RoomSpot {
  claimedAt: number;
}

export interface RoomOptions { }

export abstract class BatmongusRoomService<
  R extends Room = Room,
  S extends RoomSpot = RoomSpot,
  O extends RoomOptions = RoomOptions
> {
  public readonly completed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected readonly roomRef: AngularFirestoreDocument<R>;
  protected readonly room$: Observable<R | undefined>;
  protected readonly spotsCol: AngularFirestoreCollection<S>;
  protected readonly spots$: Observable<S[]>;
  protected timeout: number = 0;

  constructor(
    roomName: string,
    protected afs: AngularFirestore,
  ) {
    this.roomRef = this.afs.collection('puzzles/batmongus/rooms').doc<R>(roomName);
    this.room$ = this.roomRef.valueChanges();
    this.room$.pipe(
      map(room => room?.completed || false)
    ).subscribe(completed => this.completed$.next(completed));
    this.spotsCol = this.roomRef.collection('spots');
    this.spots$ = this.spotsCol.valueChanges();
    this.getTimeout().then(timeout => this.timeout = timeout);
  }

  async claim() {
    return this.afs.firestore.runTransaction(async transaction => {
      const claimedAt = Date.now();
      const timestamp = claimedAt - this.timeout;
      const spots = await this.spotsCol.ref.where('claimedAt', '<', timestamp).get();
      if (spots.size === 0) return null;
      const doc = spots.docs[Math.floor(Math.random() * spots.size)];
      if (!doc) return null;
      const { ref } = doc;
      await transaction.get(ref);
      transaction.update(ref, { claimedAt });
      return ref;
    });
  }

  get roomState$() {
    return this.room$;
  }

  get roomSpots$() {
    return this.spots$;
  }

  get$(key: string) {
    return this.spotsCol.doc(key).valueChanges();
  }

  public setCompleted(completed: boolean) {
    return this.roomRef.update({ completed } as Partial<R>);
  }

  async getTimeout() {
    if (this.timeout) return this.timeout;
    this.timeout = 1000 * ((await this.roomRef.ref.get()).data()?.timeout || 2);
    return this.timeout;
  }

  async reset(options: O) {
    const puzzleState = (await this.getRestartPuzzleState(options)) || {} as Partial<R>;
    const room = { completed: false, ...puzzleState } as R;
    await this.roomRef.update(room);
    const snapshot = await this.spotsCol.ref.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
    const spotStates = (await this.getRestartSpotStates(options, room)) || [] as { key: string, value: Partial<S> }[];
    for (const { key, value } of spotStates) {
      await this.spotsCol.doc(key).set({ claimedAt: 0, ...value } as S);
    }
  }

  protected async getRestartPuzzleState(o: O): Promise<Partial<R>> { return { } };

  protected async getRestartSpotStates(o: O, r?: R): Promise<{ key: string, value: Partial<S> }[]> { return [ ] };

}
