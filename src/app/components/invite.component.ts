import { Component } from "@angular/core";

@Component({
  selector: 'batman-invite',
  template: `
<div class="invite">
  <img src="assets/images/invite.jpeg">
</div>
  `,
  styles: [`
.invite {
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    z-index: 1;
    max-height: 100vh;
    max-width: 100vw;
  }
}
  `]
})
export class InviteComponent { }
