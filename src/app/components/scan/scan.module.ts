import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScanTestComponent } from './scan-test.component';
import { ScanComponent } from './scan.component';

const routes: Route[] = [
  {
    path: '',
    component: ScanTestComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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
export class ScanModule { }
