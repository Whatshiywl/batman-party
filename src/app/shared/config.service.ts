import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { filter, Observable } from "rxjs";
import { environment } from "src/environments/environment";

export interface Config {
  showNotifications: boolean;
}

@Injectable()
export class ConfigService {
  readonly config$: Observable<Config> = new Observable();

  constructor(
    afs: AngularFirestore
  ) {
    const env = environment.production ? 'production' : 'development';
    this.config$ = afs.collection('configs').doc<Config>(env)
    .valueChanges().pipe(filter((config): config is Config => Boolean(config)));
  }

}
