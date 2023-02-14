import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Puzzle } from "../../batmongus.service";

export interface BatmongusButtonRoom extends Puzzle {
  maxButtons: number;
}

export interface ButtonState {
  claimedAt: number;
  pressed: boolean;
}

@Injectable()
export class BatmongusButtonRoomService {
  private buttonsCol: AngularFirestoreCollection<ButtonState>;

  constructor(
    private afs: AngularFirestore
  ) {
    const roomRef = this.afs.collection('puzzles/batmongus/rooms').doc<BatmongusButtonRoom>('button');
    this.buttonsCol = roomRef.collection('buttons');
  }

  async claim(timeout: number) {
    return this.afs.firestore.runTransaction(async transaction => {
      const claimedAt = Date.now();
      const timestamp = claimedAt - timeout;
      const buttons = await this.buttonsCol.ref.where('claimedAt', '<', timestamp).get();
      const doc = buttons.docs[Math.floor(Math.random() * buttons.size)];
      if (!doc) return;
      const { ref } = doc;
      await transaction.get(ref);
      transaction.update(ref, { claimedAt, pressed: false });
      return ref;
    });
  }

  pressButton(index: string) {
    return this.setButtonState(index, true);
  }

  releaseButton(index: string) {
    return this.setButtonState(index, false);
  }

  private setButtonState(index: string, pressed: boolean) {
    return this.buttonsCol.doc(index).update({ pressed });
  }

  getButton$(index: string) {
    return this.buttonsCol.doc(index).valueChanges();
  }

}
