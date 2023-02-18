import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { map } from "rxjs";
import { Puzzle } from "../../batmongus.service";

export interface PlayersButton {
  claimed: number;
  color: string;
}

export interface BatmongusGeniusRoom extends Puzzle {
  length: number;
  position: number;
  order: string[];
  buttons: PlayersButton[];
}

export interface ButtonState {
  color: string;
}

@Injectable()
export class BatmongusGeniusRoomService {
  private roomRef: AngularFirestoreDocument<BatmongusGeniusRoom>;
  private room$?: BatmongusGeniusRoom;
  private orderCol: AngularFirestoreCollection<ButtonState>;

  constructor(
    afs: AngularFirestore
  ) {
    this.roomRef = afs.collection('puzzles/batmongus/rooms').doc('genius');
    this.roomRef.valueChanges();
    this.orderCol = this.roomRef.collection('order');
  }

  //
  pressButton(index: number) {
    //return this.setButtonState(index, true);
  }

  getLength() {
    return this.roomRef.get().pipe(
      map(result => result.data()?.length)
    );
  }

  getCurrentPosition() {
    return this.roomRef.get().pipe(
      map(result => result.data()?.position)
    );
  }

  getExpectedColor(index: number) {
    return this.roomRef.get().pipe(
      map(result => result.data()?.order[index])
    );
  }

  getPlayerButtons() {
    return this.roomRef.get().pipe(
      map(result => result.data())
    );
  }

  setPosition(index: number) {
    return this.roomRef.update({ position: index });
  }

  setNewPlayer(index: number) {

  }

  getButton$(index: number) {
    return this.orderCol.doc(index.toString()).valueChanges();
  }

}
