import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { LocalStorageService } from "src/app/shared/local-storage.service";
import { BatmongusService } from "./batmongus.service";

@Injectable()
export class BatmongusGuard implements CanActivate {

  constructor(
    private router: Router,
    private batmongusService: BatmongusService,
    private localStorageService: LocalStorageService
  ) { }

  async canActivate(): Promise<boolean | UrlTree> {
    const batmongus = await this.batmongusService.batmongus.ref.get();
    const batmongusId = batmongus.data()?.id;
    const batmongusExcludeId = this.localStorageService.batmongusExcludeId;
    const allowed = batmongusId && batmongusId !== batmongusExcludeId;
    if (allowed) return true;
    else return this.router.parseUrl('/');
  }

}
