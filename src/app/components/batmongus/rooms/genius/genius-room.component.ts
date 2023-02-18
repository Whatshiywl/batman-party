import { Component, OnInit } from "@angular/core";
import { EMPTY, switchMap } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusGeniusRoomService, PlayersButton } from "./genius-room.service";


@Component({
  selector: 'batman-batmongus-genius-room',
  template: `
  <div class="batman-flex-body button-room">
    <div
    class="button-room-button"
    [class.button-room-button-pressed]="false"
    [style.BackgroundColor]="buttonColor"
    (click)="checkValidity()">
    </div>
  </div>
  `,
  styles: [`
.button-room {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 30vh;

  > .button-room-button {
    width: 20vh;
    height: 20vh;
    border-radius: 50%;

    &.button-room-button-pressed {
      filter: brightness(50%);
    }
  }
}
  `]
})


export class BatmongusGeniusRoomComponent extends BatmongusRoomComponent implements OnInit {

  buttonColor: string = 'red';
  currentPosition: number = 0;
  playersButtons: PlayersButton[] = [];
  roomLimitTime: number = 283712987;

  constructor(
    private geniusRoomService: BatmongusGeniusRoomService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setTimeout(100000000000);
    this.geniusRoomService
    .getPlayerButtons()
    .subscribe((result) => {
      if(result) {
        this.playersButtons = result.buttons;
        this.checkRoomAvailability(result.buttons);
      }
      console.log('players: ', result, this.playersButtons)});
  }

  checkRoomAvailability(playersButtons: PlayersButton[]) {
    let freeIndex: number = 0;
    let roomAvailable = playersButtons.some((button, index) => {
      freeIndex = index;
      return button.claimed < this.roomLimitTime
    });
    if(roomAvailable) this.addNewPlayer(freeIndex);
  }

  addNewPlayer(index: number) {
    console.log('vou add novo jogador');
    this.geniusRoomService.setNewPlayer(index);
  }

  checkValidity() {
    this.expectedColor().subscribe((expectedColor) => {
      if(expectedColor === this.buttonColor) {
        console.log('acertou!');
        this.geniusRoomService.setPosition(this.currentPosition + 1);
      } else {
        console.log('ixi');
        this.geniusRoomService.setPosition(0);
      }
    });
  }

  expectedColor() {
    return this.geniusRoomService
    .getCurrentPosition().pipe(
      switchMap(position => {
        if(position != undefined) {
          this.currentPosition = position;
          return this.geniusRoomService.getExpectedColor(position);
        } else {
          return EMPTY;
        }
      })
    );
  }

}
