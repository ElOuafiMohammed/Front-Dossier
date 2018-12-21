import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange, MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import MethodeGenerique, { SpinnerLuncher } from 'app/shared/methodes-generiques';
import { getErrorMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import AlphanumericUtils from 'app/shared/utils/alphanumeric-utils';
import NumberUtils from 'app/shared/utils/number-utils';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccueilService } from '../../accueil/accueil.service';
import { DelaiFinValidite } from '../../dossier/dossier.interface';
import { DescriptifTechnique, Dossier, TextMRA, TextTDP } from '../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../dossiers.service';
import {
  DispositionsFinancieres,
  EngagementsParticuliers,
  FormDocAttrib,
  ModalitesReduction,
  ModalitesVersement,
  SldNonStandard,
  TypeDocAttrib,
} from '../dossier.interface';


@Component({
  // tslint:disable-next-line:component-selector
  selector: "description-generale",
  templateUrl: "./description-generale.component.html",
  styleUrls: ["./description-generale.component.scss"]
})
export class DescriptionGeneraleComponent extends ComponentViewRightMode
  implements OnInit, OnChanges, OnDestroy {
  formDescription: FormGroup;
  descriptionOperation: string;
  descriptifTechnique: DescriptifTechnique;
  resultatsAttendus: string;
  heurModification: string;
  dateModification: string;
  canCreateDescTech = true;
  gcdIndisponible = false;
  textSoldeNonStandard: string;
  soldesNonStandard: SldNonStandard[];
  sldNstandardObj: any;
  maxLength = 2000;

  private unsubscribe = new Subject<void>();
  @Output() descriptifTechniqueChangesEvent: EventEmitter<
    DescriptifTechnique
    > = new EventEmitter();
  @Output() onDescriptionFormChange: EventEmitter<
    FormGroup
    > = new EventEmitter();
  @Output() eventDesc: EventEmitter<boolean> = new EventEmitter();
  @Output() recapDelete: EventEmitter<boolean> = new EventEmitter();
  @Input() dossier: Dossier;
  @ViewChild("justif", { read: ElementRef }) justif: ElementRef;
  @ViewChild("justifMarge", { read: ElementRef }) justifMarge: ElementRef;

  @ViewChild("descopera", { read: ElementRef }) jusdescoperatif: ElementRef;
  thematiqueCode: string;
  utilisateurConnecteNomPrenom: string;
  delaiValidite = 0;
  @ViewChild("modVersementTextArea", { read: ElementRef })
  modVersementTextArea: ElementRef;
  delaiFinValidite: DelaiFinValidite;
  /**
   * The text to display when no TDP are selected
   */
  textDTP: string = TextTDP;

  /**
   * The text to display when no TDP are selected
   */
  textMRA: string = TextMRA;

  /**
   * EngagementsParticuliers List
   */
  engagements: EngagementsParticuliers[] = null;

  /**
   * DispositionsFinancieres List
   */
  dispositions: DispositionsFinancieres[] = null;

  /**
   *  List Soldes non standard
   */
  sldsNonStandards: SldNonStandard[] = null;

  /**
   * ModalitesReduction List
   */
  modalitesReduction: ModalitesReduction[] = null;

  /**
   * ModalitesReduction List
   */
  modalitesVersement: ModalitesVersement[] = null;
  formDocAttribs: FormDocAttrib[] = null;
  typDocAttribs: TypeDocAttrib[] = null;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get descriptionOperationControl() {
    return this.formDescription.get("descriptionOperation");
  }
  get resultatsAttendusControl() {
    return this.formDescription.get("resultatsAttendus");
  }
  get margeAvenirControl() {
    return this.formDescription.get("margeAvenir");
  }
  get derogationControl() {
    return this.formDescription.get("derogation");
  }
  get delaiValiditeControl() {
    return this.formDescription.get("delaiValidite");
  }
  get justifDerogationControl() {
    return this.formDescription.get("justifDerogation");
  }
  get margeAvenirJustifControl() {
    return this.formDescription.get("margeAvenirJustif");
  }
  get engagementsControl() {
    return this.formDescription.get("engagements");
  }
  get dispositionsControl() {
    return this.formDescription.get("dispositions");
  }
  get sldsNonStandardControl() {
    return this.formDescription.get("sldsNonStandards");
  }
  get modalitesReductionControl() {
    return this.formDescription.get("modalitesReduction");
  }
  get modalitesVersementControl() {
    return this.formDescription.get("modaliteVersement");
  }
  get textControl() {
    return this.formDescription.get("text");
  }
  get textModalitesReductionControl() {
    return this.formDescription.get("textModalitesReduction");
  }
  get textModaliteVersementControl() {
    return this.formDescription.get("textModaliteVersement");
  }
  get formDocAttribControl() {
    return this.formDescription.get("formDocAttrib");
  }
  get typDocAttribControl() {
    return this.formDescription.get("typDocAttrib");
  }
  get traveauxOuvrageControl() {
    return this.formDescription.get("traveauxOuvrage");
  }

  readonly justifDerogationValidatorKey = "emptyJustif";

  phaseSubscription: Subscription = null;
  dossierReadySubscription: Subscription = null;

  constructor(
    private _formBuilder: FormBuilder,
    public dossierService: DossierService,
    private _snackbar: MatSnackBar,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private _accueilService: AccueilService,
    private sanitizer: DomSanitizer,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super(dossierService);

    this.phaseSubscription = dossierService.dossierPhase$.subscribe(phase => {
      if (phase && this.formDescription && this.formDescription.enabled) {
        this.justifDerogationControl.disable({ emitEvent: false });
        this.textModaliteVersementControl.disable({ emitEvent: false });
        this.descriptionOperationControl.disable({ emitEvent: false });
        this.resultatsAttendusControl.disable({ emitEvent: false });
        this.justifDerogationControl.disable({ emitEvent: false });
        this.margeAvenirJustifControl.disable({ emitEvent: false });
      }
      if (!phase && this.formDescription && this.formDescription.disabled) {
        this.justifDerogationControl.enable({ emitEvent: false });
        this.textModaliteVersementControl.enable({ emitEvent: false });
        this.descriptionOperationControl.enable({ emitEvent: false });
        this.resultatsAttendusControl.enable({ emitEvent: false });
        this.justifDerogationControl.enable({ emitEvent: false });
        this.margeAvenirJustifControl.enable({ emitEvent: false });
      }
    });

    // Loads the data the first time the DossierComponent is loaded (first navigation or F5)
    this.dossierReadySubscription = dossierService.dossier$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(dossierReady => {
        if (dossierService.dossier) {
          // Charger la descriptif technique du dossier
          this.descriptifTechnique = dossierService.dossier.descriptifTechnique;

          this.manageDescriptifTechnique(dossierService.dossier);
          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          // setTimeout(() => {
          this.updateFormData(dossierService.dossier);
          if (
            dossierService.dossier &&
            dossierService.dossier.thematique.code === "AEEP"
          ) {
            this.thematiqueCode = "AEP";
          } else if (
            dossierService.dossier &&
            dossierService.dossier.thematique.code === "ASST"
          ) {
            this.thematiqueCode = "ASST";
          }
          if (this.viewAdministratif || this.viewRight) {
            this.justifDerogationControl.disable({ emitEvent: false });
            this.delaiValiditeControl.disable({ emitEvent: false });
            this.textModaliteVersementControl.disable({ emitEvent: false });
            this.descriptionOperationControl.disable({ emitEvent: false });
            this.resultatsAttendusControl.disable({ emitEvent: false });
            this.justifDerogationControl.disable({ emitEvent: false });
            this.margeAvenirJustifControl.disable({ emitEvent: false });
          } else {
            this.justifDerogationControl.enable({ emitEvent: false });
            this.delaiValiditeControl.enable({ emitEvent: false });
            this.descriptionOperationControl.enable({ emitEvent: false });
            this.resultatsAttendusControl.enable({ emitEvent: false });
            this.justifDerogationControl.enable({ emitEvent: false });
            this.margeAvenirJustifControl.enable({ emitEvent: false });

            if (
              this.modalitesVersementControl.value !== null &&
              this.modalitesVersementControl.value.code !== "STD"
            ) {
              this.textModaliteVersementControl.enable();
            }
          }
          if (this.dossier && this.dossier.displayDescGenerale) {
            this.formDescription.enable();
            this.justifDerogationControl.disable();
            this.margeAvenirJustifControl.disable();
          }
          // }, 0);
        }
      });
    // get the connected user
    this._accueilService
      .getUtilisateurConnecte()
      .subscribe(utilisateurConnecte => {
        const emptyText = " ";
        this.utilisateurConnecteNomPrenom =
          utilisateurConnecte.prenom + emptyText + utilisateurConnecte.nom;
      });
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    if (
      this.dossier &&
      this.dossier.dossierAdmin &&
      this.dossier.dossierAdmin.travauxOuvrage === null
    ) {
      this.dossier.dossierAdmin.travauxOuvrage = true;
    }
    this.formDescription = this._formBuilder.group({
      descriptionOperation: [""],
      resultatsAttendus: [""],
      derogation: [],
      justifDerogation: [""],
      margeAvenir: [],
      margeAvenirJustif: [""],
      delaiValidite: [48, []],
      engagements: [""],
      dispositions: [""],
      sldsNonStandards: [""],
      modalitesReduction: [""],
      modaliteVersement: [null, []],
      text: [{ value: "", disabled: true }, []],
      textModalitesReduction: [{ value: "", disabled: true }, []],
      textModaliteVersement: [null, []],
      formDocAttrib: [null, []],
      typDocAttrib: [null, []]
    });
    this.textSoldeNonStandard = "";
    this.soldesNonStandard = [];
    if (this.dossierService.dossier) {
      this.descriptifTechnique = this.dossierService.dossier.descriptifTechnique;
      this.manageDescriptifTechnique(this.dossierService.dossier);
    }

    setTimeout(() => {
      this.formDocAttribs = this.dossierService.getformDocAttrib();
      this.typDocAttribs = this.dossierService.getTypDocAttrib();

      if (
        this.dossierService.dossier &&
        this.dossierService.dossier.dossierAdmin
      ) {
        this.updateFormData(this.dossierService.dossier);
      }
      if (this.typDocAttribControl) {
        this.typDocAttribControl.setValue(this.typDocAttribs);
      }

      this.modalitesVersement = this.dossierService.getModalitesVersementAides();
      if (
        this.modalitesVersement &&
        this.modalitesVersementControl.value &&
        this.modalitesVersementControl.value.code === "STD"
      ) {
        this.textModaliteVersementControl.setValue(
          this.dossier.dossierFinancier.modaliteVersement.texte
        );
        this.textModaliteVersementControl.disable();
        this.notifyParentComponent();
      }

      this.engagements = this.dossierService.getEngagementParticulier();
      this.modalitesReduction = this.dossierService.getModalitesReductionAides();
      this.sldsNonStandards = this.dossierService.dossierFinancier.sldsNonStandardsFinancieres;
      this.sldsNonStandardControl.setValue(this.sldsNonStandards);
      this.soldesNonStandard = this.sldsNonStandards;

      this.dispositions = this.dossierService.getDispositionFinanciere();
      this.delaiFinValidite = this.dossierService.getDelaiFinValidite();
      this.formDocAttribControl.setValue(
        this.dossier.dossierAdmin
          ? this.dossier.dossierAdmin.formDocAttrib
          : null
      );
      this.typDocAttribControl.setValue(
        this.dossier.dossierAdmin
          ? this.dossier.dossierAdmin.typDocAttrib
          : null
      );

      // Forces an update for IE if the typologies load too late
      if (this.dossier && this.dossier.dossierFinancier) {
        this.updateFormData(this.dossier);
      }
    }, 1000);

    setTimeout(() => {
      if (
        this.typDocAttribControl &&
        this.typDocAttribControl.value == null &&
        this.dossier &&
        this.dossier.dossierAdmin
      ) {
        this.dossier.dossierAdmin.typDocAttrib = this.typDocAttribs
          ? this.typDocAttribs.find(
            typDocAttrib => typDocAttrib.code === "TYPE"
          )
          : null;
        this.typDocAttribControl.setValue(this.typDocAttribs);
      }
      if (
        this.formDocAttribControl &&
        this.formDocAttribControl.value == null &&
        this.dossier &&
        this.dossier.dossierAdmin
      ) {
        this.dossier.dossierAdmin.formDocAttrib = this.formDocAttribs
          ? this.formDocAttribs.find(
            typDocAttrib => typDocAttrib.code === "DECISION"
          )
          : null;
        this.formDocAttribControl.setValue(this.formDocAttribs);
      }
      if (this.dossier !== null && this.formDescription) {
        this.updateFormData(this.dossier);
        this.setControlListenners();
      }
    }, 1000);

    if (this.viewRight) {
      this.delaiValiditeControl.disable();
      this.textModaliteVersementControl.disable();
    }
  }

  ngOnChanges() {
    if (this.dossier) {
      this.updateFormData(this.dossier);
    }
  }

  /**
   * Resets a control.
   * TODO : Investigate - Doesn't work when directly called from the HTML for some reason ?
   * @param control a given FormControl
   */
  setToNullValue(control: FormControl) {
    MethodeGenerique.setToNullValue(control);
  }

  /**
   * Patches the values from the service in the form
   */
  updateFormData(dossier: Dossier) {
    if (
      dossier != null &&
      dossier.dossierFinancier.modaliteVersement &&
      this.modalitesVersement
    ) {
      dossier.dossierFinancier.modaliteVersement = this.modalitesVersement.find(
        modaliteVersement =>
          modaliteVersement.id === dossier.dossierFinancier.modaliteVersement.id
      );
    }

    if (dossier && dossier.dossierAdmin && (this.formDocAttribs && dossier.dossierAdmin.formDocAttrib || dossier.dossierAdmin.typDocAttrib && this.typDocAttribs)) {

      dossier.dossierAdmin.formDocAttrib = this.formDocAttribs.find(
        formDocAttrib =>
          formDocAttrib.id === dossier.dossierAdmin.formDocAttrib.id
      );

      dossier.dossierAdmin.typDocAttrib = this.typDocAttribs.find(
        typDocAttrib =>
          typDocAttrib.id === (dossier.dossierAdmin.typDocAttrib != null ? dossier.dossierAdmin.typDocAttrib.id : null)
      );

      this.formDescription.patchValue(
        {
          formDocAttribs: dossier.dossierAdmin
            ? dossier.dossierAdmin.formDocAttrib
            : true,
          typDocAttribs: dossier.dossierAdmin
            ? dossier.dossierAdmin.typDocAttrib
            : true
        },
        { emitEvent: false }
      );
    }

    if (dossier !== null && this.formDescription) {
      this.formDescription.patchValue(
        {
          descriptionOperation: dossier.descriptionOperation,
          resultatsAttendus: dossier.resultatsAttendus,
          derogation: dossier.derogatoire,
          justifDerogation: dossier.derogationJustif,
          margeAvenir: dossier.margeAvenir,
          margeAvenirJustif: dossier.margeAvenirJustif,
          engagements: dossier.dossierFinancier.engagementsParticuliers,
          dispositions: dossier.dossierFinancier.dispositionsFinancieres,
          sldsNonStandards:
            dossier.dossierFinancier.sldsNonStandardsFinancieres,
          modalitesReduction: dossier.dossierFinancier.modaliteReductions,
          modaliteVersement: dossier.dossierFinancier.modaliteVersement,
          text: dossier.texteRecapDtp
            ? dossier.texteRecapDtp
            : this.displayText(
              dossier.dossierFinancier.engagementsParticuliers,
              "engagementsParticuliers"
            ),
          textModalitesReduction: dossier.texteRecapModaliteReduction
            ? dossier.texteRecapModaliteReduction
            : this.displayText(
              dossier.dossierFinancier.modaliteReductions,
              "modaliteReductions"
            ),
          textModaliteVersement: dossier.modaliteVersementTexte,
          delaiValidite:
            (dossier.dossierFinancier.delaiFinValidite === null ||
              dossier.dossierFinancier.delaiFinValidite === 0) &&
              this.delaiFinValidite
              ? this.delaiFinValidite.valeurStr
              : this.limitDecimalTo2(dossier.dossierFinancier.delaiFinValidite),
          formDocAttribs: dossier.dossierAdmin
            ? dossier.dossierAdmin.formDocAttrib
            : null,
          formTypAttribs: dossier.dossierAdmin
            ? dossier.dossierAdmin.typDocAttrib
            : null
        },
        { emitEvent: false }
      );
    }
    this.clearFormPristine();
  }

  /**
   * Clear all form's pristine
   */
  clearFormPristine() {
    if (this.formDescription) {
      this.eventDesc.emit(false);
    }
  }

  manageDescriptifTechnique(dossier) {
    if (dossier.descriptifTechnique && dossier.descriptifTechnique.codeDoc) {
      const codeDoc: string = dossier.descriptifTechnique.codeDoc;
      this.dossierService.getDescriptifTechnique(codeDoc).subscribe(
        descriptifTech => {
          this.descriptifTechnique = descriptifTech;
          this.heurModification = this.datePipe.transform(
            descriptifTech.dateModification,
            "HH:mm"
          );
          this.dateModification = this.datePipe.transform(
            descriptifTech.dateModification,
            "dd/MM/yyyy"
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          this.gcdIndisponible = true;
        }
      );
    }
  }

  onDeleteEventList(event, control: AbstractControl) {
    const newList: any[] = control.value.filter(value => {
      if (event.id !== value.id) {
        return value;
      }
    });
    control.setValue(newList);
    this.recapDelete.emit(true);
  }

  addSoldeNonStandard(event) {
    if (event.target.value !== "") {
      this.sldNstandardObj = { textSoldeNonStandard: event.target.value };
      this.soldesNonStandard.push(this.sldNstandardObj);
      this.sldsNonStandardControl.setValue(this.soldesNonStandard);
      this.sldNstandardObj = null;
      this.textSoldeNonStandard = "";
    }
    event.target.value = "";
    event.preventDefault();
  }

  onDeleteEventSldNonStandard(index) {
    this.soldesNonStandard.splice(index, 1);
    this.sldsNonStandardControl.setValue(this.soldesNonStandard);
    this.recapDelete.emit(true);
  }

  /**
   *Character no supported
   * @param control
   */
  onlyNumber(control: any, event?: any) {
    const positionInit =
      event && event.target ? event.target.selectionStart : 0;
    control.setValue(NumberUtils.onlyNumber(control.value));
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }

  onlyDecimalDelai(control: AbstractControl, value: any) {
    if (value) {
      control.setValue(NumberUtils.onlyDecimalLimit(value, 2, 0));
    }
  }

  /**
   * Sends back the updated form to the parent component to manage validation
   */
  notifyParentComponent() {
    this.onDescriptionFormChange.emit(this.formDescription);
    this.eventDesc.emit(true);
  }

  /**
   * Add line on key Enter
   * @param $event event
   * @param oField textAreaText
   * TODO : Add event type
   */
  addLine($event: any, oField: any) {
    this.justifDerogationControl.setValue(
      AlphanumericUtils.addLine($event, oField)
    );
  }

  addLineVersement($event: any, oField: any) {
    this.textModaliteVersementControl.setValue(
      AlphanumericUtils.addLine($event, oField)
    );
  }
  addLineMarge($event: any, oField: any) {
    this.margeAvenirJustifControl.setValue(
      AlphanumericUtils.addLine($event, oField)
    );
  }
  addLineDescOperation($event: any, oField: any) {
    this.descriptionOperationControl.setValue(
      AlphanumericUtils.addLine($event, oField)
    );
  }
  addLineResultatsAttendus($event: any, oField: any) {
    this.resultatsAttendusControl.setValue(
      AlphanumericUtils.addLine($event, oField)
    );
  }

  setControlListenners() {
    this.descriptionOperationControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(descriptionOperation => {
        this.notifyParentComponent();
      });

    this.resultatsAttendusControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(resultatsAttendus => {
        this.notifyParentComponent();
      });

    this.derogationControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(derogation => {
        if (derogation === true && !this.viewRight) {
          // utile car si suppression du setTimeOut pas de focus sur la justif (attebd maj du DOM avec justif)
          setTimeout(() => {
            this.justif.nativeElement.focus();
            if (
              this.justifDerogationControl.value === "" ||
              this.justifDerogationControl.value === null
            ) {
              this.justifDerogationControl.setErrors({ emptyJustif: true });
            }
          }, 0);
        }
        if (derogation === false) {
          this.justifDerogationControl.setValue("");
        }
        this.notifyParentComponent();
      });

    this.margeAvenirControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(marge => {
        if (marge === true && !this.viewRight) {
          // utile car si suppression du setTimeOut pas de focus sur la justif (attebd maj du DOM avec justif)
          setTimeout(() => {
            this.justifMarge.nativeElement.focus();
            if (
              this.margeAvenirJustifControl.value === "" ||
              this.margeAvenirJustifControl.value === null
            ) {
              this.margeAvenirJustifControl.setErrors({ emptyJustif: true });
            }
          }, 0);
        }
        if (marge === false) {
          this.margeAvenirJustifControl.setValue("");
        }
        this.notifyParentComponent();
      });
    this.justifDerogationControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(derogation => {
        if (
          this.justifDerogationControl.value === "" &&
          this.derogationControl.value === true
        ) {
          this.justifDerogationControl.setErrors({ emptyJustif: true });
        }
        this.notifyParentComponent();
      });

    this.margeAvenirJustifControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(marge => {
        if (
          this.margeAvenirJustifControl.value === "" &&
          this.margeAvenirControl.value === true
        ) {
          this.margeAvenirJustifControl.setErrors({ emptyJustif: true });
        }
        this.notifyParentComponent();
      });

    this.engagementsControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((engagements: EngagementsParticuliers[]) => {
        this.formDescription
          .get("text")
          .setValue(this.displayText(engagements, "engagementsParticuliers"));
        this.notifyParentComponent();
      });

    this.dispositionsControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((dispositions: DispositionsFinancieres[]) => {
        this.notifyParentComponent();
      });

    this.sldsNonStandardControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((soldesNonStandard: SldNonStandard[]) => {
        this.notifyParentComponent();
      });

    this.modalitesReductionControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((modalitesReduction: ModalitesReduction[]) => {
        this.textModalitesReductionControl.setValue(
          this.displayText(modalitesReduction, "modaliteReductions")
        );
        this.notifyParentComponent();
      });

    this.modalitesVersementControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((modalitesVersement: ModalitesVersement) => {
        if (modalitesVersement && !this.viewRight) {
          if (modalitesVersement.code === "STD") {
            this.textModaliteVersementControl.setValue(
              modalitesVersement.texte
            );
            this.textModaliteVersementControl.setValidators([]);
            this.textModaliteVersementControl.disable();
          } else {
            this.textModaliteVersementControl.enable();
            this.textModaliteVersementControl.setValidators([
              Validators.required
            ]);
            // ne pas mettre le curseur sur le champ s'il est déjà rempli
            // setTimeout(() => {
            if (
              this.textModaliteVersementControl.value === "" ||
              this.textModaliteVersementControl.value == null
            ) {
              this.modVersementTextArea.nativeElement.focus();
            }
            // }, 50);
            this.textModaliteVersementControl.setValue("");
          }
        }
        this.textModaliteVersementControl.updateValueAndValidity();
        this.textModaliteVersementControl.valueChanges
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(textModaliteVersement => { });
        this.notifyParentComponent();
      });

    this.textModaliteVersementControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(textModaliteVersement => {
        this.notifyParentComponent();
      });

    if (this.formDocAttribControl) {
      this.formDocAttribControl.valueChanges
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((formDocAttrib: FormDocAttrib) => { });
    }

    if (this.typDocAttribControl) {
      this.typDocAttribControl.valueChanges
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((typDocAttrib: TypeDocAttrib) => {
          this.notifyParentComponent();
        });
    }

    this.delaiValiditeControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(value => {
        if (this.dossierService.dossier) {
          if (
            (value < 48 || value > 72) &&
            (this.dossierService.dossier.numeroAid === null ||
              (this.dossierService.dossier.numeroAid !== null &&
                this.dossierService.dossier.statutPhase !== "A"))
          ) {
            this.delaiValiditeControl.setErrors({ margeValidite: true });
          }
        }
        this.notifyParentComponent();
      });
  }

  onModaliteVersementSelectOption(event: MatRadioChange) {
    this.notifyParentComponent();
  }

  /**
   * Met à jour la valeur de form document attributif sur ouvrage
   * @param event
   */
  onformDocAttrib(event: MatRadioChange) {
    if (
      this.formDocAttribControl &&
      this.dossier &&
      this.dossier.dossierAdmin
    ) {
      this.dossier.dossierAdmin.formDocAttrib = this.formDocAttribs.find(
        formDocAttrib => formDocAttrib.code === event.value.code
      );
      this.formDocAttribControl.setValue(
        this.dossier.dossierAdmin.formDocAttrib
      );
      this.notifyParentComponent();
    }
  }

  /**
   * Met à jour la valeur de type document attributif
   * @param event
   */
  ontypDocAttrib(event: MatRadioChange) {
    if (this.typDocAttribControl && this.dossier && this.dossier.dossierAdmin) {
      this.dossier.dossierAdmin.typDocAttrib = this.typDocAttribs.find(
        typDocAttrib => typDocAttrib.code === event.value.code
      );
      this.typDocAttribControl.setValue(this.dossier.dossierAdmin.typDocAttrib);
      this.notifyParentComponent();
    }
  }

  /**
   * Met à jour la valeur de travaux sur ouvrage
   * @param event
   */
  onChangeTravSurOuvrage(event: any) {
    if (event) {
      this.dossier.dossierAdmin.travauxOuvrage = event.checked;
      this.dossierService._travauxOuvrage.next(event.checked);
      this.notifyParentComponent();
    }
  }
  /**
   *
   * @param event notify parent there it had changed position
   */
  onChangeDerogatoir(event: any) {
    this.notifyParentComponent();
  }
  /**
   *
   * @param event notify parent there it had changed position
   */
  onChangeMargeAvenir(event: any) {
    this.notifyParentComponent();
  }

  limitDecimalTo2(value: any): number {
    const factor = Math.pow(10, 2);
    return Math.round(value * factor) / factor;
  }
  /**
   * allows to compare two objects
   * @param compareItem1;
   * @param compareItem2;
   */
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }
  /**
   * create an empty file : descriptif technique
   */
  createDescreptifTech() {
    this.spinnerLuncher.show();
    this.canCreateDescTech = false;
    // get the current dossier id
    let idDossier;
    if (this.dossierService.dossier) {
      idDossier = this.dossierService.dossier.id;
      // call service
      this.dossierService.createDescriptifTech(idDossier).subscribe(
        descriptifTech => {
          this.canCreateDescTech = true;
          this.descriptifTechnique = descriptifTech;
          this.spinnerLuncher.hide();
          if (this.viewRight || (this.viewAdministratif && !this.dossierService.dossier.displayDescGenerale)) {
            window.open(this.descriptifTechnique.urlFichier, '_self');

          } else {
            window.open(this.descriptifTechnique.urlOffice, "_self");
          }
          this.heurModification = this.datePipe.transform(
            this.descriptifTechnique.dateModification,
            "HH:mm"
          );
          this.dateModification = this.datePipe.transform(
            this.descriptifTechnique.dateModification,
            "dd/MM/yyyy"
          );
          this.descriptifTechniqueChangesEvent.emit(this.descriptifTechnique);
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          this.canCreateDescTech = false;
          this.gcdIndisponible = true;
          const snackMessage = getErrorMessage(error, `erreur technique, impossible de créer le descriptif technique.`);
          const snackbarRef = this._snackbar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              console.error(error);
            });
        });
    }
  }

  /**
   * read the descriptif technique by url
   */
  readDescriptifTech() {
    let codeDoc;
    if (this.descriptifTechnique && this.descriptifTechnique.codeDoc) {
      codeDoc = this.descriptifTechnique.codeDoc;
      // call service readDescriptifTech
      this.dossierService.readDescriptifTech(codeDoc).subscribe(
        descriptifTechnique => {
          if (
            this.viewRight ||
            this.dossierService.dossier.displayDescGenerale
          ) {
            window.open(this.descriptifTechnique.urlFichier, "_self");
          } else {
            window.open(this.descriptifTechnique.urlOffice, "_self");
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
    }
  }

  /**
   *  Permet de rendre l'url "safe" à l'ouverture pour Descriptif Technique
   * @param url
   */
  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  displayText(list: EngagementsParticuliers[], attribut): string {
    let text = "";
    list.forEach(engagement => {
      text += engagement.texte + "\n";
    });
    if (text === "") {
      if (attribut === "engagementsParticuliers") {
        text = this.textDTP;
      } else {
        text = this.textMRA;
      }
    }
    return text;
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    if (this.phaseSubscription) {
      this.phaseSubscription.unsubscribe();
    }
    if (this.dossierReadySubscription) {
      this.dossierReadySubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
