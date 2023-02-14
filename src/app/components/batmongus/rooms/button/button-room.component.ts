import { Component, OnInit } from "@angular/core";
import { DocumentReference } from "@angular/fire/compat/firestore";
import { filter, map, merge, Observable, repeat, Subject, takeUntil, tap, timer, withLatestFrom } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusButtonRoomService, ButtonState } from "./button-room.service";

@Component({
  selector: 'batman-batmongus-button-room',
  template: `
  <div class="batman-flex-body button-room">
    <div *ngIf="ref"
    class="button-room-button noselect"
    [class.button-room-button-pressed]="(button$ | async)?.pressed"
    [style.background]="getBackground()"
    (mousedown)="press()"
    (touchstart)="press()"
    (mouseup)="release()"
    (touchend)="release()">
      {{ ref.id }}
    </div>
    <div *ngIf="ref === null">This room is full</div>
  </div>
  `,
  styles: [`
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
export class BatmongusButtonRoomComponent extends BatmongusRoomComponent implements OnInit {
  protected button$?: Observable<ButtonState | undefined>;
  protected ref?: DocumentReference<ButtonState> | null;
  protected pressing: boolean = false;
  protected progress: number = 0;
  private readonly dt = 100;
  private readonly timeToPress = 5000;
  private readonly stop$: Subject<void> = new Subject();
  private readonly start$: Subject<void> = new Subject();

  constructor(
    private buttonRoomService: BatmongusButtonRoomService
  ) {
    super();
  }

  async ngOnInit() {
    const timeoutValue = 10000;
    this.ref = await this.buttonRoomService.claim(timeoutValue);
    this.setTimeout(this.ref ? timeoutValue : 2000);
    if (!this.ref) {
      this.ref = null;
      return;
    };
    this.button$ = this.buttonRoomService.getButton$(this.ref.id);

    timer(0, this.dt).pipe(
      tap(p => {
        if (!this.pressing) this.progress = 0;
      }),
      filter(() => this.pressing),
      map(p => Math.min(p * this.dt / this.timeToPress, 1)),
      takeUntil(merge(this.start$, this.stop$)),
      repeat(),
      tap(progress => this.progress = progress),
      withLatestFrom(this.button$)
    ).subscribe(async ([ progress, button ]) => {
      if (!button || !this.ref) return;
      if (!button.pressed && progress === 1)
        await this.buttonRoomService.pressButton(this.ref.id);
      else if (button.pressed && progress < 1)
        await this.buttonRoomService.releaseButton(this.ref.id);
    });
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
