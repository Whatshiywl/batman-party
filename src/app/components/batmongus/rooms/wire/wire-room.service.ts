import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { filter, first, iif, map, of, Subject, switchMap, tap } from "rxjs";
import { BatmongusRoomService, Room, RoomOptions, RoomSpot } from "../room.service";

export interface WireRoom extends Room {
  target: string;
  numberOfWires: number;
}

export interface WireSpot extends RoomSpot {
  clue: string;
  clueText: string;
  clueColor: string;
}

export interface WireOptions extends RoomOptions {
  numberOfWires: number;
}

@Injectable()
export class BatmongusWireRoomService extends BatmongusRoomService<WireRoom, WireSpot, WireOptions> {
  private readonly wireCut: Subject<string> = new Subject();
  public readonly triggered$: Subject<boolean> = new Subject();
  private numberOfWires: number = 0;

  private readonly colors = [
    'red',
    'green',
    'blue',
    'yellow',
    'purple',
    'orange',
    'cyan',
    'magenta',
    'lime',
  ];

  private readonly i18nColors = [
    'vermelho',
    'verde',
    'azul',
    'amarelo',
    'roxo',
    'laranja',
    'ciano',
    'magenta',
    'lima'
  ]

  constructor(
    afs: AngularFirestore
  ) {
    super('wire', afs);
    this.room$.subscribe(room => this.numberOfWires = room?.numberOfWires || 0);

    this.wireCut.pipe(
      switchMap(index => this.checkTriggered(index)),
      switchMap(triggered => iif(() => triggered, this.onTrigger(), of(false))),
      tap(triggered => this.triggered$.next(triggered)),
      filter(triggered => !triggered),
    ).subscribe(async () => await this.setCompleted(true));
  }

  cutWire(index: string) {
    this.wireCut.next(index);
  }

  private checkTriggered(index: string) {
    return this.room$.pipe(first(), map(room => room?.target !== index));
  }

  private onTrigger() {
    return of(null).pipe(
      switchMap(() => this.reset({ numberOfWires: this.numberOfWires })),
      map(() => true)
    );
  }

  protected override async getRestartPuzzleState({ numberOfWires }: WireOptions) {
    const wires = this.colors.slice(0, numberOfWires);
    const target = wires[Math.floor(Math.random() * wires.length)];
    return { target, numberOfWires };
  }

  protected override async getRestartSpotStates({ numberOfWires }: WireOptions, room: WireRoom) {
    const states: { key: string, value: Partial<WireSpot> }[] = [];
    const wires = this.colors
      .slice(0, numberOfWires)
      .filter(color => color !== room.target)
      .sort(() => Math.random() - 0.5);
    const dupeIndex = Math.floor(Math.random() * numberOfWires);
    const dupeClue = wires[Math.floor(Math.random() * wires.length)];
    for (let i = 0; i < numberOfWires; i++) {
      const clue = i === dupeIndex ? dupeClue : wires.pop() as string;
      const clueText = this.i18nColors[this.colors.indexOf(clue)];
      const clueColor = this.colors[Math.floor(Math.random() * numberOfWires)]
      states.push({ key: this.colors[i], value: { clue, clueText, clueColor } });
    }
    return states;
  }

}
