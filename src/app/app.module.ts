import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InviteComponent } from './components/invite.component';
import { ScanComponent } from './components/scan.component';

@NgModule({
  declarations: [
    AppComponent,
    InviteComponent,
    ScanComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
