import {
  Component,
  ViewChild,
  Input,
  Output,
  ElementRef,
  EventEmitter,
  OnChanges, AfterViewInit, OnDestroy
} from '@angular/core';

@Component({
  selector: 'ba-chartist-chart',
  templateUrl: './baChartistChart.html',
  providers: [],
})
export class BaChartistChart implements OnChanges, AfterViewInit, OnDestroy {

  @Input() baChartistChartType: string;
  @Input() baChartistChartData: Object;
  @Input() baChartistChartOptions: Object;
  @Input() baChartistChartResponsive: Object;
  @Input() baChartistChartClass: string;
  @Output() onChartReady = new EventEmitter<any>();

  @ViewChild('baChartistChart') public _selector: ElementRef;

  private chart;

  ngAfterViewInit() {
  }

  ngOnChanges(changes) {
    if (this.chart) {
      (<any>this.chart).update(this.baChartistChartData, this.baChartistChartOptions);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.detach();
    }
  }
}
