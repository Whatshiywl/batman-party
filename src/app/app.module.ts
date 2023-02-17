import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InviteComponent } from './components/invite.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationService } from './components/notification/notification.service';
import { LocalStorageService } from './shared/local-storage.service';
import { ConfigService } from './shared/config.service';

@NgModule({
  declarations: [
    AppComponent,
    InviteComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [
    ConfigService,
    LocalStorageService,
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
