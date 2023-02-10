import { Component } from "@angular/core";

@Component({
  selector: 'batman-scan-test',
  template: `
<div class="batman-flex">
  <batman-scan
    class="batman-flex-body"
    [debug]="true"
    (result)="onResult($event)"
    >
  </batman-scan>
</div>
  `
})
export class ScanTestComponent {
  onResult(value: string) {
    // Do something
  }
}
