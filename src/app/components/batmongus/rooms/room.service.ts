import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection, DocumentReference } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Observable, filter, map, takeUntil } from "rxjs";
import { BatmongusService } from "../batmongus.service";

export interface Room {
  name: string;
  instructions: string;
  image: string;
  completed: boolean;
  timeout: number;
  clue: string;
}

export interface RoomSpot {
  claimedAt: number;
  kill: boolean;
}

export interface RoomOptions { }

export abstract class BatmongusRoomService<
  R extends Room = Room,
  S extends RoomSpot = RoomSpot,
  O extends RoomOptions = RoomOptions
> {
  public readonly completed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected readonly roomRef: AngularFirestoreDocument<R>;
  public readonly room$: Observable<R | undefined>;
  protected readonly spotsCol: AngularFirestoreCollection<S>;
  protected readonly spots$: Observable<S[]>;
  protected spotRef: DocumentReference<S> | null = null;
  protected timeout: number = 0;

  constructor(
    roomName: string,
    protected afs: AngularFirestore,
    protected batmongusService: BatmongusService
  ) {
    this.roomRef = this.afs.collection('puzzles/batmongus/rooms').doc<R>(roomName);
    this.room$ = this.roomRef.valueChanges();
    this.room$.pipe(
      map(room => room?.completed || false)
    ).subscribe(completed => this.completed$.next(completed));
    this.spotsCol = this.roomRef.collection('spots');
    this.spots$ = this.spotsCol.valueChanges();
    this.getTimeout().then(timeout => this.timeout = timeout);
    this.batmongusService.kill$.subscribe(async () => await this.processKill());
  }

  async claim() {
    const ref = await this.afs.firestore.runTransaction(async transaction => {
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
    this.spotRef = ref;
    if (ref) {
      this.spotsCol.doc(ref.id).valueChanges().pipe(
        takeUntil(this.batmongusService.exit$),
        filter(spot => spot?.kill || false)
      ).subscribe(async () => await this.batmongusService.beKilled());
    }
    return ref;
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
      await this.spotsCol.doc(key).set({ claimedAt: 0, kill: false, ...value } as S);
    }
  }

  private async processKill() {
    if (!this.spotRef) return;
    const myId = this.spotRef.id;
    const claimedAt = Date.now();
    const timestamp = claimedAt - this.timeout;
    const spots = await this.spotsCol.ref.where('claimedAt', '>=', timestamp).get();
    const notMine = spots.docs.filter(doc => doc.id !== myId);
    if (!notMine.length) return;
    const randomSpot = notMine[Math.floor(Math.random() * notMine.length)];
    if (!randomSpot) return;
    const { ref } = randomSpot;
    await ref.update({ kill: true });
    await new Promise(r => setTimeout(r, 500));
    await ref.update({ kill: false });
  }

  protected async getRestartPuzzleState(o: O): Promise<Partial<R>> { return { } };

  protected async getRestartSpotStates(o: O, r?: R): Promise<{ key: string, value: Partial<S> }[]> { return [ ] };

}
