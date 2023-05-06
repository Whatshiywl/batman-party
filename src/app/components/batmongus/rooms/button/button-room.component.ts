import { Component, OnInit } from "@angular/core";
import { filter, map, merge, Observable, repeat, Subject, takeUntil, tap, timer, withLatestFrom } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusButtonRoomService, ButtonOptions, ButtonSpot } from "./button-room.service";
import { CommonModule } from "@angular/common";
import { Room } from "../room.service";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && !(completed$ | async) && ref" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body button-room">
      <div *ngIf="ref && !(completed$ | async) && (spot$ | async) as button"
      class="button-room-button noselect"
      [class.button-room-button-pressed]="button.pressed"
      [style.background]="getBackground()"
      (mousedown)="press()"
      (touchstart)="press()"
      (mouseup)="release()"
      (touchend)="release()">
        ?
      </div>
      <div *ngIf="!(completed$ | async) && !ref">Sala cheia, volte mais tarde.</div>
      <div *ngIf="completed$ | async">{{ (buttonRoomService.room$ | async)?.clue }}</div>
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
export class BatmongusButtonRoomComponent extends BatmongusRoomComponent<
  Room,
  ButtonSpot,
  ButtonOptions
> implements OnInit {
  protected pressing: boolean = false;
  protected progress: number = 0;
  private readonly dt = 100;
  private readonly timeToPress = 5000;
  private readonly stop$: Subject<void> = new Subject();
  private readonly start$: Subject<void> = new Subject();

  constructor(
    protected buttonRoomService: BatmongusButtonRoomService
  ) {
    super(buttonRoomService);
  }

  override async onAfterInit() {
    if (!this.ref || !this.spot$) return;

    timer(0, this.dt).pipe(
      tap(_ => {
        if (!this.pressing) this.progress = 0;
      }),
      filter(() => this.pressing),
      map(p => Math.min(p * this.dt / this.timeToPress, 1)),
      takeUntil(merge(this.start$, this.stop$)),
      repeat(),
      tap(progress => this.progress = progress),
      withLatestFrom(this.spot$),
      takeUntil(this.destroy$)
    ).subscribe(([ progress, button ]) => {
      if (!button || !this.ref) return;
      if (!button.pressed && progress === 1)
        this.buttonRoomService.pressButton(this.ref.id);
      else if (button.pressed && progress < 1)
        this.buttonRoomService.releaseButton(this.ref.id);
    });
  }

  protected override async onBeforeDestroy() {
    this.pressing = false;
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
