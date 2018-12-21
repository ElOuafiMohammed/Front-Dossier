import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import {
  MatAutocompleteSelectedEvent,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MatSnackBar
} from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MontantsAideManuelComponent } from "app/pages/dossiers/dossier/nature-operation/montants-aide-manuel/montants-aide-manuel.component";
import { CoFinanceur } from "app/pages/dossiers/dossier/plan-financement/tableau-dynam-cofinancements/tableau-dynam-cofinancements-interface";
import { ConfirmPopupComponent } from "app/shared/confirm-popup/confirm-popup.component";
import { DeletePopupComponent } from "app/shared/delete-popup/delete-popup.component";
import GeneriqueListValeur from "app/shared/generic-listValeur";
import MethodeGenerique, {
  minSearchLength,
  SpinnerLuncher
} from "app/shared/methodes-generiques";
import BeneficiaireHandler from "app/shared/shared.beneficiare";
import {
  afficherErreur,
  afficherMessageValide,
  getErrorMessage,
  snackbarConfigError
} from "app/shared/shared.retourApi";
import { sigaTrackById } from "app/shared/tracked-by-id-numero";
import NumberUtils from "app/shared/utils/number-utils";
import { FormatMonetairePipe } from "app/theme/pipes/formatMonetaire/format-monetaire.pipe";
import { Observable, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";

import { Phase } from "../create-dossier/create-dossier.interface";
import {
  BenefRegex,
  Dossier,
  FrenchDateRegex,
  PreDossier,
  TextTDP
} from "../dossiers.interface";
import { ComponentViewRightMode, DossierService } from "../dossiers.service";
import { RefuseDossierPopupComponent } from "../refuse-dossier-popup/refuse-dossier-popup.component";
import {
  DescriptifTechnique,
  Dispositif,
  DossierFinancier,
  LignePrev,
  OperationDossier,
  TextMRA
} from "./../dossiers.interface";
import {
  Avis,
  Caracteristique,
  DispositionsFinancieres,
  Domaine,
  DossierAction,
  EncadrementCommJustif,
  EngagementsParticuliers,
  MasseEau,
  ModalitesReduction,
  ModalitesVersement,
  NatureOperation,
  NiveauPriorite,
  Operation,
  OrigineDemande,
  ProcedureDecision,
  SessionDecision,
  SldNonStandard,
  Theme,
  Tooltip,
  Typologie
} from "./dossier.interface";
import {
  EnumActionDossier,
  EnumProfilDossier
} from "./enumeration/enumerations";
import {
  ImpactOuvrages,
  Ouvrage,
  ParametreDonneeSpec,
  TypeOuvrage
} from "./nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface";
import { PieceJointe } from "./pieces-jointes/pieces-jointes.interface";
import { RecapCoFinancementComponent } from "./plan-financement/recap-co-financement/recap-co-financement.component";
import { Libelle } from "./previsionnel/tableau-dynam-prev/tableau-dynam-prev-interface";
import { Remarque } from "./remarque/remarque.interface";

/**
 * Component that update SIGA dossiers
 */
@Component({
  templateUrl: "./dossier.component.html",
  styleUrls: ["./dossier.component.scss"]
})
export class DossierComponent extends ComponentViewRightMode
  implements OnInit, OnDestroy {
  // References to directly access for custom value Input / DOM state
  @ViewChild("button") refuseDossierButton: any;
  @ViewChild("input") natureOperationInput: any;
  @ViewChild("group") natureToggleGroup: any;
  @ViewChild("montantAideManuel")
  montantAideManuel: MontantsAideManuelComponent;
  @ViewChild("recapCoFinancement")
  recapCoFinancement: RecapCoFinancementComponent;

  formUpdateDossier: FormGroup;
  formPrevisionnel: FormGroup;
  formThemes: FormGroup;
  formRecaputilatif: FormGroup;
  formDescription: FormGroup;
  formAvisAttribution: FormGroup;
  formCoutsTravaux: FormGroup;
  formSpecificiteCalcul: FormGroup;
  validTablePrev = true;
  validTableCofin = true;
  validTable = true;
  validTableDispositifRattachPrev = true;
  validListPieceJointes = true;
  validCorrespondants = true;
  touchedTablePrev = false;
  touchedTableDpPrev = false;
  touchedTableCofin = false;
  validTableOuvrage = true;
  masseEauChange = false;
  masseEauHasError = false;
  pageInfoSpecifiteHasError = false;
  validTableDispositif = true;
  changeTableDispositif = false;
  infoSpecUpdated = false;
  formMontantsAideManuel: FormGroup;
  snackbarSubscription: Subscription;
  changeRecap: boolean;
  changeCorrespondant: boolean;
  closeClicked = false;
  touchedRemarque = false;
  knownPhases = ["P00", "P10", "P20", "T10", "T15"];
  thematiqueList = ["COMM", "DDSP", "ETRE", "MAIB", "TGIV"];
  actualPhase: string;
  regionHasError = false;
  regionEditionMode = false;
  bvGestionHasError = false;
  bvGestionEditionMode = false;
  departementHasError = false;
  departementEditionMode = false;
  communeHasError = false;
  communeEditionMode = false;
  blocNoteEditionMode = false;
  blocNote = "";
  blocNoteValueExist: string;
  editionModeImpact = false;
  descptionChange = false;
  delaiFinValiditeOut = null;
  recipientIsRequired = false;
  responsableAdmEdit = false;
  localisationPertinentehasError = false;

  /**
   * List of possible OrigineDemandes for the creation
   */
  origineDemandes: OrigineDemande[] = [];
  listRemarques: Remarque[] = [];
  addRemarqueClosed = true;
  filteredOrigineDemandes: Observable<OrigineDemande[]>;
  readonly origineDemandeValidatorKey = "origineDemandeNotFound";
  montantAutoFinancementError = 0;
  hasInfoSpec = false;
  //  descptionChange: boolean;

  /**
   * Array of phase
   */
  phases: Phase[];
  displayDescGenerale = false;
  tauxError: boolean = false;

  get origineDemandeControl() {
    return this.formUpdateDossier.get("origineDemande");
  }
  benefInactive: boolean;
  get intituleControl() {
    return this.formUpdateDossier.get("intitule");
  }
  get benefNumberControl() {
    return this.formUpdateDossier.get("benef_number");
  }
  get benefLibelleControl() {
    return this.formUpdateDossier.get("benef_libelle");
  }
  get phaseControl() {
    return this.formUpdateDossier.get("phase");
  }
  get dateDemandeControl() {
    return this.formUpdateDossier.get("dateDemande");
  }
  get dateCompletControl() {
    return this.formUpdateDossier.get("dateComplet");
  }

  get numeroAidControl() {
    return this.formUpdateDossier.get("numeroAid");
  }
  get anneeControl() {
    return this.formUpdateDossier.get("annee");
  }
  get sessionControl() {
    return this.formUpdateDossier.get("sessionNumero");
  }

  priorites: NiveauPriorite[] = [];
  filteredPriorites: Observable<NiveauPriorite[]>;
  readonly prioriteValidatorKey = "prioriteNotFound";
  get prioriteControl() {
    return this.formUpdateDossier.get("priorite");
  }

  procedures: ProcedureDecision[] = [];
  filteredProcedures: Observable<ProcedureDecision[]>;
  readonly procedureValidatorKey = "procedureNotFound";
  get procedureControl() {
    return this.formUpdateDossier.get("procedureDecision");
  }

  naturesOperation: NatureOperation[] = null;
  filteredNatureOperation: NatureOperation[] = null;
  filteredUponUserInputNatureOperation: Observable<NatureOperation[]>;
  displayedOperations: Operation[] = [];
  currentOperation: Operation = null;
  cofinaceur: CoFinanceur[] = [];
  readonly natureOperationValidatorKey = "natureNotFound";
  get naturesOperationControl() {
    return this.formUpdateDossier.get("operations");
  }

  @Output() editOuvrageEvent: EventEmitter<any> = new EventEmitter();
  domaines: Domaine[] = [];
  get domaineControl() {
    return this.formUpdateDossier.get("domaine");
  }

  /**
   * boolean that retrieves the state of to create a line of dispositif
   */

  dispositifEditionMode = false;

  valueCloseDialog = false;

  /**
   * Used to avoid multi-click from the user
   */
  submitted = false;

  /**
   * boolean that retrieves the state of the page when there are errors
   */
  pageHasError = false;

  /**
   * The Message of exception handler if beneficaire does not exist
   */
  message: string = null;

  /**
   * Tooltip used to display RefusDossier informations when the Dossier is disabled
   */
  tooltip: Tooltip = null;

  /**
   * indicator valid values in coutTravaux
   */
  validCoutTravaux = true;

  /**
   * Lines used in table previsionnel
   */
  thematiqueLinesPrevisionnel: Libelle[] = [];

  /**
   * Lines used in table financement
   */
  cofinanceurlines;
  /**
   * value Operation Change
   */
  private unsubscribe = new Subject<void>();
  maxDate = new Date();
  minDate = new Date(1950, 0, 1);
  dateRegex: RegExp = FrenchDateRegex;
  textDTP: string = TextTDP;
  textMRA: string = TextMRA;
  dossierAction: DossierAction = null;
  erreurFormCoutOperation = false;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * Component dependencies
   * @ param dialog used to display the popup
   * @ param dossierService used to manage dossiers
   * @ param _snackbar used to display snackbars
   * @ param _formBuilder used to create the form
   * @ param _router handle manual navigation
   * @ param _changeDetector triggers Angular change detection
   */

  constructor(
    public dialog: MatDialog,
    public dossierService: DossierService,
    private _snackbar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _formatMonetairePipe: FormatMonetairePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _location: Location,
    public translate: TranslateService,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super(dossierService);
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.spinnerLuncher.show();
    this.dossierService.dossier = null;
    this.changeRecap = false;
    this.changeCorrespondant = false;
    this.formUpdateDossier = this._formBuilder.group({
      intitule: [null, [Validators.maxLength(80)]],
      benef_number: [
        null,
        [
          Validators.maxLength(9),
          Validators.required,
          Validators.pattern(BenefRegex)
        ]
      ],
      benef_libelle: [
        { value: null, disabled: true },
        [Validators.maxLength(9)]
      ],
      phase: [{ value: null, disabled: true }, []],
      dateDemande: [null, []],
      origineDemande: [null, []],
      numeroAid: [{ value: null, disabled: true }, []],
      operations: [null, []],
      priorite: [null, []],
      domaine: [null, []],
      procedureDecision: [null, []],
      annee: [{ value: null, disabled: true }],
      sessionNumero: [{ value: null, disabled: true }],
      dateComplet: [null, []]
    });

    // store current and previous page
    if (this.dossierService.previousPage === "") {
      this.dossierService.previousPage = this._router.url;
    } else {
      this.dossierService.previousPage = this.dossierService.currentPage;
    }
    this.dossierService.currentPage = this._router.url;
    this._route.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      const dossierId: number = params["dossierId"];
      this.dossierService.getDossier(dossierId).subscribe(
        dossier => {
          this.loadOperationsDossier(dossier);
          this.dossierService.dossier = dossier;
          this.actualPhase = this.dossierService.dossier.phase;
          this.dossierService.preDossier = Object.assign(
            {},
            dossier.preDossier
          );
          this.dossierService.dossierFinancier = Object.assign(
            {},
            dossier.dossierFinancier
          );
          if (this.viewAdministratif) {
            this.dateCompletControl.disable();
            this.dateDemandeControl.disable();
          }
          this.displayOngletforThema(dossier);

          // open bloc remarque if we come from accueil
          if (
            this.dossierService.previousPage &&
            this.dossierService.previousPage.includes("/accueil")
          ) {
            this.addRemarque();
          }

          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          // NN setTimeout(() => {
          this.updateFormData(dossier);
          this.setControlListenners();
          // NN }, 0);
          if (dossier.phase === "T35") {
            this.procedureControl.disable({ emitEvent: false });
          }
          // We need the currentDisplayedOperations to filter the natures to set the Observable stream on NatureOperationAutocomplete
          // TODO : IMPROVE - Move this and manage with a subject that triggers once getDossier() and getNatureOperation() complete.
          if (dossier.thematique !== undefined) {
            this.dossierService
              .getNatureOperation(
                dossier.thematique.code,
                null,
                true,
                100000,
                null
              )
              .subscribe(data => {
                // Stores the original list of NatureOperation for reference
                this.naturesOperation = data.natureOperations;
                this.filteredNatureOperation = data.natureOperations;
                // tslint:disable-next-line:max-line-length
                this.filteredUponUserInputNatureOperation = GeneriqueListValeur.filtringList(
                  this.naturesOperation,
                  this.naturesOperationControl,
                  this.natureOperationValidatorKey,
                  minSearchLength,
                  "natureOperation"
                );
              });

            this.dossierService
              .getLinesOfThematique(dossier.thematique.code)
              .subscribe(lines => {
                // Pass lines to table component
                this.thematiqueLinesPrevisionnel = lines;
              });
          }
          this.dossierService.getLinesOfFinanceurs().subscribe(lines => {
            // Pass lines to table component
            this.cofinanceurlines = lines;
          });
          if (this.viewRight) {
            this.formUpdateDossier.disable();
            this.tooltip = new Tooltip(dossier.refusDossier);
          } else {
            this.phaseControl.setValue(dossier.phase);
          }

          if (this.viewAdministratif) {
            this.intituleControl.disable();
            this.benefNumberControl.disable();
            this.phaseControl.disable();
          }
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(
            error,
            `Le dossier n° ${dossierId} est introuvable. Veuillez rechercher un dossier existant.`
          );
          const snackbarRef = this._snackbar.open(
            snackMessage,
            "X",
            snackbarConfigError
          );
          snackbarRef
            .afterDismissed()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {});
          this._router.navigate(["/accueil"]);
        }
      );
    });

    //  setTimeout(() => {
    // Set synchronous validator once the data is available
    this.origineDemandes = this.dossierService.getOrigineDemande();
    // tslint:disable-next-line:max-line-length
    this.filteredOrigineDemandes = GeneriqueListValeur.filtringList(
      this.origineDemandes,
      this.origineDemandeControl,
      this.origineDemandeValidatorKey,
      minSearchLength,
      "listValeur"
    );

    this.procedures = this.dossierService.getProcedureDecisions();
    this.filteredProcedures = GeneriqueListValeur.filtringList(
      this.procedures,
      this.procedureControl,
      this.procedureValidatorKey,
      minSearchLength,
      "listValeur"
    );

    this.priorites = this.dossierService.getNiveauPriorite();
    this.filteredPriorites = GeneriqueListValeur.filtringList(
      this.priorites,
      this.prioriteControl,
      this.prioriteValidatorKey,
      minSearchLength,
      "listValeur"
    );

    this.domaines = this.dossierService.getDomaines();

    //  }, this.dossierService.delay);

    this.setControlDate();
  }

  /**
   * Control sur la validié de la date
   * Véification sur la longuer de la date saisie :
   * exemple 010319999 et 01/03/19999
   * ne fonctionnent pas
   */
  setControlDate() {
    this.formUpdateDossier
      .get("dateDemande")
      .valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe(value => {
        if (
          value === null &&
          !this.dateDemandeControl.errors &&
          !this.viewRight
        ) {
          this.dateCompletControl.setValue(null);
          this.dateCompletControl.disable();
        } else {
          this.dateCompletControl.enable();
        }
        if (value && value._i && !(value._i instanceof Object)) {
          if (isNaN(Number(value._i)) && value._i.length > 10) {
            this.dateDemandeControl.setErrors({ dateLength: true });
          }
          // vérifie que la date respecte le format jj/mm/aaaa
          if (!this.dateRegex.test(value._i)) {
            this.dateDemandeControl.setErrors({ wrongFormat: true });
          }
        }
        if (
          this.formUpdateDossier.get("dateDemande").disable &&
          this.viewAdministratif
        ) {
          this.dateCompletControl.disable();
        }
      });

    this.dateCompletControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(value => {
        if (value && value._i && !(value._i instanceof Object)) {
          if (isNaN(Number(value._i)) && value._i.length > 10) {
            this.dateCompletControl.setErrors({ dateLength: true });
          }
          // vérifie que la date respecte le format jj/mm/aaaa
          if (!this.dateRegex.test(value._i)) {
            this.dateCompletControl.setErrors({ wrongFormat: true });
          }
        }
      });
  }

  loadOperationsDossier(dossier: Dossier) {
    this.blocNoteValueExist = dossier.blocNote;
    // Deep-Copy 1st level of the content to avoid using the same sub-references
    this.displayedOperations = MethodeGenerique.deepClone(
      dossier.operationDossier.operations
    );

    // Deep-copy 2nd level
    this.displayedOperations.forEach(operation => {
      if (operation.coutsTravaux) {
        operation.coutsTravaux = MethodeGenerique.deepClone(
          operation.coutsTravaux
        );
      }

      if (!operation.dispositifRattacheError) {
        operation.dispositifRattacheError = false;
      }

      if (!operation.montantCoutError) {
        operation.montantCoutError = false;
      }
      if (!operation.erreurMontant) {
        operation.erreurMontant = false;
      }

      if (!operation.ouvrageError) {
        operation.ouvrageError = false;
      }

      if (operation.specificiteCalcul === "") {
        operation.specificiteCalcul = null;
      }
    });

    if (this.displayedOperations.length > 0 && this.currentOperation == null) {
      this.currentOperation = this.displayedOperations[0];
    } else {
      this.updateSelectCurrentOperation(
        this.displayedOperations,
        this.currentOperation
      );
    }
  }

  /**
   * @param event : event for edit a line of dispositif
   */
  onDispositifEditionMode(event: boolean) {
    this.dispositifEditionMode = event;
  }

  /**
   * Patches the values from the service in the form
   */
  updateFormData(dossier: Dossier) {
    // Manage radio-button value reference manually
    this.blocNoteValueExist = dossier.blocNote;
    this.displayDescGenerale = false;
    this.dossierService.dossier.displayDescGenerale = false;
    if (dossier.domaine) {
      dossier.domaine = this.domaines.find(
        domaine => domaine.id === dossier.domaine.id
      );
    }

    // setTimeout(() => {
    this.phases = this.dossierService.getPhases();
    // check phase : if phase > A05
    if (this.dossierService.dossier && this.dossierService.dossier.phase) {
      this.displayDescGenerale = MethodeGenerique.isPhase1SupPhase2(
        this.phases,
        this.dossierService.dossier.phase,
        "A05"
      );
      this.dossierService.dossier.displayDescGenerale = this.displayDescGenerale;
    }
    // }, this.dossierService.delay);

    this.formUpdateDossier.patchValue({
      benef_number: dossier.beneficiaire.reference,
      intitule: dossier.intitule,
      phase: dossier.phase,
      origineDemande: dossier.origineDemande,
      dateDemande: dossier.dateDemande,
      dateComplet: dossier.dateComplet,
      benef_libelle: dossier.beneficiaire.raisonSociale,
      numeroAid: dossier.numeroAid,
      operations: null,
      priorite: dossier.preDossier ? dossier.preDossier.niveauPriorite : null,
      domaine: dossier.domaine,
      procedureDecision: dossier.procedureDecision
        ? dossier.procedureDecision
        : null,
      annee: dossier.sessionDecision ? dossier.sessionDecision.annee : null,
      sessionNumero: dossier.sessionDecision
        ? dossier.sessionDecision.numero
        : null
    });

    if (
      !dossier.beneficiaire.actif &&
      this.dossierService.dossier.statutPhase !== "A"
    ) {
      this.benefInactive = true;
    }
  }

  setControlListenners() {
    // Bénéficiaire libelle handler
    this.benefNumberControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((value: string) => {
        this.message = null;
        this.benefInactive = false;
        // Forces the error state to appear (touched status) when there are enough numbers
        if (value && value.length === 9) {
          this.benefNumberControl.markAsTouched();
        }
        if (this.benefNumberControl.valid) {
          const benefNumber = this.benefNumberControl.value.toUpperCase();
          this.dossierService.getBeneficaire(benefNumber).subscribe(
            beneficiaire => {
              // The form control doesn't match the beneficiaire, so we use the service directly
              this.dossierService.dossier.beneficiaire = beneficiaire;
              this.benefLibelleControl.setValue(beneficiaire.raisonSociale);
              if (
                !beneficiaire.actif &&
                this.dossierService.dossier.statutPhase !== "A"
              ) {
                this.benefNumberControl.setErrors({ benefInactive: true });
              }
            },
            (error: HttpErrorResponse) => {
              this.message = getErrorMessage(error);
              this.benefNumberControl.setErrors({ benefNotFound: true });
              this.benefLibelleControl.setValue("");
            }
          );
        } else {
          this.benefLibelleControl.setValue("");
        }
      });
  }

  /**
   * Returns the list of filtered naturesOperation depending on which operations are currently displayed in the dossier
   */
  filterNaturesFromDossier(
    naturesOperation: NatureOperation[]
  ): NatureOperation[] {
    if (this.displayedOperations.length > 0) {
      const currentDossierNatures: NatureOperation[] = [];
      this.displayedOperations.forEach(displayedOperation => {
        // Array.find() used to avoid reference issues between Objects
        const natureReference = naturesOperation.find(
          nature => nature.id === displayedOperation.natureOperation.id
        );
        currentDossierNatures.push(natureReference);
      });

      // Array.find() used since Array.includes() is not supported in IE11
      return naturesOperation.filter(
        natures =>
          !currentDossierNatures.find(nature =>
            nature.id === natures.id ? true : false
          )
      );
    } else {
      return [...naturesOperation];
    }
  }
  /**
   * Manages changes on a selected NatureOperation
   * @param operation the
   */
  onSelectOperation(operation: Operation) {
    this.currentOperation = operation;
  }
  /**
   * Only exists to keep the tracking on the newly selected operation.
   * For some reason, you need to click twice on the previous operation
   * when you add one in order to select it without this function ?
   */
  forceSelect(operation: Operation): void {}

  /**
   * Triggers when a session has been selected
   * @param event the event containing the selected option
   */
  onNatureOperationSelect(event: MatAutocompleteSelectedEvent) {
    const natureOperation = event.option.value as NatureOperation;
    const newOperation = new Operation(natureOperation);
    this.numOdreOperation(newOperation);
    this.displayedOperations.push(newOperation);
    if (this.natureToggleGroup) {
      this.natureToggleGroup.value = null; // Required to reset toggle state
      this.natureToggleGroup.value = newOperation;
    }

    // Switches to the new operation
    this.currentOperation = newOperation;
    // Updates the filter
    this.naturesOperationControl.setValue(null, { emitEvent: true });
    this.naturesOperationControl.markAsPristine();
  }
  numOdreOperation(newOperation: Operation) {
    let i = 1;
    this.displayedOperations.forEach(op => {
      if (op.natureOperation.libelle === newOperation.natureOperation.libelle) {
        if (i < op.noOrdre + 1) {
          i = op.noOrdre + 1;
        }
      }
    });
    newOperation.noOrdre = i;
  }
  /**
   * Delete an operation on the close button icon
   * @param operation the selected operation id
   */
  onDeleteOperation(operation: Operation) {
    return this.openDeleteDialog(operation)
      .beforeClosed()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((result: boolean) => {
        const total =
          operation.montantSubvention + operation.montantAvanceEqSubvention;
        this.dossierService.dossierFinancier.totalEquivalentSubventionAgence =
          this.dossierService.dossierFinancier.totalEquivalentSubventionAgence -
          total;
        this.dossierService.dossier.dossierFinancier.totalMontantOperation -=
          operation.totalMontantOperation;
        this.recapCoFinancement.getTotalEquivalentSubventionAgenceDeletOp(
          NumberUtils.toNumber(
            this.dossierService.dossierFinancier.totalEquivalentSubventionAgence
          )
        );
        this.recapCoFinancement.getTotalOperation(
          NumberUtils.toNumber(
            this.dossierService.dossier.dossierFinancier.totalMontantOperation
          )
        );
        if (result) {
          // The state toggle fails to follow the indexes when you delete the first item
          if (operation === this.displayedOperations[0]) {
            // Used to manage the angular context
            setTimeout(() => {
              if (this.natureToggleGroup) {
                this.natureToggleGroup.value = null; // Required to reset toggle state
                this.natureToggleGroup.value = this.currentOperation;
              }
            }, 0);
          }
          let validCurrentOperation = false;
          // Updates the dipslay
          this.displayedOperations = this.displayedOperations.filter(
            operations => {
              if (operations !== operation) {
                return true;
              } else {
                if (operation.enableMessageError === true) {
                  validCurrentOperation = true;
                }
                return false;
              }
            }
          );
          if (validCurrentOperation) {
            this.isFormOuvrageValid(true);
          }

          /**
           * Gestion des erreurs de l'opération
           */
          // S'il y a une erreur de Bv gestion
          if (operation.bvGestionError) {
            this.onErreurEventBv(false);
          }

          // S'il y a une erreur de masse d'eau
          if (operation.masseEauError) {
            this.onMasseEauHasErrorEvent(false);
          }

          // S'il y a une erreur de rigion
          if (operation.regionError) {
            this.onErreurEventRegion({ type: "region", value: false });
          }

          // S'il y a une erreur de département
          if (operation.departementError) {
            this.onErreurEventDepartement({
              type: "departement",
              value: false
            });
          }

          // S'il y a une erreur de commune
          if (operation.communeError) {
            this.onErreurEventDepartement({ type: "commune", value: false });
          }

          // Updates the filter - recalculates to sort anew
          // this.filteredNatureOperation = this.filterNaturesFromDossier(this.naturesOperation);
          this.naturesOperationControl.setValue(null, { emitEvent: true });

          // Resets to 1st operation by default
          if (
            this.displayedOperations.length > 0 &&
            operation === this.currentOperation
          ) {
            if (this.natureToggleGroup) {
              this.natureToggleGroup.value = this.displayedOperations[0];
            }
            this.currentOperation = this.displayedOperations[0];
          }
          // Resets to 1st operation if another operation is deleted
          if (
            this.displayedOperations.length > 0 &&
            operation !== this.currentOperation
          ) {
            if (this.natureToggleGroup) {
              this.natureToggleGroup.value = this.displayedOperations[0];
            }
            this.currentOperation = this.displayedOperations[0];
          }

          // When we delete the last operation
          if (this.displayedOperations.length === 0) {
            this.currentOperation = null;
          }
        }
      });
  }

  /**
   * Manages how an Origine Demande should be displayed in the input
   * @param origineDemande a given origineDemande to be formatted
   */
  displayOrigineDemande(origineDemande: OrigineDemande): any {
    if (origineDemande) {
      return `${origineDemande.libelle}`;
    }
  }

  /**
   * Manages how an nature operation should be displayed in the input
   * @param operation a given operation to be formatted
   */
  displayNaturesOperation(operation: NatureOperation): string {
    if (operation) {
      return `${operation.ligne} - ${operation.libelle}`;
    }
  }

  /**
   * Manages how a priorite should be displayed in the input
   * @param priorite a given NiveauPriorite to be formatted
   */
  displaySession(session: ProcedureDecision): string | undefined {
    if (session) {
      return `${session.code}`;
    }
  }

  /**
   * Manages how a priorite should be displayed in the input
   * @param priorite a given NiveauPriorite to be formatted
   */
  displayNiveauPriorite(priorite: NiveauPriorite): string | undefined {
    if (priorite) {
      return `${priorite.code}`;
    }
  }

  /**
   * Open popup of search  beneficiary
   */
  searchBeneficiary() {
    BeneficiaireHandler.searchBeneficiary(
      this.submitted,
      this.benefLibelleControl,
      this.benefNumberControl,
      this.dossierService.dossier.beneficiaire,
      this.dialog
    );
  }

  /**
   * Open popup of refuse dossier
   */
  refuserDossier() {
    this.submitted = true;
    const matDialogRef = this.openRefuseDossierDialog();
    matDialogRef
      .beforeClosed()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((result: boolean) => {
        // Dossier successfully refused
        if (result) {
          const previousDossierData = this.dossierService.dossier;
          this.loadOperationsDossier(previousDossierData);
          // Update the form with latest saved data
          this.updateFormData(previousDossierData);
          this.resetFormToPristine();
          this.formUpdateDossier.disable();
          this.tooltip = new Tooltip(this.dossierService.dossier.refusDossier);
          // tslint:disable-next-line:max-line-length
          afficherMessageValide(
            `Le dossier ${
              this.dossierService.dossier.numeroDossier
            } a bien été refusé en phase ${this.dossierService.dossier.phase}`,
            this._snackbar,
            this.submitted,
            this._changeDetector
          );
          this.submitted = false;
        }
      });

    matDialogRef.afterClosed().subscribe(res => {
      if (this.displayedOperations.length === 0) {
        this.currentOperation = null;
      }
    });

    matDialogRef.afterClosed().subscribe(() => {
      MethodeGenerique.fixButtonRippleEffectBug(this.refuseDossierButton);
      this.submitted = false;
    });
  }

  /**
   * Configures Material Dialog of refuse dossier
   */
  openRefuseDossierDialog(): MatDialogRef<RefuseDossierPopupComponent> {
    const config = new MatDialogConfig();
    config.width = "600px";
    config.disableClose = true;
    config.autoFocus = false;
    config.data = this.dossierService.dossier;
    return this.dialog.open(RefuseDossierPopupComponent, config);
  }

  /**
   * Recover the error status or not from the page
   */
  recoverErrorStatus(): Observable<boolean> | boolean {
    // A DECOMMENTER au vesoin :  log pour debug bouton enregistrer disable
    // console.log('submitted n est pas valid', this.submitted);
    // console.log('dossier chargé est pas valid', !this.dossierService.dossier);
    // console.log('formSpecificiteCalcul calcul n est pas valid', this.formSpecificiteCalcul && !this.formSpecificiteCalcul.valid);
    // console.log('formAvisAttribution calcul n est pas valid', this.formAvisAttribution && !this.formAvisAttribution.valid);
    // console.log('validTableDispositifRattachPrev calcul n est pas valid', this.validTableDispositifRattachPrev);
    // console.log('formRecaputilatif n est pas valid', this.formRecaputilatif && !this.formRecaputilatif.valid);
    // console.log('formDescription n est pas valid', this.formDescription && !this.formDescription.valid);
    // console.log('formUpdateDossier n est pas valid', this.formUpdateDossier && !this.formUpdateDossier.valid);
    // console.log('beneficiaire n est pas actif', (this.dossierService.dossier.beneficiaire !== null && !this.dossierService.dossier.beneficiaire.actif));
    // console.log('beneficiaire absent', (this.dossierService.dossier.beneficiaire == null));
    // console.log('formPrevisionnel n est pas valid', this.formPrevisionnel && !this.formPrevisionnel.valid);
    // console.log('validTablePrev n est pas valid', !this.validTablePrev);
    // console.log('validCoutTravaux n est pas valid', !this.validCoutTravaux);
    // console.log('validTableDispositifRattachPrev n est pas valid', !this.validTableDispositifRattachPrev);
    // console.log('formMontantsAideManuel n est pas valid', (this.formMontantsAideManuel && !this.formMontantsAideManuel.valid));
    // console.log('validTableOuvrage n est pas valid', !this.validTableOuvrage);
    // console.log('dispositifEditionMode n est pas valid', this.dispositifEditionMode);
    // console.log('validTableDispositif n est pas valid', !this.validTableDispositif);
    // console.log('masseEauHasError n est pas valid', this.masseEauHasError);
    // console.log('regionHasError n est pas valid', this.regionHasError);
    // console.log('bvGestionHasError n est pas valid', this.bvGestionHasError);
    // console.log('departementHasError n est pas valid', this.departementHasError);
    // console.log('communeHasError n est pas valid', this.communeHasError);

    // vue Admin
    this.pageHasError = false;
    let operationErrorLocalisationPertinente = false;
    this.displayedOperations.forEach(operation => {
      if (operation.localisationPertinenteError) {
        operationErrorLocalisationPertinente = true;
      }
    });
    if (this.viewAdministratif) {
      if (
        this.dossierService !== null &&
        (this.formRecaputilatif &&
          !this.formRecaputilatif.valid &&
          this.benefInactive)
      ) {
        this.pageHasError = true;
      }
      // vue non Admin
    } else {
      if (
        this.dossierService.dossier !== null &&
        (!this.formUpdateDossier.valid ||
          (this.formPrevisionnel && !this.formPrevisionnel.valid) ||
          (this.formMontantsAideManuel && !this.formMontantsAideManuel.valid) ||
          !this.validTablePrev ||
          !this.validCoutTravaux ||
          (this.dossierService.dossier.beneficiaire != null &&
            !this.dossierService.dossier.beneficiaire.actif) ||
          this.dossierService.dossier.beneficiaire == null ||
          (this.formDescription && !this.formDescription.valid) ||
          (this.formRecaputilatif && !this.formRecaputilatif.valid) ||
          this.dispositifEditionMode ||
          (this.formAvisAttribution && !this.formAvisAttribution.valid) ||
          (this.formSpecificiteCalcul && !this.formSpecificiteCalcul.valid) ||
          !this.validTableDispositifRattachPrev ||
          this.masseEauHasError ||
          !this.validTableDispositif ||
          !this.validTableOuvrage ||
          this.regionHasError ||
          this.benefInactive ||
          this.bvGestionHasError ||
          this.departementHasError ||
          this.communeHasError ||
          this.tauxError ||
          !this.validCorrespondants ||
          this.montantAutoFinancementError < 0 ||
          this.pageInfoSpecifiteHasError ||
          operationErrorLocalisationPertinente)
      ) {
        this.pageHasError = true;
      }
    }

    // console.log('INIT pageHasError n est pas valid', this.pageHasError);
    return this.pageHasError;
  }

  /**
   * Configures OK / KO Material Dialog and returns the reference
   */
  openConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    const myDialog = this.dialog.open(ConfirmPopupComponent, {
      data: {
        valueStatusError: this.recoverErrorStatus(),
        typeAction: "update"
      }
    });
    myDialog.afterClosed().subscribe(result => {
      this.changeRecap = false;
      this.changeCorrespondant = false;
      if (result === "save") {
        if (!this.closeClicked) {
          this.emptyStoredValuesOfCriteresSearch();
        }

        this.onSubmitCancel();

        this.valueCloseDialog = true;
      } else if (result === true) {
        if (!this.closeClicked) {
          this.emptyStoredValuesOfCriteresSearch();
        }
        this.valueCloseDialog = true;
      } else if (result === false) {
        this.valueCloseDialog = false;
      }
    });
    return myDialog;
  }

  /**
   * Popup used to display the NatureOperation to delete
   */
  openDeleteDialog(operation: Operation) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = "400px";
    const dialogRef = this.dialog.open(DeletePopupComponent, dialogConfig);
    dialogRef.componentInstance.operation = operation;
    return dialogRef;
  }

  /**
   * Hook on Previsionnel child component @Output()
   */

  onPreDossierFormChange(formPrevisionnel: FormGroup) {
    this.formPrevisionnel = formPrevisionnel;
    const sessionControl = formPrevisionnel.get("session");
    const anneeControl = formPrevisionnel.get("annee");
    const typologieControl = formPrevisionnel.get("typologie");
    const formattedPreDossier: PreDossier = {
      niveauPriorite: null,
      sessionDecision: sessionControl.value
        ? (sessionControl.value as SessionDecision)
        : null,
      anneeEngagPrevi: anneeControl.value
        ? parseInt(anneeControl.value as string, null)
        : null,
      typologie: typologieControl.value
        ? (typologieControl.value as Typologie)
        : null
    };

    if (!this.dossierService.preDossier) {
      this.dossierService.preDossier = formattedPreDossier;
    } else {
      this.dossierService.preDossier = Object.assign(
        this.dossierService.preDossier,
        formattedPreDossier
      );
    }
  }

  /**
   * Hook on Natures Themes child component @Output()
   */
  onThemesFormChange(formThemes: FormGroup) {
    this.formThemes = formThemes;
    const themesControl = formThemes.get("themes");
    this.currentOperation.themes = themesControl.value
      ? (themesControl.value as Theme[])
      : [];
  }

  /**
   * Hook on montants aide manuel child component @Output()
   */
  onMontantsAideManuelFormChange(formMontantsAideManuel: FormGroup) {
    setTimeout(() => {
      this.formMontantsAideManuel = formMontantsAideManuel;
      const avanceControl = formMontantsAideManuel.get("tauxAvance");
      const montantAvanceControl = formMontantsAideManuel.get("montantAvance");
      const equivalentSubControl = formMontantsAideManuel.get(
        "montantAvanceEqSubvention"
      );
      const subventionControl = formMontantsAideManuel.get("tauxSubvention");
      const montantSubControl = formMontantsAideManuel.get("montantSubvention");
      const eqSubventionSpecTauxControl = formMontantsAideManuel.get(
        "tauxSpecifique"
      );
      const eqSubventionSpecControl = formMontantsAideManuel.get(
        "montantEqSubventionSpecifique"
      );
      // setTimeOut For IE
      // tslint:disable-next-line:max-line-length
      this.dossierService.dossierFinancier.totalEquivalentSubventionAgence =
        this.dossierService.dossierFinancier.totalEquivalentSubventionAgence -
        (this.currentOperation.montantSubvention +
          this.currentOperation.montantAvanceEqSubvention);

      this.currentOperation.tauxAvance = avanceControl.value
        ? avanceControl.value
        : 0;
      this.currentOperation.montantAvance = montantAvanceControl.value
        ? NumberUtils.toNumber(montantAvanceControl.value)
        : 0;
      this.currentOperation.montantAvanceEqSubvention = equivalentSubControl.value
        ? NumberUtils.toNumber(equivalentSubControl.value)
        : 0;
      this.currentOperation.tauxSubvention = subventionControl.value
        ? (subventionControl.value as number)
        : 0;
      this.currentOperation.montantSubvention = montantSubControl.value
        ? NumberUtils.toNumber(montantSubControl.value)
        : 0;
      this.currentOperation.tauxSpecifique = eqSubventionSpecTauxControl.value
        ? NumberUtils.toNumber(eqSubventionSpecTauxControl.value)
        : null;
      this.currentOperation.montantEqSubventionSpecifique = eqSubventionSpecControl.value
        ? NumberUtils.toNumber(eqSubventionSpecControl.value)
        : 0;
      this.recapCoFinancement.getTotalEquivalentSubventionAgence(
        NumberUtils.toNumber(equivalentSubControl.value),
        NumberUtils.toNumber(montantSubControl.value)
      );
    }, 10);
  }

  /**
   * Hook on tableau montant cout  child component @Output()
   */
  onTotalMontantRetenuChange(value: {
    value: number;
    typeMontant: string;
  }): void {
    if (this.montantAideManuel && this.currentOperation) {
      this.montantAideManuel.totalMontantRetenuChange(value);
    }
  }

  /**
   * Hook on tableau montant cout  child component @Output()formDescription.get('modaliteVersement')
   */
  onTotalMontantOperationChange(value): void {
    this.recapCoFinancement.getTotalOperation(NumberUtils.toNumber(value));
  }

  /**
   * Hook on Natures Themes child component @Output()
   */
  onRecaputilatifFormChange(formRecaputilatif: FormGroup) {
    this.formRecaputilatif = formRecaputilatif;

    const encadrementControl = this.formRecaputilatif.get("encadrementComm");
    const justifControl = this.formRecaputilatif.get("encadrementJUstif");

    const formattedDossierFinancier: DossierFinancier = {
      encadrementComm: encadrementControl.value as boolean,
      encadrementCommJustifs:
        justifControl && justifControl.value
          ? (justifControl.value as EncadrementCommJustif[])
          : []
    };
    if (!this.dossierService.dossierFinancier) {
      this.dossierService.dossierFinancier = formattedDossierFinancier;
    } else {
      this.dossierService.dossierFinancier = Object.assign(
        this.dossierService.dossierFinancier,
        formattedDossierFinancier
      );
    }
  }

  onDescriptionFormChange(formDescription: FormGroup) {
    this.formDescription = formDescription;
    const descriptionOperationControl = formDescription.get(
      "descriptionOperation"
    );
    const resultatsAttendusControl = formDescription.get("resultatsAttendus");
    const derogationControl = formDescription.get("derogation");
    const justifDerogationControl = formDescription.get("justifDerogation");
    const margeAvenirControl = formDescription.get("margeAvenir");
    const margeAvenirJustifControl = formDescription.get("margeAvenirJustif");

    const delaiValiditeControl = formDescription.get("delaiValidite");
    this.delaiFinValiditeOut = delaiValiditeControl.value;
    const engagementControl = formDescription.get("engagements");
    const dispositionControl = formDescription.get("dispositions");
    const sldsNonStandardControl = formDescription.get("sldsNonStandards");
    const modalitesReductionControl = formDescription.get("modalitesReduction");
    const modalitesVersementControl = formDescription.get("modaliteVersement");
    const texteRecaControl = formDescription.get("text");
    const textModalitesReductionControl = formDescription.get(
      "textModalitesReduction"
    );
    const textModaliteVersementControl = formDescription.get(
      "textModaliteVersement"
    );

    if (this.dossierService.dossier) {
      this.dossierService.dossier.descriptionOperation =
        descriptionOperationControl.value;
      this.dossierService.dossier.resultatsAttendus =
        resultatsAttendusControl.value;
      this.dossierService.dossier.derogatoire = derogationControl.value as boolean;
      this.dossierService.dossier.derogationJustif =
        justifDerogationControl.value;
      this.dossierService.dossier.margeAvenir = margeAvenirControl.value as boolean;
      this.dossierService.dossier.margeAvenirJustif =
        margeAvenirJustifControl.value;
      // this.dossierService.dossier.totalPrixEauTtc = prixTotalControl.value ? (prixTotalControl.value as number) : 0;
      // this.dossierService.dossier.totalPrixHtva = prixHtvaControl.value ? (prixHtvaControl.value as number) : 0;

      const formattedDossierFinancier: DossierFinancier = {
        engagementsParticuliers: engagementControl.value
          ? (engagementControl.value as EngagementsParticuliers[])
          : [],
        dispositionsFinancieres: dispositionControl.value
          ? (dispositionControl.value as DispositionsFinancieres[])
          : [],
        sldsNonStandardsFinancieres: sldsNonStandardControl.value
          ? (sldsNonStandardControl.value as SldNonStandard[])
          : [],
        modaliteReductions: modalitesReductionControl.value
          ? (modalitesReductionControl.value as ModalitesReduction[])
          : [],
        modaliteVersement: modalitesVersementControl.value
          ? (modalitesVersementControl.value as ModalitesVersement)
          : null,
        delaiFinValidite: delaiValiditeControl.value
          ? (delaiValiditeControl.value as number)
          : 48
        /* formDocAttrib: formDocAttribControl.value ? (formDocAttribControl.value as FormDocAttrib) : null,
      typDocAttrib: typDocAttribControl.value ? (formDocAttribControl.value as TypeDocAttrib) : null */
      };
      if (!this.dossierService.dossierFinancier) {
        this.dossierService.dossierFinancier = formattedDossierFinancier;
      } else {
        this.dossierService.dossierFinancier = Object.assign(
          this.dossierService.dossierFinancier,
          formattedDossierFinancier
        );
      }
      const textRecap: string =
        texteRecaControl.value !== this.textDTP
          ? (texteRecaControl.value as string)
          : null;
      this.dossierService.dossier.texteRecapDtp = textRecap;
      // Avoid modaliteVersementTexte update untill formRecaputilatif is not initialized with a non null value
      if (
        textModaliteVersementControl.value !== null &&
        textModaliteVersementControl.value !== ""
      ) {
        this.dossierService.dossier.modaliteVersementTexte =
          textModaliteVersementControl.value;
      }
      const textModalitesReduction: string =
        textModalitesReductionControl.value !== this.textMRA
          ? (textModalitesReductionControl.value as string)
          : null;
      this.dossierService.dossier.texteRecapModaliteReduction = textModalitesReduction;
    }
  }
  eventDesc(value: boolean) {
    this.descptionChange = value;
    if (this.submitted) {
      this.descptionChange = false;
    }
  }

  onAvisAttributionFormChange(formAvisAttribution: FormGroup) {
    this.formAvisAttribution = formAvisAttribution;
    const aviscontrol = formAvisAttribution.get("avis");
    const motifAvisControl = formAvisAttribution.get("motifAvis");
    this.dossierService.dossier.avis = aviscontrol.value
      ? (aviscontrol.value as Avis)
      : null;
    this.dossierService.dossier.motifAvis = motifAvisControl.value
      ? motifAvisControl.value
      : null;
  }
  recapChange(changeRecap: boolean) {
    this.changeRecap = changeRecap;
  }
  correspondantChange(changeCorrespondant: boolean) {
    this.changeCorrespondant = changeCorrespondant;
  }

  displayOngletforThema(dossier: Dossier) {
    this.thematiqueList.forEach(thematique => {
      if (dossier != null && dossier.thematique) {
        if (thematique === dossier.thematique.code) {
          this.hasInfoSpec = true;
        }
      }
    });

    return this.hasInfoSpec;
  }

  onSubmit() {
    this.spinnerLuncher.show();
    this.submitted = true;
    this.changeTableDispositif = false;
    this.changeRecap = false;
    this.changeCorrespondant = false;
    this.infoSpecUpdated = false;
    this.descptionChange = false;
    // Merge objects
    this.updateDossier(this.formatUpdatedDossier());
    this.resetFormToPristine();
  }
  /**
   * OnSubmit Dossier with redirect page recherche
   */
  onSubmitCancel() {
    this.submitted = true;
    this.changeTableDispositif = false;
    this.changeRecap = false;
    this.changeCorrespondant = false;
    this.updateDossierCancel(this.formatUpdatedDossier());
  }
  /**
   *
   * @param formSpecificiteCalcul
   */
  onSpecificiteCalculFormChange(formSpecificiteCalcul: FormGroup) {
    this.formSpecificiteCalcul = formSpecificiteCalcul;
    const specificiteCalculControl = formSpecificiteCalcul.get(
      "specificiteCalcul"
    );
    const montantRetenuPLafonneControl = formSpecificiteCalcul.get(
      "montantRetenuPLafonne"
    );
    this.currentOperation.totalMontantRetenuPlafonne = montantRetenuPLafonneControl.value
      ? NumberUtils.toNumber(montantRetenuPLafonneControl.value)
      : 0;
    this.currentOperation.specificiteCalcul = specificiteCalculControl.value
      ? specificiteCalculControl.value
      : null;
  }

  onCoutsTravauxFormChange(valid: boolean) {
    this.validCoutTravaux = valid;
    if (valid) {
      this.validCoutTravaux = true;
      this.displayedOperations.forEach(op => {
        if (op.montantCoutError === true) {
          this.validCoutTravaux = false;
        }
      });
    } else {
      this.validCoutTravaux = false;
    }
  }

  /**
   * Reformate all amount
   */
  correctAllAmount(data): Operation[] {
    return data.forEach(value => {
      value.montantEligible = NumberUtils.toNumber(value.montantEligible);
      value.montantOperation = NumberUtils.toNumber(value.montantOperation);
      value.montantRetenu = NumberUtils.toNumber(value.montantRetenu);
    });
  }
  onRecapCofinancementFormChange(value: number) {
    this.montantAutoFinancementError = value;
  }
  onLinePrevAttaChange(linesPrev: LignePrev[]) {
    if (linesPrev) {
      this.touchedTablePrev = true;
      this.dossierService.preDossier.lignesPrevisionnel = this.validLinesData(
        linesPrev
      );
    } else {
      this.touchedTablePrev = false;
    }
  }

  remarque(value) {
    if (
      this.dossierService &&
      this.dossierService.dossier &&
      this.dossierService.dossier.dossierCorrespondance
    ) {
      this.listRemarques = this.dossierService.dossier.dossierCorrespondance.remarques;
    }
    if (value.length === 0) {
      this.touchedRemarque = true;
      this.recipientIsRequired = false;
    } else {
      //tes if we have an note without recipient
      if (this.allRemarqueHasRecipient(value).length !== 0) {
        this.recipientIsRequired = true;
      } else {
        this.recipientIsRequired = false;
      }
      // For the cand activate
      const newListRemarque = this.createNewListRemarque(value);

      if (
        JSON.stringify(this.listRemarques) !== JSON.stringify(newListRemarque)
      ) {
        this.touchedRemarque = true;
      }
    }
    this.listRemarques = value;
  }

  /**
   *
   * @param value
   */
  allRemarqueHasRecipient(value: Remarque[]): Remarque[] {
    return value.filter(
      (remark: Remarque) =>
        remark.loginDestinataire === null || remark.hasError === true
    );
  }
  /**
   *
   * @param remarques
   */
  createNewListRemarque(remarques: Remarque[]): Remarque[] {
    let results: Remarque[] = [];
    remarques.forEach((remark: Remarque) => {
      results.push(this.createRemarque(remark));
    });
    return results;
  }
  /**
   *
   * @param remark
   */
  createRemarque(remark: Remarque): Remarque {
    return {
      id: remark.id,
      dateRemarque: remark.dateRemarque,
      loginEmetteur: remark.loginEmetteur,
      nomPrenomEmetteur: remark.nomPrenomEmetteur,
      remarque: remark.remarque,
      loginDestinataire: remark.loginDestinataire,
      loginReponseDe: remark.loginReponseDe,
      nomPrenomReponseDe: remark.nomPrenomReponseDe,
      reponse: remark.reponse,
      dateReponse: remark.dateReponse,
      //US 3499 add Recipient
      lu: remark.lu,
      archive: remark.archive,
      etat: remark.etat
    };
  }
  addRemarque() {
    this.addRemarqueClosed = false;
  }

  closeRemarque() {
    this.addRemarqueClosed = true;
  }

  onDispositifRattachesPrevChange(dispositifRattachesPrev: Dispositif[]) {
    if (dispositifRattachesPrev) {
      this.touchedTableDpPrev = true;
      this.dossierService.preDossier.dispositifPartenariats = this.validDispositifRattachesPrevData(
        dispositifRattachesPrev
      );
    } else {
      this.touchedTableDpPrev = false;
    }
  }

  onLineCofinanceurAttaChange(linesCofin: any) {
    if (linesCofin.data) {
      this.touchedTableCofin = true;
      this.tauxError = linesCofin.tauxError;
      this.dossierService.dossier.planFinancementDossier.coFinanceurs = this.validLinesCofinData(
        linesCofin.data
      );
      this.cofinaceur = this.dossierService.dossier.planFinancementDossier.coFinanceurs;
    }
  }
  validLinesData(data: LignePrev[]): LignePrev[] {
    return data.filter(linePrev => linePrev.ligne.id !== null);
  }

  validDispositifRattachesPrevData(data: Dispositif[]): Dispositif[] {
    return data.filter(dispositif => dispositif.typeDispositif.id !== null);
  }

  isFormDpRattachPrevValid(valid) {
    this.validTableDispositifRattachPrev = valid;
  }

  validLinesCofinData(data: CoFinanceur[]): CoFinanceur[] {
    return data.filter(lineCofin => lineCofin.financeur.id !== null);
  }

  isPiecesJointesListValidParent(valid) {
    this.validListPieceJointes = valid;
  }
  isCorrespondantValidParent(valid) {
    this.validCorrespondants = valid;
  }

  valueBlocNoteChange(event) {
    this.blocNote = event;
    if (this.blocNote !== this.blocNoteValueExist) {
      this.blocNoteEditionMode = true;
    }
    this.blocNoteValueExist = event;
  }

  piecesJointesListParentChanges(data: PieceJointe[]) {
    if (this.dossierService.dossier) {
      this.dossierService.dossier.documentsDossier.documents = data;
    }
  }

  formatUpdatedDossier(): Dossier {
    // Manage special fields that are part of a preDossier
    if (!this.dossierService.preDossier) {
      this.dossierService.preDossier = this.dossierService.dossier.preDossier;
    }

    this.dossierService.preDossier.niveauPriorite = this.prioriteControl.value
      ? this.prioriteControl.value
      : null;
    // this.dossierService.dossier.procedureDecision = this.procedureControl.value ? this.procedureControl.value : null;

    this.displayedOperations.forEach(op => {
      this.updateOuvrageOperation(op);

      op.ouvrageNatureOperation = op.ouvrageNatureOperation.filter(ouvrage => {
        return ouvrage.codeAgence !== "" && ouvrage.libelle !== "";
      });

      op.dispositifPartenariatOperation = op.dispositifPartenariatOperation.filter(
        dispositif => {
          return (
            dispositif.dispositifPartenariat.numeroOrdre !== null &&
            dispositif.dispositifPartenariat.typeDispositif.id !== null
          );
        }
      );
    });
    // Merge the current Dossier with all the possibly updated sub-parts
    return Object.assign(
      this.dossierService.dossier,
      this.formUpdateDossier.value,
      { preDossier: this.dossierService.preDossier } as Partial<Dossier>,
      { dossierFinancier: this.dossierService.dossierFinancier } as Partial<
        Dossier
      >,
      {
        operationDossier: {
          operations: this.displayedOperations
        } as OperationDossier
      } as Partial<Dossier>
    );
  }

  updateOuvrageOperation(operation: Operation) {
    const ouvragesUpdated: Ouvrage[] = [];

    operation.ouvrageNatureOperation.forEach(ouvrage => {
      let typeOuvrage: TypeOuvrage;
      typeOuvrage = {
        id: ouvrage.typeOuvrage.id,
        code: ouvrage.typeOuvrage.code,
        codeParam: ouvrage.typeOuvrage.codeParam,
        libelleParam: ouvrage.typeOuvrage.libelleParam,
        libelle: ouvrage.typeOuvrage.libelle,
        texte: ouvrage.typeOuvrage.texte
      };

      const listCaracteristique: Caracteristique[] = [];
      if (ouvrage.caracteristiqueOuvrage) {
        ouvrage.caracteristiqueOuvrage.forEach(caracteristique => {
          const caracteristique1 = {
            code: caracteristique.code,
            libelle: caracteristique.libelle,
            typeDonnee: caracteristique.typeDonnee,
            valeur: caracteristique.valeur
          };
          listCaracteristique.push(caracteristique1);
        });
      }

      const listImpact: ImpactOuvrages[] = [];
      if (ouvrage.impactOuvrages) {
        ouvrage.impactOuvrages.forEach(impact => {
          const parametreDonneSpec: ParametreDonneeSpec = {
            id: impact.parametreDonneeSpec.id,
            typeDiscriminant: impact.parametreDonneeSpec.typeDiscriminant,
            codeDiscriminant: impact.parametreDonneeSpec.codeDiscriminant,
            codeParam: impact.parametreDonneeSpec.codeParam,
            label: impact.parametreDonneeSpec.label,
            typeDonnee: impact.parametreDonneeSpec.typeDonnee,
            tailleDonnee: impact.parametreDonneeSpec.tailleDonnee,
            codeListe: impact.parametreDonneeSpec.codeListe,
            noOrdre: impact.parametreDonneeSpec.noOrdre
          };

          const impact1 = {
            id: impact.id,
            parametreDonneeSpec: parametreDonneSpec,
            valeurDate: impact.valeurDate,
            valeurString: impact.valeurString,
            valeurInteger: impact.valeurInteger,
            valeurDouble: impact.valeurDouble,
            valeurListe: impact.valeurListe
          };
          listImpact.push(impact1);
        });
      }
      const listMasseEaux: MasseEau[] = [];
      if (ouvrage.masseEaux) {
        ouvrage.masseEaux.forEach(masseEaux => {
          const masseEau = {
            code: masseEaux.code,
            categorieCode: masseEaux.categorieCode,
            categorieLibelle: masseEaux.categorieLibelle,
            commissionTerritorialeCode: masseEaux.commissionTerritorialeCode,
            commissionTerritorialeLibelle:
              masseEaux.commissionTerritorialeLibelle,
            nom: masseEaux.nom
          };
          listMasseEaux.push(masseEau);
        });
      }
      let ouvrageupdate: Ouvrage = null;
      ouvrageupdate = {
        id: ouvrage.id,
        typeOuvrage: typeOuvrage,
        codeAgence: ouvrage.codeAgence,
        libelle: ouvrage.libelle,
        libelleEtat: ouvrage.libelleEtat,
        caracteristiqueOuvrage: listCaracteristique,
        impactOuvrages: listImpact,
        masseEaux: listMasseEaux
      };
      ouvragesUpdated.push(ouvrageupdate);
    });
    operation.ouvrageNatureOperation = ouvragesUpdated;
  }

  // Update Dossier from "enregistrer"t
  updateDossier(dossier: Dossier) {
    this.updateDossierCourant(dossier, "save");
  }

  /**
   * Update Dossier from "enregistrer" after quit
   * @param dossier
   */
  updateDossierCancel(dossier: Dossier) {
    // Update current dossier
    this.updateDossierCourant(dossier, "Cancel");
  }

  infoUpdated(event) {
    this.infoSpecUpdated = event;
  }

  pageInfoSpecHasError(value) {
    this.pageInfoSpecifiteHasError = value;
  }
  /**
   * Update current dossier and all childrens objects
   */
  updateDossierCourant(dossier: Dossier, origin: string) {
    for (
      let index = 0;
      index < dossier.operationDossier.operations.length;
      index++
    ) {
      const ouvragesUpdated: Ouvrage[] = [];
      for (
        let indice = 0;
        indice <
        dossier.operationDossier.operations[index].ouvrageNatureOperation
          .length;
        indice++
      ) {
        let typeOuvrage: TypeOuvrage;
        typeOuvrage = {
          id:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].typeOuvrage.id,
          code:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].typeOuvrage.code,
          codeParam:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].typeOuvrage.codeParam,
          libelleParam:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].typeOuvrage.libelleParam,
          libelle:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].typeOuvrage.libelle,
          texte:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].typeOuvrage.texte
        };

        const listCaracteristique: Caracteristique[] = [];
        if (
          dossier.operationDossier.operations[index].ouvrageNatureOperation[
            indice
          ].caracteristiqueOuvrage
        ) {
          dossier.operationDossier.operations[index].ouvrageNatureOperation[
            indice
          ].caracteristiqueOuvrage.forEach(caracteristique => {
            const caracteristiqueOuvrage = {
              code: caracteristique.code,
              libelle: caracteristique.libelle,
              typeDonnee: caracteristique.typeDonnee,
              valeur: caracteristique.valeur
            };
            listCaracteristique.push(caracteristiqueOuvrage);
          });
        }

        const listImpact: ImpactOuvrages[] = [];

        if (
          dossier.operationDossier.operations[index].ouvrageNatureOperation[
            indice
          ].impactOuvrages
        ) {
          dossier.operationDossier.operations[index].ouvrageNatureOperation[
            indice
          ].impactOuvrages.forEach(impactOuvrage => {
            const parametreDonneSpec: ParametreDonneeSpec = {
              id: impactOuvrage.parametreDonneeSpec.id,
              typeDiscriminant:
                impactOuvrage.parametreDonneeSpec.typeDiscriminant,
              codeDiscriminant:
                impactOuvrage.parametreDonneeSpec.codeDiscriminant,
              codeParam: impactOuvrage.parametreDonneeSpec.codeParam,
              label: impactOuvrage.parametreDonneeSpec.label,
              typeDonnee: impactOuvrage.parametreDonneeSpec.typeDonnee,
              tailleDonnee: impactOuvrage.parametreDonneeSpec.tailleDonnee,
              codeListe: impactOuvrage.parametreDonneeSpec.codeListe,
              noOrdre: impactOuvrage.parametreDonneeSpec.noOrdre
            };

            const impact1 = {
              id: impactOuvrage.id,
              parametreDonneeSpec: parametreDonneSpec,
              valeurDate: impactOuvrage.valeurDate,
              valeurString: impactOuvrage.valeurString,
              valeurInteger: impactOuvrage.valeurInteger,
              valeurDouble: impactOuvrage.valeurDouble,
              valeurListe: impactOuvrage.valeurListe
            };
            listImpact.push(impact1);
          });
        }

        const listMasseEaux: MasseEau[] = [];
        if (
          dossier.operationDossier.operations[index].ouvrageNatureOperation[
            indice
          ].masseEaux
        ) {
          dossier.operationDossier.operations[index].ouvrageNatureOperation[
            indice
          ].masseEaux.forEach(masse => {
            const masseEau = {
              code: masse.code,
              categorieCode: masse.categorieCode,
              categorieLibelle: masse.categorieLibelle,
              commissionTerritorialeCode: masse.commissionTerritorialeCode,
              commissionTerritorialeLibelle:
                masse.commissionTerritorialeLibelle,
              nom: masse.nom
            };
            listMasseEaux.push(masseEau);
          });
        }
        let ouvrageupdate: Ouvrage = null;
        ouvrageupdate = {
          id:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].id,
          typeOuvrage: typeOuvrage,
          codeAgence:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].codeAgence,
          libelle:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].libelle,
          libelleEtat:
            dossier.operationDossier.operations[index].ouvrageNatureOperation[
              indice
            ].libelleEtat,
          caracteristiqueOuvrage: listCaracteristique,
          impactOuvrages: listImpact,
          masseEaux: listMasseEaux
        };
        ouvragesUpdated.push(ouvrageupdate);
      }
      dossier.operationDossier.operations[
        index
      ].ouvrageNatureOperation = ouvragesUpdated;
    }

    dossier.blocNote = this.blocNote ? this.blocNote : null;

    if (this.touchedRemarque) {
      dossier.dossierCorrespondance.remarques = this.listRemarques;
      this.touchedRemarque = false;
    }
    if (
      dossier &&
      dossier.operationDossier &&
      dossier.operationDossier.operations
    ) {
      dossier.operationDossier.operations.forEach((value: Operation) => {
        value.coutsTravaux.forEach(cout => {
          cout.montantEligible = NumberUtils.toNumber(cout.montantEligible);
          cout.montantOperation = NumberUtils.toNumber(cout.montantOperation);
          cout.montantRetenu = NumberUtils.toNumber(cout.montantRetenu);
        });
      });
    }

    this.dossierService.updateDossier(dossier).subscribe(
      updatedDossier => {
        this.spinnerLuncher.hide();
        this.validTableDispositif = true;
        this.validTableDispositifRattachPrev = true;
        // Manage radio-button value reference manually
        //  console.log('Update Dossier......', this.updateDossier);
        if (updatedDossier.domaine) {
          updatedDossier.domaine = this.domaines.find(
            domaine => domaine.id === updatedDossier.domaine.id
          );
        }
        //  console.log('*****Dossier Enregistrer*****', dossier);
        this.dossierService.dossier = updatedDossier;
        // console.log('*****Dossier En retour*****', updatedDossier);
        // update displayed operations and current operation
        this.loadOperationsDossier(updatedDossier);

        this.updateFormData(this.dossierService.dossier);
        // update message when is phase has changed
        if (this.dossierService.dossier.phase !== this.actualPhase) {
          // tslint:disable-next-line:max-line-length
          afficherMessageValide(
            `Le dossier ${
              this.dossierService.dossier.numeroDossier
            } a bien été modifié (Phase : ${
              this.dossierService.dossier.phase
            }).`,
            this._snackbar,
            this.submitted,
            this._changeDetector
          );
          this.submitted = false;
          this.actualPhase = this.dossierService.dossier.phase;
        } else {
          afficherMessageValide(
            `Le dossier ${
              this.dossierService.dossier.numeroDossier
            } a bien été modifié.`,
            this._snackbar,
            this.submitted,
            this._changeDetector
          );
          this.submitted = false;
        }
        this.dossierService.preDossier = Object.assign(
          {},
          updatedDossier.preDossier
        );
        // update table ouvrage
        const data = {
          operations: this.dossierService.dossier.operationDossier.operations
        };
        if (this.dossierService._ouvrageSubject) {
          this.dossierService._ouvrageSubject.next(data);
        }

        // this.dossierService.dossier.blocNote = this.blocNote;
        // Mettre à false le mode édition
        this.regionEditionMode = false;
        this.editionModeImpact = false;
        this.responsableAdmEdit = false;
        this.bvGestionEditionMode = false;
        this.departementEditionMode = false;
        this.communeEditionMode = false;
        this.blocNoteEditionMode = false;
        this.descptionChange = false;

        // Reset the form to pristine
        this.resetFormToPristine();

        // Only if we quit the Dossier page
        if (origin === "Cancel") {
          // In order to not display the dossier number in the title of the page
          // (see baContentTop.component.ts and baContentTop.html)
          // when saving / quitting the dossier update page
          // and when the origin page is "Créer"
          this.dossierService.dossier = null;
        }
      },
      (error: HttpErrorResponse) => {
        this.spinnerLuncher.hide();
        const snackMessage = getErrorMessage(
          error,
          `La modification du dossier a échoué. Contacter l'administrateur.`
        );
        const snackbarRef = this._snackbar.open(
          snackMessage,
          "X",
          snackbarConfigError
        );
        snackbarRef
          .afterDismissed()
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.submitted = false;
            this._changeDetector.detectChanges();
          });
      }
    );
  }

  reactiverDossier() {
    this.submitted = true;
    this.dossierService
      .reactiverDossier(this.dossierService.dossier.id)
      .subscribe(
        dossier => {
          // Done this way to pass through the service setter and trigger the subject
          const dossierReactivated = dossier;
          dossierReactivated.phase = dossier.phase;
          this.dossierService.dossier = dossierReactivated;
          this.loadOperationsDossier(dossier);
          this.updateFormData(dossierReactivated);
          this.dossierService.preDossier = Object.assign(
            {},
            dossier.preDossier
          );
          this.dossierService.dossierFinancier = Object.assign(
            {},
            dossier.dossierFinancier
          );
          if (!this.viewAdministratif) {
            this.formUpdateDossier.enable();
          }
          this.benefLibelleControl.disable();
          if (!this.dateDemandeControl.value) {
            this.dateCompletControl.disable();
          }
          this.phaseControl.disable();
          this.numeroAidControl.disable();
          this.anneeControl.disable();
          this.sessionControl.disable();
          afficherMessageValide(
            `Le dossier ${
              this.dossierService.dossier.numeroDossier
            } a bien été réactivé en phase ${
              this.dossierService.dossier.phase
            }`,
            this._snackbar,
            this.submitted,
            this._changeDetector
          );
          this.submitted = false;
        },
        (error: HttpErrorResponse) => {
          afficherErreur(
            error,
            `La réactivation du dossier a échoué. Contacter l'administrateur.`,
            this._snackbar,
            this._changeDetector
          );
          this.submitted = false;
        }
      );
  }

  /**
   * Switch from preDossier to DOSSIER using generic service (bascValidDevalid)
   */
  basculer() {
    this.spinnerLuncher.show();
    this.submitted = true;
    const messageBascule = `La bascule du Pre-dossier en Dossier a échoué. Contacter l'administrateur.`;
    this.formatAmountBeforeBack();
    // Update dossier
    this.dossierService.updateDossier(this.formatUpdatedDossier()).subscribe(
      updatedDossier => {
        const dossierAction: DossierAction = {
          action: EnumActionDossier.BASCULER,
          ids: [updatedDossier.id]
        };
        // and if Update dossier success => bascule
        this.dossierService.bascValidDevalid(dossierAction).subscribe(
          dossierActionBasculer => {
            // reload dossier
            this.rechargeDossier(dossierActionBasculer.dossier);
            // tslint:disable-next-line:max-line-length
            this.spinnerLuncher.hide();
            afficherMessageValide(
              `Le dossier ${
                this.dossierService.dossier.numeroDossier
              } a bien été basculé en phase ${
                this.dossierService.dossier.phase
              }.`,
              this._snackbar,
              this.submitted,
              this._changeDetector
            );
            this.submitted = false;
          },
          (error: HttpErrorResponse) => {
            this.spinnerLuncher.hide();
            afficherErreur(
              error,
              messageBascule,
              this._snackbar,
              this._changeDetector
            );
            this.submitted = false;
          }
        );
      },
      (errors: HttpErrorResponse) => {
        this.spinnerLuncher.hide();
        afficherErreur(
          errors,
          messageBascule,
          this._snackbar,
          this._changeDetector
        );
        this.submitted = false;
      }
    );
  }
  formatAmountBeforeBack() {
    if (
      this.formatUpdatedDossier() &&
      this.formatUpdatedDossier().operationDossier &&
      this.formatUpdatedDossier().operationDossier.operations
    ) {
      this.formatUpdatedDossier().operationDossier.operations.forEach(
        (value: Operation) => {
          value.coutsTravaux.forEach(couts => {
            couts.montantEligible = NumberUtils.toNumber(couts.montantEligible);
            couts.montantOperation = NumberUtils.toNumber(
              couts.montantOperation
            );
            couts.montantRetenu = NumberUtils.toNumber(couts.montantRetenu);
          });
        }
      );
    }
  }

  /**
   *Dossier validation using generic service (bascValidDevalid)
   */
  valider() {
    this.spinnerLuncher.show();
    this.submitted = true;
    // Update dossier
    const messageValider = `La validation du Dossier a échoué. Contacter l'administrateur.`;
    this.formatAmountBeforeBack();

    this.dossierService.updateDossier(this.formatUpdatedDossier()).subscribe(
      updatedDossier => {
        // and if Update dossier success => bascule
        const dossierAction: DossierAction = {
          action: EnumActionDossier.VALIDER,
          ids: [updatedDossier.id],
          profil: EnumProfilDossier.RT
        };
        this.dossierService
          .bascValidDevalid(dossierAction)
          .subscribe(dossierActionValider => {
            // reload dossier
            this.rechargeDossier(dossierActionValider.dossier);
            this.spinnerLuncher.hide();
            // tslint:disable-next-line:max-line-length
            afficherMessageValide(
              `Le dossier ${
                this.dossierService.dossier.numeroDossier
              } a bien été validé en phase ${
                this.dossierService.dossier.phase
              }.`,
              this._snackbar,
              this.submitted,
              this._changeDetector
            );
            this.submitted = false;
          });
      },
      (error: HttpErrorResponse) => {
        this.spinnerLuncher.hide();
        afficherErreur(
          error,
          messageValider,
          this._snackbar,
          this._changeDetector
        );
        this.submitted = false;
      }
    );
  }
  /**
   *Dossier validation using generic service (bascValidDevalid)
   */
  devalider() {
    this.spinnerLuncher.show();
    this.submitted = true;
    // Update dossier
    const messageDeValider = `La devalidation du Dossier a échoué. Contacter l'administrateur.`;
    if (
      this.formatUpdatedDossier() &&
      this.formatUpdatedDossier().operationDossier &&
      this.formatUpdatedDossier().operationDossier.operations
    ) {
      this.formatUpdatedDossier().operationDossier.operations.forEach(
        (value: Operation) => {
          value.coutsTravaux.forEach(coutsTravaux => {
            coutsTravaux.montantEligible = NumberUtils.toNumber(
              coutsTravaux.montantEligible
            );
            coutsTravaux.montantOperation = NumberUtils.toNumber(
              coutsTravaux.montantOperation
            );
            coutsTravaux.montantRetenu = NumberUtils.toNumber(
              coutsTravaux.montantRetenu
            );
          });
        }
      );
    }
    this.dossierService.updateDossier(this.formatUpdatedDossier()).subscribe(
      updatedDossier => {
        // and if Update dossier success => bascule
        const dossierAction: DossierAction = {
          action: EnumActionDossier.DEVALIDER,
          ids: [updatedDossier.id],
          profil: EnumProfilDossier.RT
        };
        this.dossierService.bascValidDevalid(dossierAction).subscribe(
          dossierActionDevalider => {
            // reload dossier
            this.rechargeDossier(dossierActionDevalider.dossier);
            this.spinnerLuncher.hide();
            // tslint:disable-next-line:max-line-length
            afficherMessageValide(
              `Le dossier ${
                this.dossierService.dossier.numeroDossier
              } a bien été dévalidé en phase ${
                this.dossierService.dossier.phase
              }.`,
              this._snackbar,
              this.submitted,
              this._changeDetector
            );
            this.submitted = false;
          },
          (error: HttpErrorResponse) => {
            this.spinnerLuncher.hide();
            afficherErreur(
              error,
              messageDeValider,
              this._snackbar,
              this._changeDetector
            );
            this.submitted = false;
          }
        );
      },
      (errorHttp: HttpErrorResponse) => {
        this.spinnerLuncher.hide();
        afficherErreur(
          errorHttp,
          messageDeValider,
          this._snackbar,
          this._changeDetector
        );
        this.submitted = false;
      }
    );
  }

  /**
   * Implements the guard canDeactivate() logic to being redirected
   */
  canDeactivate(): Observable<boolean> | boolean {
    // For debugging
    // console.log('### canDeactivate : formUpdate not prestine : ', !this.formUpdateDossier.pristine);
    // if (this.formPrevisionnel) {
    //   console.log('### canDeactivate : formPrevisionnel not prestine : ', !this.formPrevisionnel.pristine);
    // }
    // if (this.formCoutsTravaux) {
    //   console.log('### canDeactivate : formCoutsTravaux not prestine : ', !this.formCoutsTravaux.pristine);
    // }
    // if (this.formMontantsAideManuel) {
    //   console.log('### canDeactivate : formMontantsAideManuel not prestine : ', !this.formMontantsAideManuel.pristine);
    // }
    // if (this.formRecaputilatif) {
    //   console.log('### canDeactivate : formRecaputilatif not prestine : ', !this.formRecaputilatif.pristine);
    // }
    // if (this.formDescription) {
    //   console.log('### canDeactivate : formDescription not prestine : ', !this.formDescription.pristine);
    // }
    // console.log('### canDeactivate : descptionChange : ', this.descptionChange);
    // if (this.formAvisAttribution) {
    //   console.log('### canDeactivate : formAvisAttribution not prestine : ', !this.formAvisAttribution.pristine, ' touched : ', this.formAvisAttribution.touched, ' formAvisAttribution : ', this.formAvisAttribution);
    // }
    // console.log('### canDeactivate : not operationsChanged : ', !this.operationsChanged());
    // console.log('### canDeactivate : changeRecap : ', this.changeRecap);
    // console.log('### canDeactivate : changeCorrespondant : ', this.changeCorrespondant);
    // console.log('### canDeactivate : touchedTablePrev : ', this.touchedTablePrev);
    // console.log('### canDeactivate : touchedTableDpPrev : ', this.touchedTableDpPrev);
    // console.log('### canDeactivate : touchedTableCofin : ', this.touchedTableCofin);
    // console.log('### canDeactivate : not validTableDispositif : ', !this.validTableDispositif);
    // console.log('### canDeactivate : changeTableDispositif : ', this.changeTableDispositif);
    // console.log('### canDeactivate : editionModeImpact : ', this.editionModeImpact);
    // console.log('### canDeactivate : responsableAdministratif: ', this.responsableAdmEdit);
    // console.log('### canDeactivate : touchedRemarque : ', this.touchedRemarque);
    // console.log('### canDeactivate : regionEditionMode : ', this.regionEditionMode);
    // console.log('### canDeactivate : bvGestionEditionMode : ', this.bvGestionEditionMode);
    // console.log('### canDeactivate : departementEditionMode : ', this.departementEditionMode);
    // console.log('### canDeactivate : communeEditionMode : ', this.communeEditionMode);
    // console.log('### canDeactivate : blocNoteEditionMode : ', this.blocNoteEditionMode);
    // console.log('### canDeactivate : infoSpecUpdated : ', this.infoSpecUpdated);

    // End debugging
    // -------------

    if (
      (this.formUpdateDossier && !this.formUpdateDossier.pristine) ||
      (this.formPrevisionnel && !this.formPrevisionnel.pristine) ||
      (this.formCoutsTravaux && !this.formCoutsTravaux.pristine) ||
      (this.formMontantsAideManuel && !this.formMontantsAideManuel.pristine) ||
      (this.formRecaputilatif && !this.formRecaputilatif.pristine) ||
      (this.formDescription && !this.formDescription.pristine) ||
      this.descptionChange ||
      (this.formAvisAttribution && this.formAvisAttribution.touched) ||
      !this.operationsChanged() ||
      this.changeRecap ||
      // TODO attente correction sur branche 3068 ou 2522
      // this.changeCorrespondant ||
      this.touchedTablePrev ||
      this.touchedTableDpPrev ||
      this.touchedTableCofin ||
      !this.validTableDispositif ||
      this.changeTableDispositif ||
      this.editionModeImpact ||
      this.responsableAdmEdit ||
      this.touchedRemarque ||
      this.regionEditionMode ||
      this.bvGestionEditionMode ||
      this.departementEditionMode ||
      this.communeEditionMode ||
      this.blocNoteEditionMode ||
      this.infoSpecUpdated
    ) {
      // console.log('======================Q', this.descptionChange)
      return this.openConfirmDialog()
        .beforeClose()
        .pipe(
          map(dialogResult => {
            if (dialogResult === "save") {
              dialogResult = true;
              this.changeTableDispositif = false;
            }
            return dialogResult as boolean;
          })
        );
    } else {
      if (!this.closeClicked) {
        this.emptyStoredValuesOfCriteresSearch();
      }
    }
    return true;
  }

  limitDecimalTo2(value: any): number {
    const factor = Math.pow(10, 2);
    return Math.round(value * factor) / factor;
  }

  /**
   * Compares the existing Operations with the currently displayed ones to detect manual changes.
   * @see this.canDeactivate()
   */
  operationsChanged() {
    let tempTableDisplayedOperations: Operation[] = [];
    if (
      this.dossierService.dossier &&
      this.dossierService.dossier.operationDossier
    ) {
      const existingOperations: Operation[] = [];
      this.dossierService.dossier.operationDossier.operations.forEach(
        operation => {
          // Charge operation initialse
          operation = this.operationForCanDeactivate(operation);

          existingOperations.push(operation);
        }
      );

      const currentDossierOperations: Operation[] = [];
      tempTableDisplayedOperations = this.displayedOperations;
      tempTableDisplayedOperations.forEach(operation => {
        // Charge operation courante
        operation = this.operationForCanDeactivate(operation);

        // Suppression des erreurs
        this.deleteErrorOperation(operation);

        currentDossierOperations.push(operation);
      });
      // Reformat les montants en Number (suppression des blancs du formattage des milliers)
      this.formatAmountBeforeBack();
      // console.log('existingOperations', JSON.stringify(existingOperations));
      // console.log('currentDossierOperations', JSON.stringify(currentDossierOperations));

      return (
        JSON.stringify(existingOperations) ===
        JSON.stringify(currentDossierOperations)
      );
    } else {
      return true;
    }
  }

  /**
   * Manual blur event on the Input to reset its state.
   */
  blurInput() {
    this.natureOperationInput.nativeElement.blur();
  }
  /**
   *  conversion en entier (suppression des blancs)
   * @param value
   */
  toNumber(value: any) {
    if (typeof value !== "number") {
      return value ? parseInt(value.replace(/ /g, ""), 0) : 0;
    }
    return value;
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
   * Resets the form to pristine
   */
  resetFormToPristine() {
    this.formUpdateDossier.markAsPristine();
    if (this.formPrevisionnel) {
      this.formPrevisionnel.markAsPristine();
    }
    if (this.formCoutsTravaux) {
      this.formCoutsTravaux.markAsPristine();
    }
    if (this.formMontantsAideManuel) {
      this.formMontantsAideManuel.markAsPristine();
    }
    if (this.formRecaputilatif) {
      this.formRecaputilatif.markAsPristine();
    }
    if (this.formDescription) {
      this.formDescription.markAsPristine();
    }
    this.touchedTablePrev = false;
    this.touchedTableDpPrev = false;
    this.touchedTableCofin = false;
  }

  close() {
    this.closeClicked = true;
    if (this.dossierService.previousPage === this.dossierService.currentPage) {
      this._router.navigate([`/accueil`]);
    } else {
      this._router.navigate([`${this.dossierService.previousPage}`]);
    }
  }

  /**
   * Resets the form values and compare the objects
   * to allow deactivation if the original state (values) has been reached
   * @see - NOT USED ATM - Clients do NOT want this functionnality on this component yet
   */
  checkFormStatus() {
    const dossierToCompare = this.dossierService.dossier;
    MethodeGenerique.resetEmptyFormValues(this.formUpdateDossier);

    // TODO : Add operations when it's done
    // TODO : REWORK : Doesn't work with moment JS because of the Timezone
    const initialDossierValues: any = {
      intitule: dossierToCompare.intitule,
      benef_number: dossierToCompare.beneficiaire.reference,
      dateDemande: dossierToCompare.dateDemande,
      operations: null
    };

    if (
      JSON.stringify(this.formUpdateDossier.value) ===
      JSON.stringify(initialDossierValues)
    ) {
      this.formUpdateDossier.markAsPristine();
      this.formUpdateDossier.markAsUntouched();
    }

    if (this.formPrevisionnel) {
      MethodeGenerique.resetEmptyFormValues(this.formPrevisionnel);

      let initialPreDossierValues: any = null;
      if (dossierToCompare.preDossier) {
        initialPreDossierValues = {
          priorite: dossierToCompare.preDossier.niveauPriorite,
          annee: dossierToCompare.preDossier.anneeEngagPrevi,
          session: dossierToCompare.preDossier.sessionDecision,
          dispositifPartenariats:
            dossierToCompare.preDossier.dispositifPartenariats
        };
      }

      if (
        JSON.stringify(this.formPrevisionnel.value) ===
        JSON.stringify(initialPreDossierValues)
      ) {
        this.formPrevisionnel.markAsPristine();
        this.formPrevisionnel.markAsUntouched();
      }
    }
  }

  /**
   * check if the the form ouvrage is valid
   * @param valid
   */
  isFormOuvrageValid(valid) {
    this.validTableOuvrage = valid;
    if (valid) {
      this.displayedOperations.forEach(op => {
        if (op.enableMessageError === true) {
          this.validTableOuvrage = false;
        }
      });
    }
  }

  isEditImpactEvent(valid) {
    this.editionModeImpact = valid;
  }

  onRespAdmEvent(valid) {
    this.responsableAdmEdit = valid;
  }

  onMassesEauChangesEvent(event: boolean) {
    this.masseEauChange = event;
  }

  onMasseEauHasErrorEvent(event: boolean) {
    this.masseEauHasError = event;
    this.currentOperation.masseEauError = event;
    if (!event) {
      this.displayedOperations.forEach(op => {
        if (op.masseEauError === true) {
          this.masseEauHasError = true;
        }
      });
    }
  }

  isFormDispositifValid(valid) {
    this.validTableDispositif = valid;
    this.currentOperation.dispositifRattacheError = !valid;
    if (valid) {
      this.displayedOperations.forEach(op => {
        if (op.dispositifRattacheError === true) {
          this.validTableDispositif = false;
        }
      });
    }
  }

  /**
   * Fonction d'événement d'erreur pour les BV de gestion
   * @param event
   */
  onErreurEventBv(event: boolean) {
    this.bvGestionHasError = event;
    if (!event) {
      this.displayedOperations.forEach(op => {
        if (op.bvGestionError === true) {
          this.bvGestionHasError = true;
        }
      });
    }
  }

  /**
   * Fonction d'événement pour activer le mode édition pour les BV de gestion
   * @param event
   */
  onEventBvEditMode(event: boolean) {
    this.bvGestionEditionMode = event;
  }

  onErreurEventRegion(event: any) {
    if (event) {
      this.regionHasError = event.value;
      if (!event.value) {
        this.displayedOperations.forEach(op => {
          if (op.regionError === true) {
            this.regionHasError = true;
          }
        });
      }
    }
  }

  /**
   * Fonction d'événement pour activer le mode édition pour les régions
   * @param event
   */
  onEventRegionEditMode(event: any) {
    this.regionEditionMode = event;
  }

  /**
   * Fonction d'évenement d'erreur pour les départements/communes
   * @param event
   */
  onErreurEventDepartement(paramEvent: any) {
    if (paramEvent.type === "departement") {
      this.departementHasError = paramEvent.value;
      if (!paramEvent.value) {
        this.displayedOperations.forEach(op => {
          if (op.departementError === true) {
            this.departementHasError = true;
            // console.log('erreur departementHasError', op.departementError)
          }
        });
        // console.log('erreur departelent', this.departementHasError)
      }
    } else {
      this.communeHasError = paramEvent.value;
      if (!paramEvent.value) {
        this.displayedOperations.forEach(op => {
          if (op.communeError === true) {
            this.communeHasError = true;
          }
        });
      }
    }
  }

  /**
   * Fonction d'événement pour activer le mode édition pour les départements/communes
   * @param event
   */
  onEventDepartementEditMode(event: any) {
    event.type === "departement"
      ? (this.departementEditionMode = event.value)
      : (this.communeEditionMode = event.value);
  }

  isFormDispositifChange(change) {
    this.changeTableDispositif = change;
  }

  /**
   * Check if the dossier is in a previsional phase
   **/
  isPhasePrevisionnel() {
    let retour = false;
    if (this.dossierService.dossier != null) {
      if (this.dossierService.dossier.phase.substr(0, 1) === "P") {
        retour = true;
      }
    }
    return retour;
  }

  updateSelectCurrentOperation(
    operations: Operation[],
    currentOperation: Operation
  ): void {
    operations.forEach(operation => {
      if (
        currentOperation.natureOperation.id === operation.natureOperation.id &&
        currentOperation.noOrdre === operation.noOrdre
      ) {
        this.currentOperation = operation;
      }
    });
  }

  isInKnownPhase() {
    let presence = false;
    this.knownPhases.forEach(knowPhase => {
      if (this.dossierService.dossier != null) {
        if (knowPhase === this.dossierService.dossier.phase) {
          presence = true;
        }
      }
    });
    return presence;
  }

  /*
   * Recharge du dossier appele apres des appels aux API
   * @param dossier
   **/
  rechargeDossier(dossier: Dossier) {
    this.dossierService.dossier = dossier;
    this.updateFormData(dossier);
    this.loadOperationsDossier(dossier);
    this.dossierService.preDossier = Object.assign({}, dossier.preDossier);
    this.dossierService.dossierFinancier = Object.assign(
      {},
      dossier.dossierFinancier
    );
    this.resetFormToPristine();
    this.actualPhase = this.dossierService.dossier.phase;
  }

  // empty all stored form critere of recherche, of delegue
  emptyStoredValuesOfCriteresSearch() {
    this.dossierService.formCritere = null;
    this.dossierService.formValidationCritere = null;
    this.dossierService.formValidationCritereRlSga = null;
    this.dossierService.formCommisonAffectation = null;
    this.dossierService.formResultatRecherche = null;
    this.dossierService.formSignerVerifier = null;
    this.dossierService.formPrevGestion = null;
    this.dossierService.idsCheckedDossier = [];
    this.dossierService.checkAll = null;
  }

  /**
   * Met à jour la valeur de localisation pertinente d'une nature d'opération
   * @param event
   */
  onChangeLocalisationPertinente(event: any) {
    if (event) {
      this.currentOperation.localisationPertinente = event.checked;
      this.dossierService._localisationPertinente.next(event.checked);
      if (event.checked) {
        if (
          this.currentOperation.departements.length === 0 &&
          this.currentOperation.regions.length === 0 &&
          this.currentOperation.communes.length === 0 &&
          this.currentOperation.lignesMasseEau.length === 0 &&
          this.currentOperation.bvGestionNatureOperations.length === 0
        ) {
          this.currentOperation.localisationPertinenteError = true;
        } else {
          this.currentOperation.localisationPertinenteError = false;
        }
      } else {
        this.currentOperation.localisationPertinenteError = false;
      }
    }
  }

  /**
   * Mis à jours du descriptif technique lors de la création
   * @param data descriptif technique crée
   */
  descriptifTechniqueChanges(data: DescriptifTechnique) {
    if (this.dossierService.dossier) {
      this.dossierService.dossier.descriptifTechnique = data;
    }
  }

  /**
   * stringify operation ouvrage nature operation
   */
  operationForCanDeactivate(operation): Operation {
    const ouvragesUpdated: Ouvrage[] = [];
    operation.montantAvanceEqSubvention = Math.ceil(
      operation.montantAvanceEqSubvention
    );
    operation.montantAvance = Math.ceil(operation.montantAvance);
    operation.montantSubvention = Math.ceil(operation.montantSubvention);
    operation.montantEqSubventionSpecifique = Math.ceil(
      operation.montantEqSubventionSpecifique
    );
    if (operation.specificiteCalcul === "") {
      operation.specificiteCalcul = null;
    }

    operation.coutsTravaux = operation.coutsTravaux.filter(cout => {
      if (cout.libelleCout !== "") {
        return cout;
      }
    });

    operation = this.ouvrageOperationForCanDeactivate(operation);

    if (operation.totalMontantRetenuPlafonne === 0) {
      operation.totalMontantRetenuPlafonne = null;
    }

    return operation;
  }

  /**
   * stringify operation ouvrage nature operation
   */
  deleteErrorOperation(operation): void {
    if (operation.dispositifRattacheError === false) {
      delete operation.dispositifRattacheError;
    }

    if (operation.montantCoutError === false) {
      delete operation.montantCoutError;
    }

    if (operation.messageErrorDispositif === "") {
      delete operation.messageErrorDispositif;
    }

    if (operation.ouvrageError === false) {
      delete operation.ouvrageError;
    }

    if (operation.erreurMontant === false) {
      delete operation.erreurMontant;
    }
    if (!operation.bvGestionError) {
      delete operation.bvGestionError;
    }

    if (!operation.inputErreur) {
      delete operation.inputErreur;
    }

    if (!operation.departementError) {
      delete operation.departementError;
    }

    if (!operation.inputDepartementErreur) {
      delete operation.inputDepartementErreur;
    }

    if (!operation.communeError) {
      delete operation.communeError;
    }

    if (!operation.inputCommuneErreur) {
      delete operation.inputCommuneErreur;
    }

    if (!operation.specificiteCalcul) {
      operation.specificiteCalcul = null;
    }

    if (!operation.enableMessageError) {
      delete operation.enableMessageError;
    }

    if (!operation.regionError) {
      delete operation.regionError;
    }

    if (!operation.inputRegionErreur) {
      delete operation.inputRegionErreur;
    }
  }
  /**
   * stringify operation ouvrage nature operation
   */
  ouvrageOperationForCanDeactivate(operation): Operation {
    this.updateOuvrageOperation(operation);
    return operation;
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    if (this.snackbarSubscription) {
      this.snackbarSubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
  ngOnchange() {
    let hasError = false;
    this.displayedOperations.forEach(operation => {
      if (
        operation.localisationPertinenteError &&
        operation.localisationPertinente
      ) {
        this.localisationPertinentehasError = true;
      }
    });
  }
}
