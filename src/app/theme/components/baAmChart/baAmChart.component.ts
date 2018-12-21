import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { BaThemePreloader } from '../../../theme/services';
import { BaAmChartThemeService } from './baAmChartTheme.service';

@Component({
  selector: 'ba-am-chart',
  templateUrl: './baAmChart.html',
  styleUrls: ['./baAmChart.scss'],
  providers: [BaAmChartThemeService],
})
export class BaAmChart {

  @Input() baAmChartConfiguration: Object;
  @Input() baAmChartClass: string;
  @Output() onChartReady = new EventEmitter<any>();

  @ViewChild('baAmChart') public _selector: ElementRef;

  constructor(private _baAmChartThemeService: BaAmChartThemeService) {
    this._loadChartsLib();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const chart = AmCharts.makeChart(this._selector.nativeElement, this.baAmChartConfiguration);
    this.onChartReady.emit(chart);
  }

  private _loadChartsLib(): void {
    BaThemePreloader.registerLoader(new Promise((resolve, reject) => {
      const amChartsReadyMsg = 'AmCharts ready';

      if (AmCharts.isReady) {
        resolve(amChartsReadyMsg);
      } else {
        AmCharts.ready(function () {
          resolve(amChartsReadyMsg);
        });
      }
    }));
  }
}
