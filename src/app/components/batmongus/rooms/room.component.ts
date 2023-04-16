import { Component, EventEmitter, Output } from "@angular/core";
import { Subject, filter, interval, map, switchMap, takeUntil, tap } from "rxjs";

@Component({
  selector: 'batman-batmongus-room',
  template: ''
})
export abstract class BatmongusRoomComponent {
  @Output() timeout: EventEmitter<void> = new EventEmitter();
  private newTimeout$: Subject<number> = new Subject();
  timeoutValue: number = 0;
  timeLeft: number = 0;

  constructor() {
    this.newTimeout$.pipe(
      tap(value => {
        this.timeoutValue = value;
        this.timeLeft = Math.floor(value / 1000);
      }),
      switchMap(() => interval(1000).pipe(
        takeUntil(this.newTimeout$),
        takeUntil(this.timeout),
        tap(() => this.timeLeft--),
      )),
      filter(() => this.timeLeft <= 0),
    ).subscribe(() => this.timeout.emit());
  }

  protected setTimeout(value: number) {
    this.newTimeout$.next(value);
  }

  getTimeout() {
    return this.timeoutValue;
  }
}
