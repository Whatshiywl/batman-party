import { Directive, EventEmitter, OnDestroy, Output } from "@angular/core";
import { Subject, filter, interval, switchMap, takeUntil, tap } from "rxjs";

@Directive()
export abstract class BatmongusRoomComponent implements OnDestroy {
  @Output() timeout: EventEmitter<void> = new EventEmitter();
  private newTimeout$: Subject<number> = new Subject();
  private timeoutValue: number = 0;
  protected timeLeft: number = 0;
  protected readonly destroy$: Subject<void> = new Subject();

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

  async ngOnDestroy() {
    await this.onBeforeDestroy();
    this.destroy$.next();
    this.destroy$.complete();
    await this.onAfterDestroy();
  }

  protected async onBeforeDestroy() {}

  protected async onAfterDestroy() {}
}
