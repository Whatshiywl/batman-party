import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { Observable, Subject } from "rxjs";
import { Room } from "./rooms/room.service";
import { LocalStorageService } from "src/app/shared/local-storage.service";

export interface Batmongus {
  id: string;
  hold: boolean;
  holdProgress: number;
  open: boolean;
}

export interface Player {
  id: string;
  alive: boolean;
}

@Injectable()
export class BatmongusService {
  public readonly batmongus: AngularFirestoreDocument<Batmongus>;
  public readonly batmongus$: Observable<Batmongus | undefined>;
  public readonly playersCol: AngularFirestoreCollection<Player>;
  public readonly players$: Observable<Player[]>;
  public readonly roomsCol: AngularFirestoreCollection;
  public readonly exit$: Subject<void> = new Subject();
  public readonly kill$: Subject<void> = new Subject();

  private batmongusId?: string;

  constructor(
    afs: AngularFirestore,
    private localStorage: LocalStorageService
  ) {
    this.batmongus = afs.doc('puzzles/batmongus');
    this.batmongus$ = this.batmongus.valueChanges();
    this.batmongus$.subscribe(batmongus => this.batmongusId = batmongus?.id);

    this.playersCol = afs.collection('puzzles/batmongus/players');
    this.players$ = this.playersCol.valueChanges();

    this.roomsCol = afs.collection('puzzles/batmongus/rooms');
  }

  async getRooms() {
    const snapshot = await this.roomsCol.ref.get();
    return snapshot.docs.map(doc => doc.id);
  }

  async getRoomById(id: string) {
    const snapshot = await this.roomsCol.doc(id).ref.get();
    return snapshot.data() as Room;
  }

  get id() {
    return this.batmongusId;
  }

  setOpen(open: boolean) {
    return this.batmongus.update({ open });
  }

  generateId() {
    const id = Math.random().toString(36).substring(2);
    return this.batmongus.update({ id });
  }

  exit() {
    this.exit$.next();
  }

  kill() {
    this.kill$.next();
  }

  async beKilled() {
    if (!this.batmongusId) return;
    this.localStorage.batmongusExcludeId = this.batmongusId;
  }

  updateHold(holdProgress: number) {
    return this.batmongus.update({
      hold: !!holdProgress,
      holdProgress
    });
  }

}
