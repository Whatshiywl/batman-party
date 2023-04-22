import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { Result } from "@zxing/library";

@Component({
  selector: 'batman-scan',
  template: `
<div *ngIf="devices === undefined || hasDevices" class="scanner-wrapper">
  <div *ngIf="debug" class="debug-controls normal-font">
    <div class="debug-control-line">
      <input type="text" [formControl]="lastScanControl">
      <button (click)="onScan()">Scan</button>
    </div>
    <div class="debug-control-line">
      <select #deviceSelect>
        <option *ngFor="let device of devices | keyvalue" [value]="device.key">{{ getDeviceLabel(device.key) }}</option>
      </select>
      <button (click)="scanner.device = getDevice(deviceSelect.value)">Change device</button>
    </div>
  </div>
  <zxing-scanner
    #scanner
    [delayBetweenScanSuccess]="delayBetweenScanSuccess"
    [autofocusEnabled]="true"
    [torch]="torch"
    (scanComplete)="onComplete($event)"
    (camerasFound)="onCameras($event)"
    (camerasNotFound)="onCameras([])"
    (permissionResponse)="onPresmissionResponse($event)">
  </zxing-scanner>
  <fa-icon
    *ngIf="scanner.torchCompatible | async"
    class="scan-torch"
    [icon]="faBolt"
    (click)="torch = !torch">
  </fa-icon>
</div>
<div *ngIf="devices !== undefined && !hasDevices" style="font-size: 3em">No cameras found</div>
  `,
  styles: [`
.scanner-wrapper {
  position: relative;

  > .debug-controls {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 5px 0;
    background-color: #000a;
    overflow-wrap: break-word;

    > .debug-control-line {
      display: flex;

      input, select {
        flex-grow: 1;
      }
    }
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
  protected lastScanControl: FormControl;
  protected lastScan: string | undefined = undefined;
  protected faBolt = faBolt;
  protected torch: boolean = false;
  protected devices: Record<string, MediaDeviceInfo> | undefined;
  protected device: MediaDeviceInfo | undefined;

  @Input() debug: boolean = false;
  @Input() delayBetweenScanSuccess: number = 2000;

  @Output() result: EventEmitter<string> = new EventEmitter();

  constructor(
    private fb: FormBuilder
  ) {
    this.lastScanControl = this.fb.control('');
  }

  onComplete(result: Result) {
    const text = result?.getText();
    if (!text) return;
    this.storeLastScanAndEmit(text);
  }

  private storeLastScanAndEmit(text: string) {
    this.lastScanControl.setValue(text);
    this.result.emit(text);
  }

  onCameras(found: MediaDeviceInfo[]) {
    this.devices = found.reduce((devices, device) => {
      devices[device.deviceId] = device;
      return devices;
    }, {} as Record<string, MediaDeviceInfo>);
  }

  onPresmissionResponse(response: boolean) {
    if (this.devices !== undefined && this.hasDevices() && !response) alert('Você precisa habilitar o uso da câmera para o funcionamento correto da aplicação.');
  }

  hasDevices() {
    return this.devices !== undefined && Object.keys(this.devices).length;
  }

  getDevice(deviceId: string) {
    return this.devices?.[deviceId];
  }

  getDeviceLabel(deviceId: string) {
    return this.devices?.[deviceId]?.label;
  }

  onScan() {
    const text = this.lastScanControl.value;
    this.storeLastScanAndEmit(text);
  }

}
