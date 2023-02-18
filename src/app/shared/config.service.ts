import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { filter, Observable } from "rxjs";
import { environment } from "src/environments/environment";

export interface Config {
  showNotifications: boolean;
}

@Injectable()
export class ConfigService {

  readonly config$: Observable<Config>;

  private readonly configsCol: AngularFirestoreCollection<Config>;

  constructor(
    private afs: AngularFirestore
  ) {
    const env = environment.production ? 'production' : 'development';
    this.configsCol = this.afs.collection('configs');
    this.config$ = this.configsCol.doc<Config>(env).valueChanges()
    .pipe(filter((config): config is Config => Boolean(config)));
  }

  get prod() {
    const doc = this.configsCol.doc<Config>('production');
    return { doc, valueChanges: doc.valueChanges() };
  }

  get dev() {
    const doc = this.configsCol.doc<Config>('development');
    return { doc, valueChanges: doc.valueChanges() };
  }

}
