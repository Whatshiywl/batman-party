import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InviteComponent } from './components/invite.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { CryptoService } from './shared/crypto.service';
import { SecretService } from './shared/secret.service';
import { BatmongusModule } from './components/batmongus/batmongus.module';
import { ScanModule } from './components/scan/scan.module';

@NgModule({
  declarations: [
    AppComponent,
    InviteComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    ScanModule,
    BatmongusModule
  ],
  providers: [
    CryptoService,
    SecretService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
