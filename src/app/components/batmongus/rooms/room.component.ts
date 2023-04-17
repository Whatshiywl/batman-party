import { Directive, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Observable, Subject, filter, first, interval, switchMap, takeUntil, tap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "./room.service";
import { DocumentReference } from "@angular/fire/compat/firestore";

@Directive()
export abstract class BatmongusRoomComponent<
  R extends Room,
  S extends RoomSpot,
  O extends RoomOptions
> implements OnInit, OnDestroy {
  @Output() timeout: EventEmitter<void> = new EventEmitter();
  private newTimeout$: Subject<number> = new Subject();
  private timeoutValue: number = 0;
  protected timeLeft: number = 0;
  protected readonly destroy$: Subject<void> = new Subject();
  protected ref?: DocumentReference<S> | null;
  protected spot$?: Observable<S | undefined>;
  protected completed$: Observable<boolean>;

  constructor(
    private roomService: BatmongusRoomService<R, S, O>
  ) {
    this.completed$ = this.roomService.completed$;
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

  async ngOnInit() {
    await this.onBeforeInit();
    const timeout = await this.roomService.getTimeout();
    this.ref = await this.roomService.claim();
    this.setTimeout(timeout);
    if (!this.ref) return;
    this.spot$ = this.roomService.get$(this.ref.id);
    this.completed$.pipe(filter(Boolean), first()).subscribe(() => this.setTimeout(3000));
    await this.onAfterInit();
  }

  protected async onBeforeInit() {}

  protected async onAfterInit() {}

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
