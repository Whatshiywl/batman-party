import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";

export interface Puzzle {
  name: string;
  instructions: string;
  image: string;
  completed: boolean;
}

@Injectable()
export class BatmongusService {
  public readonly roomsCol: AngularFirestoreCollection;

  constructor(
    afs: AngularFirestore
  ) {
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
