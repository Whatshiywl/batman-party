import { Injectable } from "@angular/core";
import { SecretService } from "src/app/shared/secret.service";

@Injectable()
export class BatmongusService {

  constructor(private secretService: SecretService) {
    this.secretService.verify('birthday', '02051993').then(result => console.log(result));
  }

}
