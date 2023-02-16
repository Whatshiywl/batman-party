import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { filter, map, Observable } from "rxjs";

export interface Notification {
  enabled: boolean;
  header: string;
  image: string;
  text: string;
}

@Injectable()
export class NotificationService {
  public readonly notification$: Observable<Notification> = new Observable();

  constructor(
    private afs: AngularFirestore
  ) {
    const collection = this.afs.collection<Notification>('notifications');
    this.notification$ = collection.valueChanges().pipe(
      map(notifications => notifications.filter(notification => notification.enabled)[0])
    );
  }

}
