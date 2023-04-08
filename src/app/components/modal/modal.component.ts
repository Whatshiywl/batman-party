import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'batman-modal',
  template: `
<div class="batman-modal-panel noselect">
  <div class="batman-modal-modal">
    <div *ngIf="header" class="batman-modal-header">
      {{ header }}
    </div>
    <div *ngIf="image" class="batman-modal-image">
      <img [src]="'assets/images/' + image">
    </div>
    <div class="batman-modal-body">
      <span>{{ text }}</span>
      <div *ngIf="type === 'announcement'"
        class="batman-modal-button batman-modal-button-accept"
        (click)="ok.emit()">{{ okButton || 'OK' }}</div>
      <div *ngIf="type === 'question'"
        class="batman-modal-button batman-modal-button-accept"
        (click)="accept.emit()">{{ acceptButton || 'Aceitar' }}</div>
      <div *ngIf="type === 'question'"
        class="batman-modal-button batman-modal-button-reject"
        (click)="reject.emit()">{{ rejectButton || 'Rejeitar' }}</div>
    </div>
  </div>
</div>
  `,
  styles: [`
.batman-modal-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff5;
  z-index: 10;
  font-family: Verdana, Helvetica, Arial, sans-serif;

  > .batman-modal-modal {
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

    > .batman-modal-header {
      grid-row: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    > .batman-modal-image > img {
      grid-row: 2;
      width: 100%;
    }

    > .batman-modal-body {
      grid-row: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 0 20px;

      > span {
        font-size: 18px;
        text-align: center;
      }

      > .batman-modal-button {
        padding: 5px;
        font-size: 24px;

        &.batman-modal-button-accept {
          background-color: #52ab52;
        }

        &.batman-modal-button-reject {
          background-color: #e75c5c;
        }
      }
    }
  }
}
  `]
})
export class ModalComponent {
  @Input() header: string = '';
  @Input() image: string = '';
  @Input() text: string = '';
  @Input() type: 'announcement' | 'question' = 'announcement';
  @Input() okButton: string = '';
  @Input() acceptButton: string = '';
  @Input() rejectButton: string = '';

  @Output() ok: EventEmitter<void> = new EventEmitter();
  @Output() accept: EventEmitter<void> = new EventEmitter();
  @Output() reject: EventEmitter<void> = new EventEmitter();

}
