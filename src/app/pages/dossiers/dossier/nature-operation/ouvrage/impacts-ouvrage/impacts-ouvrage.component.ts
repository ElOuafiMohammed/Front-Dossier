import { Component, Input, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'siga-impacts-ouvrage',
  templateUrl: './impacts-ouvrage.component.html',
  styleUrls: ['./impacts-ouvrage.component.scss']
})
export class ImpactsOuvrageComponent implements OnInit {

  @Input('settings') settings: any = { action: false };
  @Input('source') source: LocalDataSource = new LocalDataSource();


  constructor() { }
  /**
   *Init component
   */
  ngOnInit() {
  }

}
