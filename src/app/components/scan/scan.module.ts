import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScanTestComponent } from './scan-test.component';
import { ScanComponent } from './scan.component';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    ZXingScannerModule,
  ],
  declarations: [
    ScanComponent,
    ScanTestComponent
  ],
  exports: [
    ScanComponent,
    ScanTestComponent
  ]
})
export class ScanModule {
  static asRouted() {
    return RoutedScanModule;
  }
}

@NgModule({
  imports: [
    ScanModule,
    RouterModule.forChild([
      {
        path: '',
        component: ScanTestComponent
      }
    ])
  ],
  exports: [
    ScanComponent,
    ScanTestComponent
  ]
})
class RoutedScanModule { }
