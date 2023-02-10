import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  laughs = [
    this.genLaugh('Hahaha!'),
    this.genLaugh('HAHAHAHAHA'),
    this.genLaugh('Hahahahaha'),
    this.genLaugh('hahahaha'),
    this.genLaugh('Hahahaha!'),
    this.genLaugh('HAHAHA'),
    this.genLaugh('Hahaha!'),
    this.genLaugh('HAHAHAHAHA'),
    this.genLaugh('Hahahahaha'),
    this.genLaugh('hahahaha'),
    this.genLaugh('Hahahaha!'),
    this.genLaugh('HAHAHA'),
    this.genLaugh('Hahaha!'),
    this.genLaugh('HAHAHAHAHA'),
    this.genLaugh('Hahahahaha'),
    this.genLaugh('hahahaha'),
    this.genLaugh('Hahahaha!'),
    this.genLaugh('HAHAHA'),
  ]

  private unsub$: Subject<void> = new Subject();

  ngOnInit() {
    for (const laugh of this.laughs) {
      interval(laugh.duration * 1000).pipe(takeUntil(this.unsub$))
      .subscribe(() => {
        const pos = this.getRandomPosition();
        laugh.x = pos.x;
        laugh.y = pos.y;
      });
    }
  }

  private genLaugh(text: string) {
    return {
      text,
      ...this.getRandomPosition(),
      duration: Math.random() * 0.5 + 1
    };
  }

  private getRandomPosition() {
    return { x: Math.random()*100 - 10, y: Math.random()*100 };
  }

  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
  }
}
