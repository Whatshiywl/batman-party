import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Result } from "@zxing/library";

@Component({
  selector: 'batman-scan',
  template: `
<div class="scanner-wrapper">
  <span *ngIf="debug">{{lastScan || 'scanning...'}}</span>
  <zxing-scanner
    [delayBetweenScanSuccess]="delayBetweenScanSuccess"
    [autofocusEnabled]="true"
    (scanComplete)="onComplete($event)">
  </zxing-scanner>
</div>
  `,
  styles: [`
.scanner-wrapper {
  position: relative;

  > span {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 5px 0;
    background-color: #000a;
    font-family: Helvetica, Arial, Sans-Serif;
    overflow-wrap: break-word;
  }
}
  `]
})
export class ScanComponent {
  public lastScan: string | undefined = undefined;

  @Input() debug: boolean = false;
  @Input() delayBetweenScanSuccess: number = 2000;

  @Output() result: EventEmitter<string> = new EventEmitter();

  onComplete(result: Result) {
    const text = result?.getText();
    this.lastScan = text;
    this.result.emit(text);
  }
}
