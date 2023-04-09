import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";

export interface Player {
  id: string;
  alive: boolean;
}

export interface Puzzle {
  name: string;
  instructions: string;
  image: string;
  completed: boolean;
  timeout: number;
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
    return snapshot.data() as Puzzle;
  }

}
