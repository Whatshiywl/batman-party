import { Component, EventEmitter, Output } from "@angular/core";
import { timer } from "rxjs";

@Component({
  selector: 'batman-batmongus-room',
  template: ''
})
export abstract class BatmongusRoomComponent {
  @Output() timeout: EventEmitter<void> = new EventEmitter();
  timeoutValue: number = 0;

  protected setTimeout(value: number) {
    this.timeoutValue = value;
    timer(value).subscribe(() => this.timeout.emit());
  }

  getTimeout() {
    return this.timeoutValue;
  }
}
