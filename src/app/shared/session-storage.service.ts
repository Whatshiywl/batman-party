import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type SeenNotifications = Record<string, boolean>;

@Injectable()
export class SessionStorageService {

  static readonly FUEL: string = 'batman-party.fuel';

  readonly fuel$: BehaviorSubject<number>;

  constructor() {
    this.fuel$ = new BehaviorSubject(this.fuel);
  }

  get fuel() {
    return this.getNumber(SessionStorageService.FUEL);
  }

  set fuel(value: number) {
    this.setNumber(SessionStorageService.FUEL, value);
    this.fuel$.next(this.fuel);
  }
  private getObject<T>(key: string) {
    return JSON.parse(this.getString(key) || '{}') as T;
  }

  private setObject(key: string, values: object, replace: boolean = false) {
    this.setString(key, JSON.stringify(values), replace);
  }

  private getString(key: string) {
    return sessionStorage.getItem(key) || '';
  }

  private setString(key: string, value: string, replace: boolean = true) {
    if (!replace && sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, value);
  }

  private getNumber(key: string) {
    return +(sessionStorage.getItem(key) || 0);
  }

  private setNumber(key: string, value: number, replace: boolean = true) {
    if (!replace && sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, value.toString());
  }
}
