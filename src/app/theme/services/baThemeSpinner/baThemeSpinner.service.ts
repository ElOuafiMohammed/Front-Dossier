import { Injectable } from '@angular/core';

@Injectable()
export class BaThemeSpinner {

  private _selector = 'preloader';
  private _element: HTMLElement;

  constructor() {
    this._element = document.getElementById(this._selector);
  }

  public show(): void {
    this._element.style['display'] = 'block';
  }

  public showWithoutBackground() {
    this._element.style['display'] = 'block';
    this._element.style['background-color'] = 'rgba(0, 0, 0, 0)';
  }

  public hide(delay: number = 0): void {
    setTimeout(() => {
      this._element.style['display'] = 'none';
    }, delay);
  }
}
