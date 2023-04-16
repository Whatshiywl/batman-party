import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { Room } from "./rooms/room.service";

export interface Player {
  id: string;
  alive: boolean;
}

@Injectable()
export class BatmongusService {
  public readonly playersCol: AngularFirestoreCollection<Player>;
  public readonly players$: Observable<Player[]>;
  public readonly roomsCol: AngularFirestoreCollection;

  constructor(
    afs: AngularFirestore
  ) {
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

}
