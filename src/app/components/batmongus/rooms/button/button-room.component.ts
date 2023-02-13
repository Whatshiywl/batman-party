import { Component, OnInit } from "@angular/core";
import { BatmongusRoomComponent } from "../room.component";

@Component({
  selector: 'batman-batmongus-button-room',
  template: `
  <div class="batman-flex-body button-room">
    <div class="button-room-button"></div>
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
    background-color: red;
  }
}
  `]
})
export class BatmongusButtonRoomComponent extends BatmongusRoomComponent implements OnInit {

  ngOnInit(): void {
    this.setTimeout(10000);
  }

}
