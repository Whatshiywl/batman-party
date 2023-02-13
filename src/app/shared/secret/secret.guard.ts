import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { environment } from "src/environments/environment";
import { SecretService } from "./secret.service";

@Injectable()
export class SecretGuard implements CanActivate {

  constructor(
    private router: Router,
    private secretService: SecretService
  ) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!environment.production) return true;
    const [ pathname ] = state.url.split('?');
    const local = localStorage.getItem(pathname);
    if (local === 'allowed') {
      localStorage.removeItem(pathname);
      return true;
    }
    const { rejectTo } = route.data;
    const { secretKey, secretHash } = route.queryParams;
    if (!secretKey || !secretHash) return this.reject(rejectTo);
    const valid = await this.secretService.verifyKeyHash(secretKey, secretHash);
    if (!valid) return this.reject(rejectTo);
    return this.allow(pathname);
  }

  private allow(pathname: string) {
    localStorage.setItem(pathname, 'allowed');
    return this.router.parseUrl(pathname);
  }

  private reject(pathname: string) {
    return pathname ? this.router.parseUrl(pathname) : false;
  }

}
