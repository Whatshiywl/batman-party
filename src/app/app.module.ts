import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InviteComponent } from './components/invite.component';
import { ScanTestComponent } from './components/scan-test.component';
import { ScanComponent } from './components/scan.component';

@NgModule({
  declarations: [
    AppComponent,
    InviteComponent,
    ScanComponent,
    ScanTestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ZXingScannerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
