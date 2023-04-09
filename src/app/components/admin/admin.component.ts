import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { Config, ConfigService } from "src/app/shared/config.service";
import { NotificationService, Notification } from "../notification/notification.service";

interface Tab {
  name: string;
}

@Component({
  selector: 'batman-admin',
  templateUrl: 'admin.component.html',
  styleUrls: ['admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  protected tabs: Tab[] = [
    { name: 'Config' },
    { name: 'Notifications' },
    { name: 'Batmongus' },
  ];
  protected selectedTab: string = this.tabs[0].name;

  protected devConfig: {
    doc: AngularFirestoreDocument<Config>;
    valueChanges: Observable<Config | undefined>;
  };
  protected prodConfig: {
    doc: AngularFirestoreDocument<Config>;
    valueChanges: Observable<Config | undefined>;
  };

  protected notifs$: Observable<(Notification & { id: string })[]>;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
    this.devConfig = this.configService.dev;
    this.prodConfig = this.configService.prod;

    this.notifs$ = this.notificationService.collection.valueChanges({ idField: 'id' });
  }

  ngOnInit() {
    this.notificationService.block();
  }

  ngOnDestroy() {
    this.notificationService.unblock();
  }

  async onShowNotifsChange(
    doc: AngularFirestoreDocument<Config>,
    showNotifications: boolean
  ) {
    return doc.update({ showNotifications });
  }

  async onNotifChange(id: string, enabled: boolean) {
    return this.notificationService.update(id, { enabled });
  }

}
