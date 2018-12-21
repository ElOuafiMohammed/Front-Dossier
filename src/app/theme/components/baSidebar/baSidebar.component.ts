import { AfterViewInit, Component, DoCheck, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { GlobalState } from '../../../global.state';
import { layoutSizes } from '../../../theme';

@Component({
  selector: 'ba-sidebar',
  templateUrl: './baSidebar.html',
  styleUrls: ['./baSidebar.scss']
})
export class BaSidebar implements OnInit, AfterViewInit, OnDestroy, DoCheck {
  public menuHeight: number;
  public isMenuCollapsed = false;
  public isMenuShouldCollapsed = false;
  protected _onRouteChange: Subscription;
  connected: boolean;
  constructor(
    private _elementRef: ElementRef,
    private _state: GlobalState,
    private _router: Router
  ) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
    this._state.subscribe('connected', (isConnected) => {
      this.connected = isConnected;
    });
  }

  public ngOnInit(): void {
    // Manage the state of the menu
    if (window.localStorage.getItem('isMenuCollapsed')) {
      const currentMenuState = JSON.parse(window.localStorage.getItem('isMenuCollapsed')) as boolean;
      this.menuCollapseStateChange(currentMenuState);
    }

    if (this._shouldMenuCollapse()) {
      this.menuCollapse();
    }

  }

  public ngAfterViewInit(): void {
    setTimeout(() => this.updateSidebarHeight());
  }
  ngDoCheck() {

    // Manage if menu is enable or disable
    if (window.localStorage.getItem('connecte')) {
      this.connected = JSON.parse(window.localStorage.getItem('connecte')) as boolean;
      this.menuDisableStateChange(this.connected);
    }
  }

  public ngOnDestroy(): void {
    this._onRouteChange.unsubscribe();
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    const isMenuShouldCollapsed = this._shouldMenuCollapse();

    if (this.isMenuShouldCollapsed !== isMenuShouldCollapsed) {
      this.menuCollapseStateChange(isMenuShouldCollapsed);
    }
    this.isMenuShouldCollapsed = isMenuShouldCollapsed;
    this.updateSidebarHeight();
  }

  public menuExpand(): void {
    this.menuCollapseStateChange(false);
  }

  public menuCollapse(): void {
    this.menuCollapseStateChange(true);
  }

  public menuCollapseStateChange(isCollapsed: boolean): void {
    this.isMenuCollapsed = isCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
  }
  public menuDisableStateChange(isDisabled: boolean): void {
    this.connected = isDisabled;
    this._state.notifyDataChanged('connected', this.connected);
  }

  public updateSidebarHeight(): void {
    // get rid of magic 84 constant
    this.menuHeight = this._elementRef.nativeElement.childNodes[0].clientHeight - 84;
  }

  private _shouldMenuCollapse(): boolean {
    return window.innerWidth <= layoutSizes.resWidthCollapseSidebar;
  }
}
