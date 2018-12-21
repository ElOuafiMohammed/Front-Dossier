import { Input, OnDestroy } from '@angular/core';
import {
  Beneficiaire,
  Ligne,
  Phase,
  ResponsableTechnique,
  Thematique,
} from 'app/pages/dossiers/create-dossier/create-dossier.interface';
import {
  Domaine,
  DossierAction,
  NiveauPriorite,
  ProcedureDecision,
  SessionDecision,
} from 'app/pages/dossiers/dossier/dossier.interface';
import { Departements, Dossier, ListValeur } from 'app/pages/dossiers/dossiers.interface';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import { Observable } from 'rxjs';

export class GenericVariables implements OnDestroy {

  /**
   * List of possible Thematiques
   */
  thematiques: Thematique[] = null;
  filteredThematiques: Observable<Thematique[]>;
  readonly thematiqueValidatorKey = 'thematiqueNotFound';

  /**
   * List of possible departments
   */
  depts: Departements[] = null;
  filteredDepts: Observable<Departements[]>;
  readonly deptValidatorKey = 'deptNotFound';

  /**
   * List of phases
   */
  phases: Phase[] = [];
  filteredPhases: Observable<Phase[]>;
  readonly phaseValidatorKey = 'phaseNotFound';

  /**
  * List of responsables techniques
  */
  responsablesTech: ResponsableTechnique[];
  filteredResponsablesTech: Observable<ResponsableTechnique[]>;
  readonly respTechValidatorKey = 'responsableTechNotFound';

  sessions: SessionDecision[] = [];
  filteredSessions: Observable<SessionDecision[]>;
  readonly sessionValidatorKey = 'sessionNotFound';

  dates: Date[] = [];
  filteredDates: Observable<Date[]>;
  readonly dateValidatorKey = 'dateNotFound';

  priorites: NiveauPriorite[] = null;
  filteredProcedures: Observable<ProcedureDecision[]>;
  readonly procedureValidatorKey = 'procedureDecisionNotFound';
  procedureDecisions: ProcedureDecision[] = [];

  delegations: Delegation[];
  filteredDelegations: Observable<Delegation[]>;
  readonly delegationsValidatorKey = 'delegationNotFound';

  domaines: Domaine[] = [];
  filteredDomaines: Observable<Domaine[]>;
  readonly domaineValidatorKey = 'domaineNotFound';

  lignes: ListValeur[] = null;
  filteredLignes: Observable<ListValeur[]>;
  readonly ligneValidatorKey = 'ligneNotFound';


  /**
   * The beneficaire object to retrieve
   */
  beneficiaire: Beneficiaire = null;

  /**
   * Used to avoid multi-click from the user
   */
  submitted = false;

  /**
   * Displays the table once a result is available
   */
  searchDone = false;
  dossiersDatas: Dossier[] = [];
  dossierAction: DossierAction;


  /**
  * Configuration actuelle
  */
  currentCriteres: Critere;
  listBenefInactif = [];
  benefInactif: boolean;

  ngOnDestroy() {
  }
}

export class GenericVariablesSearch implements OnDestroy {
  dossierAction: DossierAction;
  /**
   * List of possible Thematiques
   */
  @Input() thematiques: Thematique[] = null;
  filteredThematiques: Observable<Thematique[]>;
  readonly thematiqueValidatorKey = 'thematiqueNotFound';

  /**
   * List of possible departments
   */
  @Input() depts: Departements[] = null;
  filteredDepts: Observable<Departements[]>;
  readonly deptValidatorKey = 'deptNotFound';

  /**
  * List of responsables techniques
  */
  @Input() responsablesTech: ResponsableTechnique[] = null;
  filteredResponsablesTech: Observable<ResponsableTechnique[]>;
  readonly respTechValidatorKey = 'responsableTechNotFound';

  /**
   * List of phases
   */
  @Input() phases: Phase[] = null;
  filteredPhases: Observable<Phase[]>;
  readonly phaseValidatorKey = 'phaseNotFound';

  @Input() priorites: NiveauPriorite[] = [];
  filteredPriorites: Observable<NiveauPriorite[]>;
  readonly prioriteValidatorKey = 'prioriteNotFound';

  @Input() sessions: SessionDecision[] = null;
  filteredSessions: Observable<SessionDecision[]>;
  readonly sessionValidatorKey = 'sessionNotFound';

  @Input() delegations: Delegation[] = null;
  filteredDelegations: Observable<Delegation[]>;
  readonly delegationsValidatorKey = 'delegationNotFound';

  @Input() domaines: Domaine[] = null;
  filteredDomaines: Observable<Domaine[]>;
  readonly domaineValidatorKey = 'domaineNotFound';

  @Input() procedureDecisions: ProcedureDecision[] = null;
  filteredProcedures: Observable<ProcedureDecision[]>;
  readonly procedureValidatorKey = 'procedureDecisionNotFound';


  @Input() dates: Date[] = [];
  filteredDates: Observable<Date[]>;
  readonly dateValidatorKey = 'dateNotFound';

  @Input() lignes: Ligne[] = null;
  filteredLignes: Observable<Ligne[]>;
  readonly ligneValidatorKey = 'ligneNotFound';

  @Input() valide = null;
  readonly valideValidatorKey = 'validNotFound';

  /**
   * The beneficaire object to retrieve
   */
  beneficiaire: Beneficiaire = null;

  /**
   * Used to avoid multi-click from the user
   */
  @Input() submitted = false;

  /**
   * List of values that could been taken by number elements
   */
  pageSizeOption = [15, 30, 50];

  ngOnDestroy() {
  }
}
