import { Component } from '@angular/core';

import { GlobalState } from '../../../global.state';

@Component({
  selector: 'ba-page-top',
  templateUrl: './baPageTop.html',
  styleUrls: ['./baPageTop.scss']
})
export class BaPageTop {
  public isScrolled = false;
  public isMenuCollapsed = false;

  constructor(private _state: GlobalState) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    return false;
  }

  // Triggers an afterViewChecked error on Firefox on Linux only
  public scrolledChanged(isScrolled) {
    // this.isScrolled = isScrolled;
  }
}
