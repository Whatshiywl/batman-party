import { Component, OnInit } from "@angular/core";
import { Observable, Subject, filter, map, of, switchMap, takeUntil, tap, timer } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusGeniusRoomService, GeniusOptions, GeniusRoom, GeniusSpot } from "./genius-room.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && !(completed$ | async) && ref" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body button-room">
      <div *ngIf="!(completed$ | async) && ref"
      class="button-room-button noselect"
      [class.switch-room-switch-pressed]="highlighted"
      [style.background]="'linear-gradient(#000a, #000a), linear-gradient(' + ref.id + ', ' + ref.id + ')'"
      (click)="onPress()">
        ?
      </div>
      <div *ngIf="!(completed$ | async) && !ref">Sala cheia, volte mais tarde.</div>
      <div *ngIf="completed$ | async">{{ (geniusRoomService.room$ | async)?.clue }}</div>
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
    background-blend-mode: darken;

    &.switch-room-switch-pressed {
      background-blend-mode: screen;
    }
  }
}
  `]
})
export class BatmongusGeniusRoomComponent extends BatmongusRoomComponent<
  GeniusRoom,
  GeniusSpot,
  GeniusOptions
> implements OnInit {
  protected highlighted: boolean = false;
  private highlightCooldown: boolean = false;
  private buttonPress$: Subject<void> = new Subject();

  constructor(
    protected geniusRoomService: BatmongusGeniusRoomService
  ) {
    super(geniusRoomService);
  }

  override async onAfterInit() {
    if (!this.ref) return;
    const myColor = this.ref.id;
    this.geniusRoomService.showColor$.pipe(
      takeUntil(this.destroy$),
      map(color => color === myColor),
      filter(isMe => isMe),
      switchMap(() => this.highlight()),
      switchMap(() => this.geniusRoomService.updateShowPosition())
    ).subscribe();
    this.buttonPress$.pipe(
      takeUntil(this.destroy$),
      filter(() => !this.highlightCooldown),
      tap(() => this.geniusRoomService.pressButton(myColor)),
      switchMap(() => this.highlight()),
    ).subscribe();
  }

  protected onPress() {
    this.buttonPress$.next();
  }

  private highlight(): Observable<0>;
  private highlight(sleepBefore: number): Observable<0>;
  private highlight(sleepBefore: number, sleepAfter: number): Observable<0>;
  private highlight(sleepBefore?: number, sleepAfter?: number): Observable<0> {
    sleepBefore = typeof sleepBefore === 'undefined' ? 500 : sleepBefore;
    sleepAfter = typeof sleepAfter === 'undefined' ? sleepBefore : sleepAfter;
    return of(null).pipe(
      tap(() => this.highlightCooldown = true),
      tap(() => this.highlighted = true),
      switchMap(() => timer(sleepBefore as number)),
      tap(() => this.highlighted = false),
      switchMap(() => timer(sleepAfter as number)),
      tap(() => this.highlightCooldown = false),
    );
  }

}
