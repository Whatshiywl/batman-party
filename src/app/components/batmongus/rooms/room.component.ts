import { Component, EventEmitter, Output } from "@angular/core";
import { interval, takeUntil, timer } from "rxjs";

@Component({
  selector: 'batman-batmongus-room',
  template: ''
})
export abstract class BatmongusRoomComponent {
  @Output() timeout: EventEmitter<void> = new EventEmitter();
  timeoutValue: number = 0;
  timeLeft: number = 0;

  protected setTimeout(value: number) {
    this.timeoutValue = value;
    this.timeLeft = Math.floor(value / 1000);
    timer(value).subscribe(() => this.timeout.emit());
    interval(1000).pipe(takeUntil(this.timeout)).subscribe(() => this.timeLeft--);
  }

  getTimeout() {
    return this.timeoutValue;
  }
}
