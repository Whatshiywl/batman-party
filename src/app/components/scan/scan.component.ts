import { Component, EventEmitter, Input, Output } from "@angular/core";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { Result } from "@zxing/library";

@Component({
  selector: 'batman-scan',
  template: `
<div *ngIf="hasCameras" class="scanner-wrapper">
  <span *ngIf="debug">{{lastScan || 'scanning...'}}</span>
  <zxing-scanner
    #scanner
    [delayBetweenScanSuccess]="delayBetweenScanSuccess"
    [autofocusEnabled]="true"
    [torch]="torch"
    (scanComplete)="onComplete($event)"
    (camerasFound)="onCameras(true)"
    (camerasNotFound)="onCameras(false)"
    (permissionResponse)="onPresmissionResponse($event)">
  </zxing-scanner>
  <fa-icon
    *ngIf="scanner.torchCompatible | async"
    class="scan-torch"
    [icon]="faBolt"
    (click)="torch = !torch">
  </fa-icon>
</div>
<div *ngIf="!hasCameras" style="font-size: 3em">No cameras found</div>
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

  > fa-icon.scan-torch {
    position: absolute;
    background-color: black;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    top: 10px;
    right: 10px;
    font-size: 1.2em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
  `]
})
export class ScanComponent {
  protected lastScan: string | undefined = undefined;
  protected faBolt = faBolt;
  protected torch: boolean = false;
  protected hasCameras: boolean = true;

  @Input() debug: boolean = false;
  @Input() delayBetweenScanSuccess: number = 2000;

  @Output() result: EventEmitter<string> = new EventEmitter();

  onComplete(result: Result) {
    const text = result?.getText();
    this.lastScan = text;
    this.result.emit(text);
  }

  onCameras(found: boolean) {
    this.hasCameras = found;
  }

  onPresmissionResponse(response: boolean) {
    if (this.hasCameras && !response) alert('Você precisa habilitar o uso da câmera para o funcionamento correto da aplicação.');
  }

}
