import { Component, OnInit } from "@angular/core";
import { Observable, filter, first } from "rxjs";
import { BatmongusRoomComponent } from "../room.component";
import { BatmongusWireRoomService, WireOptions, WireRoom, WireSpot } from "./wire-room.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'batman-batmongus-button-room',
  standalone: true,
  imports: [ CommonModule ],
  template: `
  <div class="batman-grid">
    <div *ngIf="timeLeft && ref && !(completed$ | async) && !(triggered$ | async)" class="batman-grid-header counter .noselect">{{ timeLeft }}</div>
    <div class="batman-grid-body wire-room">
      <div *ngIf="ref && !(triggered$ | async) && !(completed$ | async)"
      class="wire-room-wire noselect"
      [style.background]="ref.id"
      (click)="onCut()"></div>
      <p *ngIf="!(completed$ | async) && !(triggered$ | async) && (spot$ | async) as wire" class="wire-clue-phrase">
        Não corte o fio
        <span [style.color]="wire.clueColor">
          {{ wire.clueText }}
        </span>
      </p>
      <p *ngIf="triggered$ | async">BOOM! Tente mais uma vez...</p>
      <p *ngIf="!(completed$ | async) && !ref">Sala cheia, volte mais tarde.</p>
      <p *ngIf="completed$ | async">Feito!</p>
    </div>
  </div>
  `,
  styles: [`
@function stroke($stroke, $color) {
  $shadow: ();
  $from: $stroke*-1;
  @for $i from $from through $stroke {
   @for $j from $from through $stroke {
      $shadow: append($shadow, $i*1px $j*1px 0 $color, comma);
    }
  }
  @return $shadow;
}

@mixin stroke($stroke, $color) {
  text-shadow: stroke($stroke, $color);
}

.counter {
  font-size: 25vh;
}

.wire-room {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 30vh;

  > .wire-room-wire {
    width: 100vw;
    height: 5px;
  }

  > p {
    font-size: 15vh;
    width: 100vw;
    text-align: center;

    &.wire-clue-phrase {
      font-family: Verdana, Helvetica, Arial, sans-serif;
      font-size: 2em;

      > span {
        font-weight: bold;
        @include stroke(1, white);
      }
    }
  }
}
  `]
})
export class BatmongusWireRoomComponent extends BatmongusRoomComponent<
  WireRoom,
  WireSpot,
  WireOptions
> implements OnInit {
  protected triggered$: Observable<boolean>;

  constructor(
    private wireRoomService: BatmongusWireRoomService
  ) {
    super(wireRoomService);
    this.completed$ = this.wireRoomService.completed$;
    this.triggered$ = this.wireRoomService.triggered$;
  }

  protected override async onAfterInit(): Promise<void> {
    this.triggered$.pipe(filter(Boolean), first()).subscribe(() => this.setTimeout(3000));
  }

  protected onCut() {
    if (!this.ref) return;
    this.wireRoomService.cutWire(this.ref.id);
  }

}
