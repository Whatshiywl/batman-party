import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BatmongusService } from "./batmongus.service";

@Component({
  selector: 'batman-batmongus',
  templateUrl: './batmongus.component.html',
  styleUrls: ['./batmongus.component.scss']
})
export class BatmongusComponent {
  protected scanResult: string | undefined;

  constructor(
    private batmongusService: BatmongusService,
    private router: Router
  ) { }

  onScanResult(value: string) {
    console.log('batmongus scanned value', value);
    if (!value) return;
    this.scanResult = value;
    this.router.navigate([ value ]);
    setTimeout(() => {
      this.exitRoom();
    }, 10000);
  }

  exitRoom() {
    this.scanResult = undefined;
    this.router.navigate([ '/batmongus' ]);
  }

}
