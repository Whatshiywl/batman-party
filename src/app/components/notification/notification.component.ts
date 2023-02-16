import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { Notification, NotificationService } from "./notification.service";

@Component({
  selector: 'batman-notification',
  template: `
<div *ngIf="notification$ | async" class="batman-notification-panel">
  <div class="batman-notification-modal">
    <div class="batman-notification-header">
      {{ (notification$ | async)?.header }}
    </div>
    <div class="batman-notification-image">
      <img [src]="'assets/images/' + (notification$ | async)?.image">
    </div>
    <div class="batman-notification-body">
      <span>{{ (notification$ | async)?.text }}</span>
      <div class="batman-notification-button">Aceitar</div>
      <div class="batman-notification-button">Rejeitar</div>
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
    border-radius: 50px;
    box-shadow: black 5px 5px 10px;
    color: black;
    font-size: 36px;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100px $width 1fr;

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

        &:first-of-type {
          background-color: #52ab52;
        }

        &:last-of-type {
          background-color: #e75c5c;
        }
      }
    }

  }
}
  `]
})
export class NotificationComponent {
  protected readonly notification$: Observable<Notification> = new Observable();

  constructor(
    private notificationService: NotificationService
  ) {
    this.notification$ = this.notificationService.notification$;
  }

}
