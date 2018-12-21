import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';

import { RoleCorrespondant } from '../../dossier.interface';
import { Correspondant } from '../correspondant.interface';

@Component({
  selector: 'siga-role-interlocuteur-select',
  templateUrl: './role-interlocuteur-select.component.html',
  styleUrls: ['./role-interlocuteur-select.component.scss']
})
export class RoleInterlocuteurSelectComponent implements OnInit, OnDestroy, ViewCell {

  public value: any;
  indexSelect = 0;

  private unsubscribe = new Subject<void>();
  @Input() rowData: Correspondant;
  @Output() updateCorrespondantvent: EventEmitter<any> = new EventEmitter();
  @Input() listRoleCorrespondant: RoleCorrespondant[];

  selected: RoleCorrespondant = null;

  formRoleCorrespondant: FormGroup;
  get roleCorrespondantControl() { return this.formRoleCorrespondant.get('roleCorrespondant'); }
  filteredRole: Observable<RoleCorrespondant[]>;
  readonly roleValidatorKey = 'roleNotFound';

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formRoleCorrespondant = this._formBuilder.group({
      roleCorrespondant: [],
    });
    if (this.rowData.roleCorrespondant) {
      this.value = this.rowData.roleCorrespondant;
      this.formRoleCorrespondant.patchValue({
        roleCorrespondant: this.rowData.roleCorrespondant,
      })
    }
    this.filteredRole = GeneriqueListValeur.filtringList(this.listRoleCorrespondant, this.roleCorrespondantControl, this.roleValidatorKey, minSearchLength, 'listValeur');

    if (this.value && this.value.id != null) {
      this.point();
    } else {
      this.selected = this.value;
    }
    this.setControlListenner();

  }

  setControlListenner() {
    this.formRoleCorrespondant.get('roleCorrespondant').valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((roleCorrespondant: RoleCorrespondant) => {
        this.rowData.roleCorrespondant = roleCorrespondant;

        this.updateCorrespondantvent.emit(this.rowData);
      })
  }

  change(value: RoleCorrespondant) {
    this.value = value;
    this.rowData.roleCorrespondant = value;
  }

  /**
   * get the selected element from list
   */
  point() {
    for (let role of this.listRoleCorrespondant) {
      if (role.id === this.value.id) {
        this.selected = role;
      }
    }
  }

  /**
   * Improve the Angular perf
   * @param index list index
   * @param item list item
   */
  trackById(index, item) {
    return item.id;
  }

  /**
   * allows to compare two objects
   * @param compareItem1;
   * @param compareItem2;
   */
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }

  displayRole(role): string | undefined {
    if (role) {
      return `${role.libelle}`;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
