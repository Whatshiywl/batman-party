import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { CryptoService } from "./crypto.service";

interface Secret {
  exists: boolean;
}

@Injectable()
export class SecretService {
  private collection: AngularFirestoreCollection<Secret>;

  constructor(
    private cryptoService: CryptoService,
    private afs: AngularFirestore
  ) {
    this.collection = this.afs.collection('secrets');
  }

  async verifyKeyValue(key: string, value: string | Object) {
    const message = typeof value === 'string' ? value : JSON.stringify(value);
    const hash = await this.cryptoService.digestText(message.toLowerCase());
    return this.verifyKeyHash(key, hash);
  }

  async verifyKeyHash(key: string, hash: string) {
    const id = `${key}_${hash}`;
    const secret = await this.collection.doc(id).ref.get();
    return secret?.exists;
  }

}
