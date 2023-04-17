import { Component, OnInit } from "@angular/core";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusMemoryRoomService, MemoryOptions, MemoryRoom, MemorySpot } from "./memory-room.service";
import { CommonModule } from "@angular/common";
import { Subject, debounceTime, map, merge, takeUntil, tap } from "rxjs";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && !(completed$ | async) && ref" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body memory-room">
      <div *ngIf="ref && !(completed$ | async) && (spot$ | async) as card"
      class="memory-room-card noselect"
      [class.memory-room-card-flipped]="flipped"
      [style.display]="card.matched ? 'none' : 'flex'"
      (click)="onFlip()">
        <img *ngIf="flipped" [src]="card.image">
        <!-- {{ flipped ? card.image : ref.id }} -->
      </div>
      <div *ngIf="!(completed$ | async) && !ref">Sala cheia, volte mais tarde.</div>
      <div *ngIf="completed$ | async">Feito!</div>
    </div>
  </div>
  `,
  styles: [`
.counter {
  font-size: 25vh;
}

.memory-room {
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
    font-size: 15vh;

    &.memory-room-card {
      background-color: gray;

      > img {
        width: 100%;
      }
    }

    &.memory-room-card-flipped {
      background-color: green;
    }
  }
}
  `]
})
export class BatmongusMemoryRoomComponent extends BatmongusRoomComponent<
  MemoryRoom,
  MemorySpot,
  MemoryOptions
> implements OnInit {
  protected flipped: boolean = false;
  private readonly cardFlip: Subject<void> = new Subject();

  constructor(
    private memoryRoomService: BatmongusMemoryRoomService
  ) {
    super(memoryRoomService);
    this.cardFlip.pipe(
      takeUntil(this.destroy$),
      tap(() => this.flipped = true),
      debounceTime(2000),
    ).subscribe(() => {
      if (!this.ref) return;
      this.memoryRoomService.flipCard(this.ref.id);
    });
  }

  protected override async onAfterInit() {
    if (!this.spot$) return;
    merge(
      this.spot$.pipe(map(spot => spot?.flipped || false)),
      this.memoryRoomService.cardFlipped
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(flipped => this.flipped = flipped);
  }

  protected onFlip() {
    this.cardFlip.next();
  }

}
