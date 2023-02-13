import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Injectable()
export class BatmongusService {

  constructor(
    private afs: AngularFirestore
  ) {
    this.init()
    .catch(err => console.error(err));
  }

  async init() {
    // const collection = await this.afs.collection('puzzles').ref.get();
    // console.log(collection.size);
  }

}
