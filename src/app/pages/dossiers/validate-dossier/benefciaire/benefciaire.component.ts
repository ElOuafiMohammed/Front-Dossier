import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'siga-benefciaire',
  templateUrl: './benefciaire.component.html',
  styleUrls: ['./benefciaire.component.scss']
})
export class BenefciaireValidateComponent implements OnInit {


  @Input() rowData: any;

  constructor() { }

  ngOnInit() {
  }

}




