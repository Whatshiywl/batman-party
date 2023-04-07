import { Component, OnDestroy, OnInit } from "@angular/core";
import { Params, Router } from "@angular/router";
import { debounceTime, map, skipUntil, Subject, takeUntil, timer } from "rxjs";
import { BatmongusService, Puzzle } from "./batmongus.service";
import { BatmongusRoomComponent } from "./rooms/room.component";

@Component({
  selector: 'batman-batmongus',
  templateUrl: './batmongus.component.html',
  styleUrls: ['./batmongus.component.scss']
})
export class BatmongusComponent implements OnInit, OnDestroy {
  protected puzzle: Puzzle | undefined;
  protected scanResult: {
    path: string,
    queryParams: Params | undefined
  } | undefined;

  private scan$: Subject<string> = new Subject();
  private timeout$: Subject<void> = new Subject();

  constructor(
    private batmongusService: BatmongusService,
    private router: Router
  ) { }

  ngOnInit() {
    this.scan$.pipe(
      skipUntil(timer(1000)),
      map(value => {
        const [ pathname, queryString ] = value.split('?');
        const params = this.parseQueryString(queryString);
        return { pathname, params };
      })
    ).subscribe(({ pathname, params }) => this.enterRoom(pathname, params));
    this.timeout$.pipe(debounceTime(200)).subscribe(() => this.exitRoom());

    const { pathname } = location;
    if (pathname.includes('/rooms') && !location.search) {
      this.enterRoom(pathname);
    } else {
      this.scanResult = undefined;
    }
  }

  async onScanResult(value: string) {
    if (!value) return;
    this.scan$.next(value);
  }

  async enterRoom(path: string, queryParams?: Params) {
    const roomName = path.split('/').pop() as string;
    this.puzzle = await this.batmongusService.getRoomById(roomName);
    this.scanResult = { path, queryParams };
  }

  async onAcceptRoom() {
    this.puzzle = undefined;
    if (!this.scanResult) return;
    const { path, queryParams } = this.scanResult;
    await this.router.navigate([ path ], { queryParams });
  }

  async onRejectRoom() {
    this.puzzle = undefined;
    this.scanResult = undefined;
  }

  private parseQueryString(queryString: string): Params {
    if (!queryString) return { };
    return queryString.split('&').reduce((acc, paramPair) => {
      const [ key, value ] = paramPair.split('=');
      acc[key] = value;
      return acc;
    }, { } as Params);
  }

  async exitRoom() {
    this.scanResult = undefined;
    await this.router.navigate([ '/batmongus' ]);
  }

  onOutletActivate(component: any) {
    if (component instanceof BatmongusRoomComponent) {
      component.timeout
        .pipe(takeUntil(this.timeout$))
        .subscribe(() => this.timeout$.next());
    }
  }

  onOutletDeactivate() {
    this.timeout$.next();
  }

  ngOnDestroy(): void {
    this.scan$.complete();
    this.timeout$.next();
    this.timeout$.complete();
  }

}
