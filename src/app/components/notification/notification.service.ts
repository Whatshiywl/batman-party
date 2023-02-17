import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { LocalStorageService } from "src/app/shared/local-storage.service";

export interface Notification {
  name: string;
  enabled: boolean;
  header: string;
  image: string;
  text: string;
  type: 'announcement' | 'question';
  yes: string[];
  no: string[];
}

@Injectable()
export class NotificationService {
  public readonly notification$: Observable<Notification> = new Observable();

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    const collection = this.afs.collection<Notification>('notifications');
    this.notification$ = collection.valueChanges().pipe(
      map(notifications => notifications.filter(notification => notification.enabled)[0])
    );
  }

  async onAnswer(notification: Notification, answer: 'yes' | 'no') {
    const directives = notification[answer];
    if (!directives) return;
    for (const directive of directives) {
      const args = directive.split(' ');
      switch (args[0]) {
        case 'redirect':
          await this.onRedirect(args[1]);
          break;
      }
    }
    const notifs = this.localStorageService.seenNotifications;
    notifs[notification.name] = true;
    this.localStorageService.seenNotifications = notifs;
  }

  private onRedirect(path: string) {
    return this.router.navigate([ path ]);
  }

}
