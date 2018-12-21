import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { minSearchLength } from "app/shared/methodes-generiques";
import { cloneDeep } from "lodash";
import { LocalDataSource } from "ng2-smart-table";
import { Observable, Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import GeneriqueListValeur from "../../../../shared/generic-listValeur";
import { BenefRegex, Dossier, Interlocuteur } from "../../dossiers.interface";
import { ComponentViewRightMode, DossierService } from "../../dossiers.service";
import { QualiteContact, RoleCorrespondant } from "../dossier.interface";
import { CarateristiqueInterlocuteurDataSource } from "./caracteristique-interlocuteur-dataSource";
import { Contact, Correspondant } from "./correspondant.interface";
import { ResponsableTechnique } from "app/pages/dossiers/create-dossier/create-dossier.interface";

@Component({
  selector: "siga-app-interlocuteurs",
  templateUrl: "./interlocuteurs.component.html",
  styleUrls: ["./interlocuteurs.component.scss"],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", visibility: "hidden" })
      ),
      state("expanded", style({ height: "*", visibility: "visible" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ]
})
export class InterlocuteursComponent extends ComponentViewRightMode
  implements OnInit, OnChanges, OnDestroy {
  /* 
    Nombre de contacts par correspondant
     */
  nbContactsParCorrespondant: number[] = [0, 1, 2];

  /* 
    Manage bouton add 
     */
  canAdd = false;

  public value: any;

  /* 
      list of correspondants
     */
  listCorrespondants: Correspondant[] = [];

  private unsubscribe = new Subject<void>();

  responsablesAdministratifs: ResponsableTechnique[] = [];
  filteredResponsablesAdministratif: Observable<ResponsableTechnique[]>;
  readonly respAdministratifValidatorKey = "responsableAdministratifNotFound";
  valid: boolean;

  /* 
      dossier as input from dossier 
       */
  @Input() currentDossier: Dossier;

  /* 
    parent notification if all correspondants  are vaid
     */
  @Output() isCorrespondantValidParent: EventEmitter<any> = new EventEmitter();

  /* 
      parent notification that correspondant form has changed 
       */
  @Output() isRespAdmEvent: EventEmitter<boolean> = new EventEmitter();
  /**
   * Source to be displayed in the interlocuteurs
   */
  dataSource = new CarateristiqueInterlocuteurDataSource(
    this.listCorrespondants
  );

  /**
   * error message to display
   */
  messageToDisplay = "";

  /*
   * Define structure of table Ouvrage
   */
  settings: any = { actions: false };

  /**
   * Liste  will be used to select elemethis.linesToSelectnt
   */
  listRoleCorrespondant: RoleCorrespondant[] = [];

  listQualiteContact: QualiteContact[] = [];

  /** 
    form 
     */
  formCorrespondant: FormGroup;

  /**
   * Columns of table interlocuteur
   */
  displayedColumns = [
    "actionsColumn",
    "interlocuteur",
    "libelle",
    "role",
    "suppression"
  ];

  /**
   * Columns of table contacts
   */
  displayedContacts = ["nom", "qualite", "telephone", "email"];

  dossierReadySubscription: Subscription = null;

  readonly roleCorrespondantValidatorKey = "RoleCorrespondantNotFound";

  get referenceInterlocuteurControl() {
    return this.formCorrespondant.get("referenceCorresp");
  }
  get roleCorrespondantControl() {
    return this.formCorrespondant.get("roleCorrespondant");
  }
  get respAdministratifControl() {
    return this.formCorrespondant.get("responsableAdministratif");
  }

  nErrors: number;

  constructor(
    private dossierService: DossierService,
    private _formBuilder: FormBuilder
  ) {
    super(dossierService);
  }

  onClick(event) {}

  ngOnInit() {
    this.formCorrespondant = this._formBuilder.group({
      referenceCorresp: ["", Validators.pattern(BenefRegex)],
      roleCorrespondant: [],
      responsableAdministratif: []
    });

    this.nErrors = 0;

    this.listRoleCorrespondant = this.dossierService.getRoleCorrspondant();
    this.listQualiteContact = this.dossierService.getQualiteContact();
    this.setControlListenner();
    this.loadDataSource();
    this.manageAddButtonState(null);
  }

  ngOnChanges() {
    this.dossierService.getResponsableTech().subscribe(dataAdministratif => {
      this.responsablesAdministratifs = dataAdministratif;
    });
    if (this.currentDossier) {
      if (this.currentDossier.responsableAdministratif) {
        this.currentDossier.responsableAdministratif.organisation = null;
      }
      this.formCorrespondant.patchValue({
        responsableAdministratif: this.currentDossier.responsableAdministratif
          ? this.currentDossier.responsableAdministratif
          : null
      });
      this.dossierReadySubscription = this.dossierService.dossier$
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(dossierReady => {
          if (this.currentDossier.correspondants) {
            const sourceContact = new LocalDataSource();
            this.listCorrespondants = this.currentDossier.correspondants;
            this.listCorrespondants.forEach(corresp => {
              if (corresp.contacts) {
                sourceContact.load(corresp.contacts);
              } else {
                sourceContact.load([]);
              }
            });
          }
        });
      setTimeout(() => {
        if (this.formCorrespondant && this.responsablesAdministratifs) {
          this.filteredResponsablesAdministratif = GeneriqueListValeur.filtringList(
            this.responsablesAdministratifs,
            this.respAdministratifControl,
            this.respAdministratifValidatorKey,
            minSearchLength,
            "responsableTech"
          );
        }
        this.listRoleCorrespondant = this.dossierService.getRoleCorrspondant();
        this.listQualiteContact = this.dossierService.getQualiteContact();
      }, this.dossierService.delay);
      this.loadDataSource();

      /*if (this.dossierService.dossier.phase === "T40") {
                this.formCorrespondant.disable();
                this.viewRight = false;
        
            } else {
                this.formCorrespondant.enable();
            }
*/
      this.loadDataSource();
      this.setControlListenner();
    }
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadDataSource() {
    if (this.currentDossier) {
      if (this.currentDossier.correspondants) {
        this.currentDossier.correspondants.forEach(corresp => {
          if (!corresp.expanded) corresp.expanded = false;
        });
        this.dataSource = new CarateristiqueInterlocuteurDataSource(
          this.currentDossier.correspondants
        );
        this.listCorrespondants = this.currentDossier.correspondants;
      } else {
        this.dataSource = new CarateristiqueInterlocuteurDataSource([]);
      }
    }
  }

  loadCurrentDossier(currentDossier: Dossier) {
    if (currentDossier && currentDossier.correspondants) {
      this.listCorrespondants = currentDossier.correspondants
        ? currentDossier.correspondants
        : [];
      this.loadDataSource();
    }
  }

  displayResponsableAdministratif(
    responsableAdministratif: ResponsableTechnique
  ) {
    if (responsableAdministratif) {
      return `${responsableAdministratif.prenom}  ${
        responsableAdministratif.nom
      }`;
    }

    return responsableAdministratif;
  }

  /**
   * active or deactive the button (add a new interlocuteur)
   */

  manageAddButtonState(row: Correspondant) {
    this.canAdd = false;
    if (!this.viewRight) {
      this.canAdd = true;
    }
    if (
      row &&
      (row.correspondant === null ||
        row.correspondant.raisonSociale === "" ||
        row.correspondant.raisonSociale === null)
    ) {
      this.canAdd = false;
    }
  }
  /**
   * check if the list of ouvrage is empty
   */
  isEmptyData(): boolean {
    return !this.listCorrespondants || this.listCorrespondants.length === 0;
  }

  formCritereValidator() {
    return (group: FormGroup) => {
      if (
        this.formCorrespondant &&
        this.respAdministratifControl.value === "" &&
        this.respAdministratifControl.value === ""
      ) {
        return { noCritereFieldInputed: true };
      }
      return null;
    };
  }

  /**
   * delete a selected interlocuteur
   * @param correspondant
   */

  notifyCheckParentComponent(row: Correspondant, valid?: boolean) {
    if (!valid && valid !== undefined) {
      this.nErrors++;
    } else {
      this.nErrors--;
    }

    this.isCorrespondantValidParent.emit(valid && this.nErrors <= 0);
    this.valid = valid && this.nErrors <= 0;
    this.listCorrespondants.forEach(value => {
      if (value.id === row.id) {
        value.hasError = !valid;
      }
    });
  }

  onAddInterLocteur() {
    const roleCorrespondants: RoleCorrespondant = null;
    const interlocuteur: Interlocuteur = {
      id: null,
      reference: "",
      raisonSociale: "",
      raisonSociale1: "",
      raisonSociale2: "",
      actif: true,
      actifLibelle: "",
      status: "",
      address: null,
      commune: null
    };
    const qualiteContact: QualiteContact = null;
    const listContact: Contact[] = null;
    const newCorrespondant: Correspondant = {
      id: null,
      correspondant: interlocuteur,
      referenceCorresp: "",
      roleCorrespondant: roleCorrespondants,
      contacts: listContact,
      sourceContact: null,
      settingContact: null,
      expanded: false
    };
    this.manageAddButtonState(newCorrespondant);
    this.currentDossier.correspondants.push(newCorrespondant);
    this.loadDataSource();
    this.notifyCheckParentComponent(newCorrespondant, false);
    this.isRespAdmEvent.emit(true);
  }

  updateCorrespondant(row) {
    row["correspondant"] = row.correspondant;
    row["referenceCorresp"] = row.referenceCorresp;
    this.notifyCheckParentComponent(row, true);
    this.isRespAdmEvent.emit(true);
  }

  setControlListenner() {
    if (this.formCorrespondant && this.currentDossier) {
      this.formCorrespondant
        .get("responsableAdministratif")
        .valueChanges.pipe(takeUntil(this.unsubscribe))
        .subscribe((responsableAdministratif: ResponsableTechnique) => {
          if (
            this.currentDossier.responsableAdministratif !==
            responsableAdministratif
          ) {
            this.currentDossier.responsableAdministratif = responsableAdministratif;
            this.isRespAdmEvent.emit(true);
          }
        });
    }
  }

  change(row: any) {
    const role: RoleCorrespondant = row.roleCorrespondant;
    if (row["referenceCorresp"] !== "") {
      this.dossierService.getBeneficaire(row.referenceCorresp).subscribe(
        (interlocuteurResult: any) => {
          row["correspondant"] = interlocuteurResult;
          row["referenceCorresp"] = interlocuteurResult.reference;
          row["roleCorrespondant"] = role;
          row["contacts"] = row.contacts;
        },
        error => {
          this.messageToDisplay = `Interlocuteur inconnu: ${
            row.referenceCorresp
          } !`;
        }
      );
    }
    this.isRespAdmEvent.emit(true);
  }

  onBlur(row) {
    if (row.referenceCorresp) {
      this.dossierService.getBeneficaire(row.referenceCorresp).subscribe(
        (interlocuteurResult: any) => {
          row["correspondant"] = interlocuteurResult;
          row["referenceCorresp"] = interlocuteurResult.reference;
          row["roleCorrespondant"] = row.roleCorrespondant;

          this.manageAddButtonState(row);
          this.notifyCheckParentComponent(row, true);
        },
        errors => {
          this.messageToDisplay = `Interlocuteur inconnu: ${
            row.referenceCorresp
          } !`;
        }
      );
    }

    this.isRespAdmEvent.emit(true);
  }

  /**
   * Improve the Angular perf
   * @param index list index
   * @param item list item
   */
  trackById(index, item) {
    return item.id;
  }

  toggleContactsRow(row: Correspondant): void {
    if (row["expanded"] === true) {
      row.expanded = false;
    } else {
      row.expanded = true;
    }
    row["expanded"] = row.expanded;
  }

  initialisationPage() {
    this.listRoleCorrespondant = this.dossierService.getRoleCorrspondant();

    this.roleCorrespondantControl.setValidators([
      GeneriqueListValeur.sigaAutocompleteValidatorFactory(
        this.listRoleCorrespondant,
        this.roleCorrespondantValidatorKey
      )
    ]);
    this.respAdministratifControl.setValidators([
      GeneriqueListValeur.sigaAutocompleteValidatorFactory(
        this.responsablesAdministratifs,
        this.respAdministratifValidatorKey
      )
    ]);
  }
  deleteRow(row) {
    const elementData: Correspondant[] = cloneDeep(
      this.currentDossier.correspondants
    );
    elementData.splice(this.currentDossier.correspondants.indexOf(row), 1);
    this.currentDossier.correspondants = elementData;

    this.loadDataSource();
    this.isRespAdmEvent.emit(true);
    this.notifyCheckParentComponent(row, true);
    if (
      this.currentDossier.correspondants &&
      this.currentDossier.correspondants.length > 0
    ) {
      this.currentDossier.correspondants.forEach(corresp => {
        this.manageAddButtonState(corresp);
      });
    } else {
      this.canAdd = true;
    }
    this.nErrors = 0;
  }

  toggleDetailsRow(row: Correspondant): void {
    if (row["expanded"] === true) {
      row.expanded = false;
    } else {
      row.expanded = true;
    }
  }

  removeAdmin(event) {
    this.respAdministratifControl.setValue(null);
    this.currentDossier.loginRespAdm = null;
    if (event) {
      event.stopPropagation();
    }
  }
}
