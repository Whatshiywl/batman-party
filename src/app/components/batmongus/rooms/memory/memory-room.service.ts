import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { filter, map, mergeMap, Subject, switchMap, tap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";
import { BatmongusService } from "../../batmongus.service";

export interface MemoryRoom extends Room {
}

export interface MemorySpot extends RoomSpot {
  flipped: boolean;
  matched: boolean;
  image: string;
}

export interface MemoryOptions extends RoomOptions {
  numberOfPairs: number;
}

const images: string[] = [
  '/assets/images/cane.jpeg',
  '/assets/images/glasses.jpeg',
  '/assets/images/questionmark.jpeg',
  '/assets/images/tophat.jpeg',
];

@Injectable()
export class BatmongusMemoryRoomService extends BatmongusRoomService<MemoryRoom, MemorySpot, MemoryOptions> {
  private readonly cardFlip: Subject<string> = new Subject();
  public readonly cardFlipped: Subject<boolean> = new Subject();

  constructor(
    afs: AngularFirestore,
    batmongusService: BatmongusService
  ) {
    super('memory', afs, batmongusService);

    this.cardFlip.pipe(
      mergeMap(index => this.processFlip(index)),
      tap(result => this.cardFlipped.next(result.flipped)),
      filter(result => result.matched),
      switchMap(() => this.spotsCol.get()),
      map(snapshot => snapshot.docs.map(doc => doc.data())),
      map(cards => {
        return cards.every(card => {
          if (!card.matched) return false;
          return true;
        });
      })
    ).subscribe(async completed => await this.setCompleted(completed));
  }

  flipCard(index: string) {
    this.cardFlip.next(index);
  }

  private processFlip(index: string) {
    return this.afs.firestore.runTransaction(async transaction => {
      const snapshot = await this.spotsCol.ref.get();
      const cardFlipped = (await Promise.all(snapshot.docs
        .map(({ id }) => this.spotsCol.doc(id).ref)
        .map(ref => transaction.get(ref))))
        .filter(doc => doc.data()?.flipped);
      await new Promise(r => setTimeout(r, 1000));
      if (!cardFlipped.length) {
        transaction.update(this.spotsCol.doc(index).ref, { flipped: true });
        return { flipped: true, matched: false };
      } else if(cardFlipped.length === 1) {
        const [ doc ] = cardFlipped;
        const card = doc.data();
        if (!card) return { flipped: false, matched: false };
        const thisCard = await transaction.get(this.spotsCol.doc(index).ref);
        const image = thisCard.data()?.image;
        const isSameImage = card.image === image;
        if (isSameImage) {
          transaction.update(this.spotsCol.doc(index).ref, { flipped: false, matched: true });
          transaction.update(this.spotsCol.doc(doc.id).ref, { flipped: false, matched: true });
          return { flipped: false, matched: true };
        } else {
          transaction.update(this.spotsCol.doc(index).ref, { flipped: false });
          transaction.update(this.spotsCol.doc(doc.id).ref, { flipped: false });
          return { flipped: false, matched: false };
        }
      } else {
        return { flipped: false, matched: false };
      }
    });
  }

  protected override async getRestartSpotStates({ numberOfPairs }: MemoryOptions) {
    const imagePool = [...images].sort(() => Math.random() - 0.5);
    const states: { key: string, value: Partial<MemorySpot> }[] = [];
    for (let i = 0; i < numberOfPairs; i++) {
      const image = imagePool.pop();
      states.push({ key: `${i}_1`, value: { flipped: false, matched: false, image } });
      states.push({ key: `${i}_2`, value: { flipped: false, matched: false, image } });
    }
    return states;
  }

}
