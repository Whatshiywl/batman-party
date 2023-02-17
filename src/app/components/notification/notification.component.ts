import { Component } from "@angular/core";
import { filter, map, Observable, switchMap } from "rxjs";
import { ConfigService } from "src/app/shared/config.service";
import { LocalStorageService } from "src/app/shared/local-storage.service";
import { Notification, NotificationService } from "./notification.service";

@Component({
  selector: 'batman-notification',
  template: `
<div *ngIf="
    (showNotifs$ | async) &&
    !(seenNotif$ | async) &&
    (notification$ | async) as notif"
  class="batman-notification-panel noselect">
  <div class="batman-notification-modal">
    <div class="batman-notification-header">
      {{ notif.header }}
    </div>
    <div class="batman-notification-image">
      <img [src]="'assets/images/' + notif.image">
    </div>
    <div class="batman-notification-body">
      <span>{{ notif.text }}</span>
      <div *ngIf="notif.type === 'announcement'"
        class="batman-notification-button batman-notification-button-accept"
        (click)="onYes(notif)">OK</div>
      <div *ngIf="notif.type === 'question'"
        class="batman-notification-button batman-notification-button-accept"
        (click)="onYes(notif)">Aceitar</div>
      <div *ngIf="notif.type === 'question'"
        class="batman-notification-button batman-notification-button-reject"
        (click)="onNo(notif)">Rejeitar</div>
    </div>
  </div>
</div>
  `,
  styles: [`
.batman-notification-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff5;
  z-index: 10;

  > .batman-notification-modal {
    $height: 90vh;
    $width: 80vw;
    position: absolute;
    top: calc((100vh - $height) / 2);
    bottom: calc((100vh - $height) / 2);
    left: calc((100vw - $width) / 2);
    right: calc((100vw - $width) / 2);
    background-color: white;
    border-radius: 5vmin;
    box-shadow: black 5px 5px 10px;
    color: black;
    font-size: 36px;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 10vmin $width 1fr;

    > .batman-notification-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    > .batman-notification-image > img {
      width: 100%;
    }

    > .batman-notification-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 0 20px;

      > span {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
      }

      > .batman-notification-button {
        padding: 5px;
        font-family: Verdana, Helvetica, Arial, sans-serif;
        font-size: 24px;

        &.batman-notification-button-accept {
          background-color: #52ab52;
        }

        &.batman-notification-button-reject {
          background-color: #e75c5c;
        }
      }
    }
  }
}
  `]
})
export class NotificationComponent {
  protected readonly showNotifs$: Observable<boolean> = new Observable();
  protected readonly seenNotif$: Observable<boolean> = new Observable();
  protected readonly notification$: Observable<Notification> = new Observable();

  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private notificationService: NotificationService
  ) {
    this.showNotifs$ = this.configService.config$.pipe(map(config => config.showNotifications));
    this.notification$ = this.notificationService.notification$;
    this.seenNotif$ = this.notification$.pipe(
      filter(notif => Boolean(notif)),
      switchMap(notif => this.localStorageService.seenNotifications$.pipe(
        map(seen => Boolean(seen[notif.name]))
      ))
    );
  }

  onYes(notification: Notification) {
    return this.notificationService.onAnswer(notification, 'yes');
  }

  onNo(notification: Notification) {
    return this.notificationService.onAnswer(notification, 'no');
  }

}
