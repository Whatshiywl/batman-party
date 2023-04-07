import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { LocalStorageService } from './shared/local-storage.service';

interface Laugh {
  text: string;
  x: number;
  y: number;
  duration: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  laughs: Laugh[] = [ ];

  private unsub$: Subject<void> = new Subject();

  constructor(localStorageService: LocalStorageService) {
    const id = Math.random().toString(36).substring(2);
    localStorageService.internalId = id;
  }

  ngOnInit() {
    this.laughs.push(...this.genLaughs('Hahaha!', 4));
    this.laughs.push(...this.genLaughs('HAHAHAHAHA', 4));
    this.laughs.push(...this.genLaughs('Hahahahaha', 4));
    this.laughs.push(...this.genLaughs('hahahaha', 4));
    this.laughs.push(...this.genLaughs('Hahahaha!', 4));
    this.laughs.push(...this.genLaughs('HAHAHA', 4));

    for (const laugh of this.laughs) {
      interval(laugh.duration * 1000).pipe(takeUntil(this.unsub$))
      .subscribe(() => {
        const pos = this.getRandomPosition();
        laugh.x = pos.x;
        laugh.y = pos.y;
      });
    }
  }

  private genLaughs(text: string, count: number) {
    const laughs = [];
    for (let i = 0; i < count; i++) {
      laughs.push(this.genLaugh(text));
    }
    return laughs;
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
