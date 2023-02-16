import { NgModule } from "@angular/core";
import { CryptoService } from "./crypto.service";
import { SecretGuard } from "./secret.guard";
import { SecretService } from "./secret.service";

@NgModule({
  providers: [
    CryptoService,
    SecretService,
    SecretGuard
  ]
})
export class SecretModule { }
