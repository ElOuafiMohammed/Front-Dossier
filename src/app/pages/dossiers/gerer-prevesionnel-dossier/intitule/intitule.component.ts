import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-intitule',
  templateUrl: './intitule.component.html',
  styleUrls: ['./intitule.component.scss']
})
export class IntituleComponent implements OnInit, ViewCell {

  public value: string;
  @Input() rowData: any;
  showTooltip = false;
  intituleTrunc = '';
   w = window;
    d = document;
    e = this.d.documentElement;
    g = this.d.getElementsByTagName('body')[0];
    myWidth = this.w.innerWidth || this.e.clientWidth || this.g.clientWidth;
  constructor() { }

  ngOnInit() {
    this.truncIntitule();
  }
  /**
   *
   */
  truncIntitule() {
    if (this.rowData &&  this.rowData.intitule && this.myWidth < 1370) {
      this.truncByParama(18);
    }
    if (this.rowData && this.rowData.intitule && this.myWidth > 1370) {
      this.truncByParama(28);
    }

  }
/**
 *
 * @param param
 */
  truncByParama(param: number) {
    this.intituleTrunc = this.rowData.intitule.substring(0, param);
    if (this.rowData.intitule.length > param) {
        this.showTooltip = true;
    } else {
      this.showTooltip = false;
    }
  }


}
