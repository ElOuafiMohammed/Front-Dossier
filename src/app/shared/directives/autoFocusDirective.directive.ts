import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private element: ElementRef) {
  }

  ngAfterViewInit() {
    this.element.nativeElement.focus();
  }

}
