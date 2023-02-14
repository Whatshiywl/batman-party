import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { Puzzle } from "../../batmongus.service";

export interface BatmongusButtonRoom extends Puzzle {
  buttonStates: boolean[];
  maxButtons: number;
}

export interface ButtonState {
  pressed: boolean;
}

@Injectable()
export class BatmongusButtonRoomService {
  private roomRef: AngularFirestoreDocument<BatmongusButtonRoom>;
  private room$?: BatmongusButtonRoom;
  private buttonsCol: AngularFirestoreCollection<ButtonState>;

  constructor(
    afs: AngularFirestore
  ) {
    this.roomRef = afs.collection('puzzles/batmongus/rooms').doc('button');
    this.roomRef.valueChanges();
    this.buttonsCol = this.roomRef.collection('buttons');
  }

  pressButton(index: number) {
    return this.setButtonState(index, true);
  }

  releaseButton(index: number) {
    return this.setButtonState(index, false);
  }

  private setButtonState(index: number, pressed: boolean) {
    return this.buttonsCol.doc(index.toString()).update({ pressed });
  }

  getButton$(index: number) {
    return this.buttonsCol.doc(index.toString()).valueChanges();
  }

}
