import { Component, OnDestroy, OnInit } from "@angular/core";
import { Params, Router  } from "@angular/router";
import { buffer, debounceTime, filter, interval, map, skipUntil, Subject, takeUntil, takeWhile, throttleTime, timer } from "rxjs";
import { BatmongusService } from "./batmongus.service";
import { BatmongusRoomComponent } from "./rooms/room.component";
import { Room } from "./rooms/room.service";
import { environment } from "src/environments/environment";
import { LocalStorageService } from "src/app/shared/local-storage.service";

export interface Hold {
  hold: boolean;
  progress: number;
}

@Component({
  selector: 'batman-batmongus',
  templateUrl: './batmongus.component.html',
  styleUrls: ['./batmongus.component.scss']
})
export class BatmongusComponent implements OnInit, OnDestroy {
  protected roomPreview: Room | undefined;
  protected scanResult: {
    path: string,
    queryParams: Params | undefined
  } | undefined;
  protected isProduction = environment.production;

  private scan$: Subject<string> = new Subject();
  private timeout$: Subject<void> = new Subject();
  private destroy$: Subject<void> = new Subject();

  protected showModal: boolean = false;
  protected confirmSurrender: boolean = false;

  private killClick: Subject<void> = new Subject();

  protected lost: boolean = false;
  protected lostCounter: number = 0;
  protected lostMessage: string = 'vc morreu';

  protected holding: boolean = false;
  protected holdProgress: number = 0;

  constructor(
    private batmongusService: BatmongusService,
    private localStorage: LocalStorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.scan$.pipe(
      skipUntil(timer(1000)),
      map(value => {
        const [ pathname, queryString ] = value.split('?');
        const params = this.parseQueryString(queryString);
        return { pathname, params };
      }),
      takeUntil(this.destroy$)
    ).subscribe(({ pathname, params }) => this.enterRoom(pathname, params));

    this.timeout$.pipe(
      debounceTime(200),
      takeUntil(this.destroy$),
    ).subscribe(() => this.exitRoom());

    this.killClick.pipe(
      takeUntil(this.destroy$),
      buffer(this.killClick.pipe(debounceTime(300))),
      filter(clicks => clicks.length > 1),
      throttleTime(60 * 1000),
    ).subscribe(() => this.batmongusService.kill());

    this.localStorage.batmongusExcludeId = '';

    this.localStorage.batmongusExcludeId$.pipe(
      takeUntil(this.destroy$),
      filter(Boolean)
    ).subscribe(async () => await this.lose());

    const { pathname } = location;
    if (pathname.includes('/rooms') && !location.search) {
      this.enterRoom(pathname);
    } else {
      this.scanResult = undefined;
    }

    this.batmongusService.batmongus$.pipe(
      takeUntil(this.destroy$),
      filter(Boolean)
    ).subscribe(batmongus => {
      this.holding = batmongus.hold;
      this.holdProgress = batmongus.holdProgress;
      if (this.holding) this.timeout$.next();
    });
  }

  async onScanResult(value: string) {
    if (!value) return;
    this.scan$.next(value);
  }

  async enterRoom(path: string, queryParams?: Params) {
    const roomName = path.split('/').pop() as string;
    this.roomPreview = await this.batmongusService.getRoomById(roomName);
    this.scanResult = { path, queryParams };
  }

  async onAcceptRoom() {
    this.roomPreview = undefined;
    if (!this.scanResult) return;
    const { path, queryParams } = this.scanResult;
    await this.router.navigate([ path ], { queryParams });
  }

  async onRejectRoom() {
    this.roomPreview = undefined;
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
    this.batmongusService.exit();
    await this.router.navigate([ '/batmongus' ]);
  }

  onOutletActivate(component: any) {
    if (component instanceof BatmongusRoomComponent) {
      component.timeout
        .pipe(
          takeUntil(this.timeout$),
          takeUntil(this.destroy$)
        ).subscribe(() => this.timeout$.next());
    }
  }

  onOutletDeactivate() {
    this.timeout$.next();
  }

  ngOnDestroy(): void {
    this.scan$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.timeout$.next();
    this.timeout$.complete();
  }

  toggleActionBar() {
    this.showModal = !this.showModal;
    this.confirmSurrender = false;
  }

  toggleSurrenderModal() {
    this.showModal = false;
    this.confirmSurrender = true;
  }

  async chooseSurrender() {
    this.lostMessage = 'impostor';
    await this.batmongusService.beKilled();
  }

  chooseNotSurrender() {
    this.showModal = true;
    this.confirmSurrender = false;
  }

  onKillClick() {
    this.killClick.next();
  }

  async lose() {
    this.lost = true;
    timer(0, 500).pipe(
      takeUntil(this.destroy$),
      takeWhile(value => value < 10),
    ).subscribe({
      next: value => this.lostCounter = value,
      complete: () => this.router.navigate([ '/' ])
    });
  }

  async hold() {
    const holdTime = 2 * 60 * 1000;
    const holdDt = 2000;
    const holdN = holdTime / holdDt;
    timer(0, holdDt).pipe(
      takeUntil(this.destroy$),
      map(value => 1 - (value / holdN)),
      takeWhile(value => value > 0)
    ).subscribe({
      next: async progress => await this.batmongusService.updateHold(progress),
      complete: async () => await this.batmongusService.updateHold(0)
    });
  }
}
