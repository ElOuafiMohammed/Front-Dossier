import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

import { EmailRegex, TelephoneRegex } from '../../../dossiers.interface';
import { QualiteContact } from '../../dossier.interface';
import { Observable } from 'rxjs';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { Contact, Correspondant } from '../correspondant.interface';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';


@Component({
  selector: 'siga-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit, OnChanges, OnDestroy {

  private unsubscribe = new Subject<void>();

  selected: QualiteContact = null;

  public value: any;

  /**
  * Input row : one Contact
  */
  @Input() rowData: Correspondant;

  /**
 * Input row : index of the contact over 3 max=2
 */
  @Input() indexContact: number;


  /**
   * Input listQualiteContact to be displayed
   */
  @Input() listQualiteContact: QualiteContact[];
  filteredQualite: Observable<QualiteContact[]>;
  readonly qualiteValidatorKey = 'qualiteNotFound';

  /**
  * Variable to notify parent
  */
  @Output() updateCorrespondantEvent: EventEmitter<any> = new EventEmitter();

  /**
  * Notify erreur on email and phone number
  */
  @Output() notifyCheckParentComponent: EventEmitter<any> = new EventEmitter();

  /**
  * form displayed in the table
  */
  formCorrespondant: FormGroup;

  /**
  * getters
  */
  get nomControl() { return this.formCorrespondant.get('nom'); }

  get qualiteControl() { return this.formCorrespondant.get('qualite'); }

  get numeroTelControl() { return this.formCorrespondant.get('numeroTel'); }

  get mailControl() { return this.formCorrespondant.get('mail'); }
  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formCorrespondant = this._formBuilder.group({
      nom: [],
      qualite: [],
      numeroTel: ['', Validators.pattern(TelephoneRegex)],
      mail: ['', Validators.pattern(EmailRegex)],
    })
    if (this.listQualiteContact) {
      this.filteredQualite = GeneriqueListValeur.filtringList(this.listQualiteContact, this.qualiteControl, this.qualiteValidatorKey, minSearchLength, 'listValeur');
    }

    this.updateForm();
    this.setControlListenner();
  }
  updateForm() {
    if (this.rowData && this.rowData.contacts) {
      if (this.rowData.contacts[this.indexContact]) {
        this.formCorrespondant.patchValue({
          nom: this.rowData.contacts[this.indexContact].nom,
          qualite: this.rowData.contacts[this.indexContact].qualiteContact,
          numeroTel: this.rowData.contacts[this.indexContact].numeroTel,
          mail: this.rowData.contacts[this.indexContact].mail,
        })
        this.value = this.rowData.contacts[this.indexContact];
      } else {
        this.formCorrespondant.patchValue({
          nom: '',
          qualite: '',
          numeroTel: '',
          mail: '',
        })
        this.value = null;
      }
    }
    if (this.value && this.value.id != null) {
      this.point();
    } else {
      this.selected = this.value;
    }
  }

  point() {
    for (let contact of this.listQualiteContact) {
      if (contact.id === this.value.id) {
        this.selected = contact;
      }
    }
  }

  setControlListenner() {
    this.qualiteControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((qualiteContact: QualiteContact) => {
        this.updateQualite(qualiteContact);
      });
  }
  /**
   * allows to compare two objects
   * @param compareItem1;
   * @param compareItem2;
   */
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }

  displayQualite(qualite): string | undefined {
    if (qualite) {
      return `${qualite.libelle}`;
    }
  }

  ngOnChanges() {

  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  /**
  * allows to get selected value for the form
  * @param compareItem1;
  *
  */
  updateQualite(qualiteContact: QualiteContact) {
    let contacts: Contact[] = [];
    let contact = this.createcontact();
    if (this.qualiteControl) {
      if (this.rowData && this.rowData.contacts) {
        if (this.rowData.contacts && this.rowData.contacts.length > this.indexContact) {
          this.rowData.contacts[this.indexContact].qualiteContact = qualiteContact
        } else {
          contact.qualiteContact = qualiteContact;
          this.rowData.contacts.push(contact);
        }

      } else {
        contact.qualiteContact = qualiteContact;
        contacts.push(contact);
        if (this.rowData && this.rowData.contacts) {
          this.rowData.contacts = contacts;
        }
      }
    }
    this.updateCorrespondantEvent.emit(this.rowData);
  }

  updateNom(nom: string) {
    let contacts: Contact[] = [];
    let contact = this.createcontact();
    if (this.nomControl.valid) {
      if (this.rowData.contacts) {
        if (this.rowData.contacts && this.rowData.contacts.length > this.indexContact) {
          this.rowData.contacts[this.indexContact].nom = nom;
        } else {
          contact.nom = nom;
          this.rowData.contacts.push(contact);
        }

      } else {

        contact.nom = nom;
        contacts.push(contact);
        this.rowData.contacts = contacts;
      }
    }
    this.updateCorrespondantEvent.emit(this.rowData);
  }

  updateNumeroTel(numero: string) {
    let contacts: Contact[] = [];
    let contact = this.createcontact();
    if (this.numeroTelControl.valid) {
      if (this.rowData && this.rowData.contacts) {
        if (this.rowData.contacts && this.rowData.contacts.length > this.indexContact) {
          this.rowData.contacts[this.indexContact].numeroTel = numero;
        } else {
          contact.numeroTel = numero;
          this.rowData.contacts.push(contact);
        }
      } else {

        contact.numeroTel = numero;
        contacts.push(contact);
        if (this.rowData && this.rowData.contacts) {

          this.rowData.contacts = contacts;
        }
      }
    }
    this.notifyCheckParentComponent.emit(this.numeroTelControl.valid);
    this.updateCorrespondantEvent.emit(this.rowData);
  }

  updateMail(mail: string) {
    let contact = this.createcontact();
    let contacts: Contact[] = [];
    if (this.mailControl.valid) {
      if (this.rowData && this.rowData.contacts) {
        if (this.rowData.contacts.length > this.indexContact) {
          this.rowData.contacts[this.indexContact].mail = mail;
        } else {
          contact.mail = mail;
          this.rowData.contacts.push(contact);
        }
      } else {
        contact.mail = mail;
        contacts.push(contact);
        if (this.rowData && this.rowData.contacts) {
          this.rowData.contacts = contacts;
        }
      }
    }
    this.updateCorrespondantEvent.emit(this.rowData);
    this.notifyCheckParentComponent.emit(this.mailControl.valid);
  }

  createcontact(): Contact {
    const contact: Contact = {
      id: null,
      nom: null,
      prenom: null,
      numeroTel: null,
      mail: null,
      qualiteContact: null,
      erreurValeur: false,
    }
    return contact;

  }

  /**
   *Character no supported
   * @param control
   */
  onlyNumber(control: any, event?: any) {
    const positionInit =
      event && event.target ? event.target.selectionStart : 0;
    control.setValue(this.onlyNumberForTel(control.value));
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }

  // onlyNumberForTel(value: any) {
  //   return value;
  // }


  /**
   * Check Tel number 
   * + or 0 in first 
   * 0-9 after
   * @param value 
   */
  onlyNumberForTel(value: any) {
    return value.replace(/[^(0|+)0-9 ]+/g, '');
  }

}
