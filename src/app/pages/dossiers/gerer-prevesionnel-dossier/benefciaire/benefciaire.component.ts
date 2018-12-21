import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-benefciaire',
  templateUrl: './benefciaire.component.html',
  styleUrls: ['./benefciaire.component.scss']
})
export class BenefciaireComponent implements OnInit, ViewCell {


  public value: string;
  @Input() rowData: any;
  showTooltip = false;
  benefTrunc = '';
  w = window;
    d = document;
    e = this.d.documentElement;
    g = this.d.getElementsByTagName('body')[0];
    myWidth = this.w.innerWidth || this.e.clientWidth || this.g.clientWidth;
  constructor() { }

  ngOnInit() {
    this.truncBeneficiare();
  }
  /**
   *
   */
  truncBeneficiare() {
    if (this.rowData &&  this.rowData.beneficiaire && this.myWidth < 1370) {
      this.truncByParama(20);
    }
    if (this.rowData && this.rowData.beneficiaire && this.myWidth > 1370) {
      this.truncByParama(27);
    }

  }
/**
 *
 * @param param
 */
  truncByParama(param: number) {
    this.benefTrunc = this.rowData.beneficiaire.raisonSociale.substring(0, param);
    if (this.rowData.beneficiaire.raisonSociale.length > param) {
        this.showTooltip = true;
    } else {
      this.showTooltip = false;
    }
  }


  }
