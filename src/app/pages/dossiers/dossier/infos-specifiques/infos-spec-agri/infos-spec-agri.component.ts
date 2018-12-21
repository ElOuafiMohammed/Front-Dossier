import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'siga-infos-spec-agri',
  templateUrl: './infos-spec-agri.component.html',
  styleUrls: ['./infos-spec-agri.component.scss']
})
export class InfosSpecAgriComponent implements OnInit {
  /**
   * Attributs Angular
   */
  @Input() source;
  @Input() settings;
  @Input() currentThema;
  constructor() { }

  ngOnInit() {
  }

}
