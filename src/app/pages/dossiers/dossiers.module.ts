import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TableauRecapDesNumerosComponent,
} from 'app/pages/dossiers/dossier/bloc-administratif/avis-attribution/tableau-recap-des-numeros/tableau-recap-des-numeros.component';
import { BlocNoteComponent } from 'app/pages/dossiers/dossier/bloc-note/bloc-note.component';
import {
  ComplementDPComponent,
} from 'app/pages/dossiers/dossier/nature-operation/dispositifs-rattaches/complementDP/complementDP.component';
import {
  UrlFrontDPComponent,
} from 'app/pages/dossiers/dossier/nature-operation/dispositifs-rattaches/urlFrontDP/urlFrontDP.component';
import {
  MontantsAideManuelComponent,
} from 'app/pages/dossiers/dossier/nature-operation/montants-aide-manuel/montants-aide-manuel.component';
import {
  ImpactsOuvrageComponent,
} from 'app/pages/dossiers/dossier/nature-operation/ouvrage/impacts-ouvrage/impacts-ouvrage.component';
import {
  ValeurImpactComponent,
} from 'app/pages/dossiers/dossier/nature-operation/ouvrage/impacts-ouvrage/valeur-impact/valeur-impact.component';
import {
  TableauMontantAideTotalComponent,
} from 'app/pages/dossiers/dossier/recap-aides/tableau-montant-aide-total/tableau-montant-aide-total.component';
import { CheckboxCellComponent } from 'app/pages/dossiers/validate-dossier/checkboxCell/checkboxCell.component';
import { CardComponent } from 'app/shared/card-siga/card-siga.component';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { DeletePopupComponent } from 'app/shared/delete-popup/delete-popup.component';
import { SearchPopupInterlocuteurComponent } from 'app/shared/search-popup/search-popup-interlocuteur.component';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import { NgaModule } from 'app/theme/nga.module';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { CKEditorModule } from 'ng2-ckeditor';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { AutofocusDirective } from '../../shared/directives/autoFocusDirective.directive';
import { SpinnerLuncher } from '../../shared/methodes-generiques';
import { AccueilComponent } from './accueil/accueil.component';
import { AccueilService } from './accueil/accueil.service';
import { AvisAttributionComponent } from './dossier/bloc-administratif/avis-attribution/avis-attribution.component';
import { CourrierPopupComponent } from './dossier/courriers/courrier-popup/courrier-popup.component';
import { CourriersComponent } from './dossier/courriers/courriers.component';
import { DescriptionGeneraleComponent } from './dossier/description-generale/description-generale.component';
import { DossierComponent } from './dossier/dossier.component';
import { InfosSpecAgriComponent } from './dossier/infos-specifiques/infos-spec-agri/infos-spec-agri.component';
import { InfosSpecifiquesComponent } from './dossier/infos-specifiques/infos-specifiques.component';
import { ValeurInfoSpecComponent } from './dossier/infos-specifiques/valeur-info-spec/valeur-info-spec.component';
import { ContactsComponent } from './dossier/interlocuteurs/contacts/contacts.component';
import { InterlocuteursComponent } from './dossier/interlocuteurs/interlocuteurs.component';
import {
  InputReferenceInterlocuteurComponent,
} from './dossier/interlocuteurs/reference-interlocuteur/input-reference-interlocuteur/input-reference-interlocuteur.component';
import {
  RoleInterlocuteurSelectComponent,
} from './dossier/interlocuteurs/roleInterlocuteur/role-interlocuteur-select.component';
import {
  ActionsCellDPComponent,
} from './dossier/nature-operation/dispositifs-rattaches/actionsCellDP/actionsCellDP.component';
import {
  DispositifsRattachesComponent,
} from './dossier/nature-operation/dispositifs-rattaches/dispositifs-rattaches.component';
import {
  MontantAvanceDPComponent,
} from './dossier/nature-operation/dispositifs-rattaches/montantAvanceDP/montantAvanceDP.component';
import { MontantSubDPComponent } from './dossier/nature-operation/dispositifs-rattaches/montantSubDP/montantSubDP.component';
import { NumeroDPComponent } from './dossier/nature-operation/dispositifs-rattaches/numeroDP/numeroDP.component';
import {
  PourcentAvanceDPComponent,
} from './dossier/nature-operation/dispositifs-rattaches/pourcentAvanceDP/pourcentAvanceDP.component';
import {
  PourcentSubventionDPComponent,
} from './dossier/nature-operation/dispositifs-rattaches/pourcentSubventionDP/pourcentSubventionDP.component';
import { TypeDPComponent } from './dossier/nature-operation/dispositifs-rattaches/typeDP/typeDP.component';
import { BvGestionComponent } from './dossier/nature-operation/localisation/bv-gestion/bv-gestion.component';
import { CommunesComponent } from './dossier/nature-operation/localisation/departements/communes/communes.component';
import { DepartementsComponent } from './dossier/nature-operation/localisation/departements/departements.component';
import {
  LocalisationCardComponent,
} from './dossier/nature-operation/localisation/localisation-card/localisation-card.component';
import {
  ActionsTableauMasseEauComponent,
} from './dossier/nature-operation/localisation/masse-eau/actions-tableau/actions-tableau.component';
import {
  CodeMasseEauCellComponent,
} from './dossier/nature-operation/localisation/masse-eau/code-masse-eau-cell/code-masse-eau.component-cell';
import { TableauMasseEauComponent } from './dossier/nature-operation/localisation/masse-eau/masse-eau.component';
import { RegionsComponent } from './dossier/nature-operation/localisation/regions/regions.component';
import { MultipleCardThemeComponent } from './dossier/nature-operation/multiple-card-theme/multiple-card-theme.component';
import {
  CheckboxOuvrageCellComponent,
} from './dossier/nature-operation/ouvrage/search-popup-ouvrage/checkboxOuvrageCell/checkboxOuvrageCell.component';
import {
  SearchPopupOuvrageComponent,
} from './dossier/nature-operation/ouvrage/search-popup-ouvrage/search-popup-ouvrage.component';
import {
  CaracteristiqueOuvrageComponent,
} from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/caracteristique-ouvrage/caracteristique-ouvrage.component';
import {
  CaracteristiqueComponent,
} from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/caracteristique-ouvrage/caracteristique/caracteristique.component';
import {
  ValeurComponent,
} from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/caracteristique-ouvrage/valeur/valeur.component';
import {
  InputNumeroOuvrageComponent,
} from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/inputNumero/inputNumeroOuvrage.component';
import {
  SelectTypeComponent,
} from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/select-type-ouvrage/select-type.component';
import {
  TableauDynamiqueOuvrageComponent,
} from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.component';
import {
  MontantRetenuCellComponent,
} from './dossier/nature-operation/tableau-montants-couts-mat-table/montant-retenu-cell/montant-retenu-cell.component';
import {
  TableauMontantsCoutsMatTableComponent,
} from './dossier/nature-operation/tableau-montants-couts-mat-table/tableau-montants-couts-mat-table.component';
import { PiecesJointesComponent } from './dossier/pieces-jointes/pieces-jointes.component';
import {
  TableauPiecesJointesComponent,
} from './dossier/pieces-jointes/tableau-pieces-jointes/tableau-pieces-jointes.component';
import { RecapCoFinancementComponent } from './dossier/plan-financement/recap-co-financement/recap-co-financement.component';
import {
  ActionsCellCofinComponent,
} from './dossier/plan-financement/tableau-dynam-cofinancements/actionsCellCofin/actionsCellCofin.component';
import {
  InputCellCofinAideComponent,
} from './dossier/plan-financement/tableau-dynam-cofinancements/inputCellCofin-aide/inputCellCofinAide.component';
import {
  InputCellTauxComponent,
} from './dossier/plan-financement/tableau-dynam-cofinancements/inputTaux/inputCellTaux.component';
import { PrecisionComponent } from './dossier/plan-financement/tableau-dynam-cofinancements/precision/precision.component';
import {
  SelectInputCofinanceurComponent,
} from './dossier/plan-financement/tableau-dynam-cofinancements/select-input-cofinanceur/select-input-cofinanceur.component';
import {
  TableauDynamCofinancementsComponent,
} from './dossier/plan-financement/tableau-dynam-cofinancements/tableau-dynam-cofinancements.component';
import {
  DispositifsRattachesPrevComponent,
} from './dossier/previsionnel/dispositifs-rattaches-prev/dispositifs-rattaches-prev.component';
import { PrevisionnelComponent } from './dossier/previsionnel/previsionnel.component';
import { ActionsCellComponent } from './dossier/previsionnel/tableau-dynam-prev/actionsCell/actionsCell.component';
import { InputCellAideComponent } from './dossier/previsionnel/tableau-dynam-prev/inputCell-aide/inputCellAide.component';
import { InputCellComponent } from './dossier/previsionnel/tableau-dynam-prev/inputCell/inputCell.component';
import {
  SelectInputLibelleComponent,
} from './dossier/previsionnel/tableau-dynam-prev/select-input-libelle/select-input-libelle.component';
import { TableauDynamPrevComponent } from './dossier/previsionnel/tableau-dynam-prev/tableau-dynam-prev.component';
import { RecapAidesComponent } from './dossier/recap-aides/recap-aides.component';
import { ListRemarquesComponent } from './dossier/remarque/list-remarques/list-remarques.component';
import { RemarqueComponent } from './dossier/remarque/remarque.component';
import { ReponseComponent } from './dossier/remarque/reponse/reponse.component';
import { routing } from './dossiers.routing';
import { DossierService } from './dossiers.service';
import { RefuseDossierPopupComponent } from './refuse-dossier-popup/refuse-dossier-popup.component';
import { BenefciaireValidateComponent } from './validate-dossier/benefciaire/benefciaire.component';

// tslint:disable-next-line:max-line-length

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    Ng2SmartTableModule,
    routing,
    CKEditorModule,
    MatBadgeModule,
    NgbModule.forRoot()
  ],
  declarations: [
    AccueilComponent,
    BlocNoteComponent,
    DossierComponent,
    TableauMontantsCoutsMatTableComponent,
    ImpactsOuvrageComponent,
    RefuseDossierPopupComponent,
    PourcentSubventionDPComponent,
    ConfirmPopupComponent,
    SearchPopupInterlocuteurComponent,
    TypeDPComponent,
    PourcentAvanceDPComponent,
    DeletePopupComponent,
    PrevisionnelComponent,
    MontantSubDPComponent,
    TableauDynamPrevComponent,
    TableauDynamCofinancementsComponent,
    SelectInputCofinanceurComponent,
    PrecisionComponent,
    ActionsCellComponent,
    ActionsCellCofinComponent,
    MontantAvanceDPComponent,
    ActionsCellDPComponent,
    ActionsCellComponent,
    NumeroDPComponent,
    InputCellComponent,
    ComplementDPComponent,
    InputCellTauxComponent,
    AutofocusDirective,
    InputCellAideComponent,
    InputCellCofinAideComponent,
    SelectInputLibelleComponent,
    MontantRetenuCellComponent,
    MontantsAideManuelComponent,
    CardComponent,
    MultipleCardThemeComponent,
    RecapAidesComponent,
    TableauMasseEauComponent,
    CodeMasseEauCellComponent,
    ActionsTableauMasseEauComponent,
    DispositifsRattachesComponent,
    DescriptionGeneraleComponent,
    TableauMontantAideTotalComponent,
    TableauRecapDesNumerosComponent,
    DispositifsRattachesPrevComponent,
    RecapCoFinancementComponent,
    CheckboxCellComponent,
    SelectionLibelleComponent,
    RemarqueComponent,
    ListRemarquesComponent,
    DepartementsComponent,
    CommunesComponent,
    LocalisationCardComponent,
    ReponseComponent,
    PiecesJointesComponent,
    TableauPiecesJointesComponent,
    BvGestionComponent,
    TableauDynamiqueOuvrageComponent,
    CaracteristiqueOuvrageComponent,
    CaracteristiqueComponent,
    UrlFrontDPComponent,
    ValeurComponent,
    AvisAttributionComponent,
    SearchPopupOuvrageComponent,
    CourriersComponent,
    ValeurImpactComponent,
    CourrierPopupComponent,
    InfosSpecifiquesComponent,
    BenefciaireValidateComponent,
    RegionsComponent,
    CheckboxOuvrageCellComponent,
    InputNumeroOuvrageComponent,
    SelectTypeComponent,
    InfosSpecAgriComponent,
    ValeurInfoSpecComponent,
    CheckboxOuvrageCellComponent,
    InterlocuteursComponent,
    InputReferenceInterlocuteurComponent,
    RoleInterlocuteurSelectComponent,
    ContactsComponent
  ],
  entryComponents: [
    RefuseDossierPopupComponent,
    ConfirmPopupComponent,
    ValeurImpactComponent,
    BlocNoteComponent,
    UrlFrontDPComponent,
    SearchPopupInterlocuteurComponent,
    TableauMontantsCoutsMatTableComponent,
    DeletePopupComponent,
    ImpactsOuvrageComponent,
    InputCellComponent,
    ComplementDPComponent,
    InputCellTauxComponent,
    MontantSubDPComponent,
    InputCellCofinAideComponent,
    PrecisionComponent,
    PourcentAvanceDPComponent,
    SelectInputCofinanceurComponent,
    TypeDPComponent,
    InputCellAideComponent,
    PourcentSubventionDPComponent,
    SelectInputLibelleComponent,
    ActionsCellDPComponent,
    NumeroDPComponent,
    MontantAvanceDPComponent,
    ActionsCellComponent,
    ActionsCellCofinComponent,
    InputCellComponent,
    InputCellAideComponent,
    MontantRetenuCellComponent,
    CodeMasseEauCellComponent,
    ActionsTableauMasseEauComponent,
    CheckboxCellComponent,
    SelectionLibelleComponent,
    RemarqueComponent,
    ReponseComponent,
    ValeurComponent,
    CaracteristiqueComponent,
    SearchPopupOuvrageComponent,
    CourrierPopupComponent,
    BenefciaireValidateComponent,
    CheckboxOuvrageCellComponent,
    InputNumeroOuvrageComponent,
    SelectTypeComponent,
    ValeurInfoSpecComponent,
    CheckboxOuvrageCellComponent
  ],
  providers: [DossierService, AccueilService, FormatMonetairePipe, DatePipe, SpinnerLuncher]
})
export class DossiersModule { }
