import { Component, OnDestroy, OnInit } from "@angular/core";
import { DocumentReference } from "@angular/fire/compat/firestore";
import { filter, map, merge, Observable, repeat, Subject, takeUntil, tap, timer, withLatestFrom } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusButtonRoomService, ButtonState } from "./button-room.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body button-room">
      <div *ngIf="!(completed$ | async) && ref"
      class="button-room-button noselect"
      [class.button-room-button-pressed]="(button$ | async)?.pressed"
      [style.background]="getBackground()"
      (mousedown)="press()"
      (touchstart)="press()"
      (mouseup)="release()"
      (touchend)="release()">
        ?
      </div>
      <div *ngIf="!(completed$ | async) && ref === null">This room is full</div>
      <div *ngIf="completed$ | async">Done!</div>
    </div>
  </div>
  `,
  styles: [`
.counter {
  font-size: 25vh;
}

.button-room {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 30vh;

  > div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20vh;
    height: 20vh;
    border-radius: 50%;
    font-size: 15vh;
    background-blend-mode: screen;

    &.button-room-button-pressed {
      background-color: #800;
    }
  }
}
  `]
})
export class BatmongusButtonRoomComponent extends BatmongusRoomComponent implements OnInit, OnDestroy {
  protected button$?: Observable<ButtonState | undefined>;
  protected completed$: Observable<boolean>;
  protected ref?: DocumentReference<ButtonState> | null;
  protected pressing: boolean = false;
  protected progress: number = 0;
  private readonly dt = 100;
  private readonly timeToPress = 5000;
  private readonly stop$: Subject<void> = new Subject();
  private readonly start$: Subject<void> = new Subject();
  private readonly destroy$: Subject<void> = new Subject();

  constructor(
    private buttonRoomService: BatmongusButtonRoomService
  ) {
    super();
    this.completed$ = this.buttonRoomService.completed$;
  }

  async ngOnInit() {
    const timeout = await this.buttonRoomService.getTimeout();
    this.ref = await this.buttonRoomService.claim();
    this.setTimeout(timeout);
    if (!this.ref) {
      this.ref = null;
      return;
    };
    this.button$ = this.buttonRoomService.getButton$(this.ref.id);

    timer(0, this.dt).pipe(
      tap(_ => {
        if (!this.pressing) this.progress = 0;
      }),
      filter(() => this.pressing),
      map(p => Math.min(p * this.dt / this.timeToPress, 1)),
      takeUntil(merge(this.start$, this.stop$)),
      repeat(),
      tap(progress => this.progress = progress),
      withLatestFrom(this.button$),
      takeUntil(this.destroy$)
    ).subscribe(([ progress, button ]) => {
      if (!button || !this.ref) return;
      if (!button.pressed && progress === 1)
        this.buttonRoomService.pressButton(this.ref.id);
      else if (button.pressed && progress < 1)
        this.buttonRoomService.releaseButton(this.ref.id);
    });
  }

  ngOnDestroy() {
    this.pressing = false;
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected press() {
    this.pressing = true;
    this.start$.next();
  }

  protected async release() {
    this.pressing = false;
    this.stop$.next();
  }

  protected getBackground() {
    const deg = 360 * this.progress;
    return this.progress < 1 ? `
      conic-gradient(#800 ${deg}deg, red 0),
      radial-gradient(red 50%, transparent 0)
    ` : '';
  }

}
