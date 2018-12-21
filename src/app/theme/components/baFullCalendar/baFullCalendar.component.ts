import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as jQuery from 'jquery';

@Component({
  selector: 'ba-full-calendar',
  templateUrl: './baFullCalendar.html'
})
export class BaFullCalendar implements AfterViewInit {

  @Input() baFullCalendarConfiguration: Object;
  @Input() baFullCalendarClass: string;
  @Output() onCalendarReady = new EventEmitter<any>();

  @ViewChild('baFullCalendar') public _selector: ElementRef;

  ngAfterViewInit() {
  }
}
