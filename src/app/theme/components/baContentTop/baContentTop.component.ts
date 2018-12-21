import { Component } from '@angular/core';
import { GlobalState } from 'app/global.state';

@Component({
  selector: 'ba-content-top',
  styleUrls: ['./baContentTop.scss'],
  templateUrl: './baContentTop.html',
})
export class BaContentTop {
  public activePageTitle = '';

  constructor(
    public state: GlobalState,
  ) {

    /**
     * Manages breadcrumb standard link display
     * @see https://github.com/akveo/ngx-admin/issues/666
     */
    if (this.state) {
      this.state.subscribe('menu.activeLink', (activeLink) => {
        if (activeLink) {
          this.activePageTitle = activeLink.title;

          /**
           * Resets the dossier value if we are on a non-hidden route
           * A non-hidden route will normally populate the current selected Dossier to work on.
           * See canDeactivate() openConfirmDialog in dossier.component.ts which have been improved
           * to set dossier to null when saving / quitting asynchronously.
           */
          if (!activeLink.hidden) {
            this.state.dossier = null;
          }
        }
      });
    }
  }
}
