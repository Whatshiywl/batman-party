import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type SeenNotifications = Record<string, boolean>;

@Injectable()
export class LocalStorageService {

  static readonly INTERNAL_ID: string = 'batman-party.internal-id';
  static readonly SEEN_NOTIFICATIONS: string = 'batman-party.seen-notifications';

  readonly internalId$: BehaviorSubject<string>;
  readonly seenNotifications$: BehaviorSubject<SeenNotifications>;

  constructor() {
    this.internalId$ = new BehaviorSubject(this.internalId);
    this.seenNotifications$ = new BehaviorSubject(this.seenNotifications);
  }

  get internalId() {
    return this.getString(LocalStorageService.INTERNAL_ID);
  }

  set internalId(id: string) {
    this.setString(LocalStorageService.INTERNAL_ID, id, false);
    this.internalId$.next(this.internalId);
  }

  get seenNotifications() {
    return this.getObject(LocalStorageService.SEEN_NOTIFICATIONS);
  }

  set seenNotifications(names: SeenNotifications) {
    this.setObject(LocalStorageService.SEEN_NOTIFICATIONS, names);
    this.seenNotifications$.next(this.seenNotifications);
  }

  private getObject<T>(key: string) {
    return JSON.parse(this.getString(key) || '{}') as T;
  }

  private setObject(key: string, values: object, replace: boolean = false) {
    this.setString(key, JSON.stringify(values), replace);
  }

  private getString(key: string) {
    return localStorage.getItem(key) || '';
  }

  private setString(key: string, value: string, replace: boolean = true) {
    if (!replace && localStorage.getItem(key)) return;
    localStorage.setItem(key, value);
  }
}
