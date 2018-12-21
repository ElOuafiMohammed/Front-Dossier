import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SearchPopupInterlocuteurComponent } from '../../../../../shared/search-popup/search-popup-interlocuteur.component';
import { getErrorMessage, snackbarConfigLongError, snackbarConfigSuccess } from '../../../../../shared/shared.retourApi';
import { Beneficiaire, ResponsableTechnique } from '../../../create-dossier/create-dossier.interface';
import { Address, BenefRegex, Commune, FrenchDateRegex, NumberRegex } from '../../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { Courrier, CourrierFields, ModeleGCD } from '../courrier.interface';


@Component({
  templateUrl: './courrier-popup.component.html',
  styleUrls: ['./courrier-popup.component.scss']
})
export class CourrierPopupComponent extends ComponentViewRightMode implements OnInit, OnChanges, OnDestroy {

  /**
   * Message d'erreur à afficher
   */
  message: string;

  /**
   * Numéro du dossier
   */
  numDossier: string;

  /**
   * Objet representant tout les champs à remplir pour générer un courrier GCD
   */
  formCourrier: FormGroup;
  courrier: CourrierFields = {
    id: null,
    modele: null,
    destinataire: null,
    dateCreation: null,
    avisDeReception: false,
    piecesJointes: '',
    vosReferences1: null,
    vosReferences2: null,
    referenceGCA: null,
    numDossier: null,
    nosReferences: null,
    contact: null,
    copieInformation: '',
    objet: null,
    signataire: null
  };

  /**
   * Objet courrier retourné par GCD
   */
  courrierGcd: Courrier;

  /**
   * Sujet pour se desouscrire
   */
  private unsubscribe = new Subject<void>();

  /**
   * Date aujourd'hui
   */
  todayDate = new Date();

  // -------- CHAMPS A REMPLIR POUR GENERER LE COURRIER GCD --------

  /**
   * Modèle WORD du courrier présent dans GCD
   * Liste déroulante de modèles
   */
  modeles: ModeleGCD[];
  filteredModeles: Observable<ModeleGCD[]>
  get modeleControl() { return this.formCourrier.get('modele'); }
  readonly modeleValidatorKey = 'modeleNotFound';

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * Date de création
   */
  dateCreation: Date
  get dateCreationControl() { return this.formCourrier.get('dateCreation') }

  /**
   * INFORMATIONS DU DESTINATAIRE
   */

  // Objet destinataire et ses sous-objets
  destinataire: Beneficiaire;
  destinataireAdresseComplete: Address;
  destinataireCommuneComplete: Commune;
  // Référence du destinataire
  destinataireReference: string;
  get destinataireReferenceControl() { return this.formCourrier.get('destinataireReference'); }
  // Titre associé au destinataire
  destinataireTitre: string;
  get destinataireTitreControl() { return this.formCourrier.get('destinataireTitre'); }
  // Premier champ de raison sociale associé au destinataire
  destinataireRaisonSociale: string;
  get destinataireRaisonSocialeControl() { return this.formCourrier.get('destinataireRaisonSociale'); }
  // Second champ de raison sociale associé au destinataire
  destinataireRaisonSociale2: string;
  get destinataireRaisonSociale2Control() { return this.formCourrier.get('destinataireRaisonSociale2'); }
  // Premier champ d'adresse associée à l'objet adresse du destinataire
  destinataireAdresse: string;
  get destinataireAdresseControl() { return this.formCourrier.get('destinataireAdresse'); }
  // Second champ d'adresse associée à l'objet adresse du destinataire
  destinataireAdresse2: string;
  get destinataireAdresse2Control() { return this.formCourrier.get('destinataireAdresse2'); }
  // Code postal associé à l'objet adresse du destinataire
  destinataireCodePostal: string;
  get destinataireCodePostalControl() { return this.formCourrier.get('destinataireCodePostal'); }
  // Commune associée à l'objet adresse du destinataire
  destinataireCommune: string;
  get destinataireCommuneControl() { return this.formCourrier.get('destinataireCommune'); }

  /**
   * Pièce Jointes
   * Champ de texte
   */
  piecesJointes: string;
  get piecesJointesControl() { return this.formCourrier.get('piecesJointes'); }

  /**
   * REFERENCES COTE DESTINATAIRE
   */
  // Premier champ des références du destinataire
  vosReferences: string;
  get vosReferencesControl() { return this.formCourrier.get('vosReferences'); }
  // Second champ des références du destinataire
  vosReferences2: string;
  get vosReferences2Control() { return this.formCourrier.get('vosReferences2'); }

  /**
   * Références côté AEAG
   */
  nosReferences: string;
  get nosReferencesControl() { return this.formCourrier.get('nosReferences'); }

  /**
   * Responsable technique à contacter
   * Liste déroulante (utilisateurs)
   */
  contacts: ResponsableTechnique[];
  contact: ResponsableTechnique;
  filteredContacts: Observable<ResponsableTechnique[]>;
  readonly contactValidatorKey = 'contactNotFound';
  get contactControl() { return this.formCourrier.get('contact'); }

  /**
   * Copie pour information à :
   * Champ de texte
   */
  copieInformation: string;
  get copieInformationControl() { return this.formCourrier.get('copieInformation'); }

  /**
   * Objet du courrier
   */
  objet: string;
  get objetControl() { return this.formCourrier.get('objet'); }

  /**
   * Signataire du courrier
   * Liste déroulante (utilisateurs)
   */
  signataires: ResponsableTechnique[];
  signataire: ResponsableTechnique;
  filteredSignataires: Observable<ResponsableTechnique[]>;
  readonly signataireValidatorKey = 'signataireNotFound';
  get signataireControl() { return this.formCourrier.get('signataire'); }


  /**
   * Constructeur
   * @param dialog Permet d'ouvrir la popup de recherche d'interlocuteur
   * @param dialogRef Permet à la popup de se réferer à lui même
   * @param snackbar Permet d'afficher la snackbar
   * @param _formBuilder Permet de construire le formulaire
   * @param dossierService Permet de gerer le dossier
   * @param translate Gere la traducion
   * @param datePipe Gere l'affichage des dates
   */
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CourrierPopupComponent>,
    private snackbar: MatSnackBar,
    private _formBuilder: FormBuilder,
    public dossierService: DossierService,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super(dossierService);


  }

  ngOnInit() {
    // INITIALISE CERTAINES VALEURS PAR DEFAUT
    //   Vos références
    let dateDemande = '';
    if (this.dossierService.dossier.dateDemande) {
      dateDemande = this.datePipe.transform(this.dossierService.dossier.dateDemande, 'dd/MM/yyyy');
    }
    this.vosReferences = 'Votre demande reçue le ' + dateDemande;
    //   Numero de dossier
    this.numDossier = this.dossierService.dossier.numeroDossier;
    //   Objet
    this.objet = this.dossierService.dossier.intitule;


    // RECUPERE LES DONNEES DU DOSSIER
    //  Destinataire
    this.destinataire = this.dossierService.dossier.beneficiaire;
    this.courrier.destinataire = this.destinataire
    //    Destinataire : Référence
    this.destinataireReference = this.destinataire.reference;
    //    Destinataire : Adress (objet)
    this.destinataireAdresseComplete = this.destinataire.address;
    //        destinataire : Adress (objet) - Titre
    this.destinataireTitre = this.destinataire.address.titreCivilite;
    //        Destinataire : Adress (objet) - Raison sociale
    this.destinataireRaisonSociale = this.destinataire.raisonSociale1;
    //        Destinataire : Adress (objet) - Raison sociale 2
    this.destinataireRaisonSociale2 = this.destinataire.raisonSociale2;
    //        Destinataire : Adress (objet) - Adresse
    this.destinataireAdresse = this.destinataire.address.adresse3;
    //        Destinataire : Adress (objet) - Adresse 2
    this.destinataireAdresse2 = this.destinataire.address.adresse4;
    //        Destinataire : Adress (objet) - Code postal
    this.destinataireCodePostal = this.destinataire.address.codePostal;
    //        Destinataire : Adress (objet) - Commune
    this.destinataireCommune = this.destinataire.address.acheminement;
    //    Destinataire : Commune (objet)
    this.destinataireCommuneComplete = this.destinataire.commune;

    //   Contact
    //      Responsable technique actuel
    this.contact = this.dossierService.dossier.responsableTechnique;
    this.courrier.contact = this.contact;


    // RECUPERE LES DONNEES DU BACK
    //   Liste de tout les modeles GCD
    this.dossierService.getModeles()
      .subscribe(modeles => {
        this.modeles = modeles;
        // Set synchronous validator once the data is available
        this.filteredModeles = GeneriqueListValeur.filtringList(this.modeles, this.modeleControl, this.modeleValidatorKey, minSearchLength, 'modele');
      },
        (error: HttpErrorResponse) => {
          this.dialogRef.close(false);
          const snackMessage = getErrorMessage(error, `La création de courrier est indisponible. Contacter l'administrateur.`);
          this.snackbar.open(snackMessage, 'X', snackbarConfigLongError);
        });

    //  Liste de tout les utilisateurs/contacts/signataires
    this.dossierService.getResponsableTech()
      .subscribe(responsablestech => {
        this.contacts = responsablestech;
        this.signataires = responsablestech

        if (this.formCourrier && this.contacts) {
          // Autocomplete de Contact
          this.filteredContacts = GeneriqueListValeur.filtringList(this.contacts, this.contactControl, this.contactValidatorKey, minSearchLength, 'contact');
        }

        if (this.formCourrier && this.signataires) {
          // Autocomplete de Signataire
          this.filteredSignataires = GeneriqueListValeur.filtringList(this.signataires, this.signataireControl, this.signataireValidatorKey, minSearchLength, 'contact');
        }
      }
      );

    // Initialise le formulaire
    this.formCourrier = this._formBuilder.group({
      modele: ['', [Validators.required]],
      destinataireReference: [this.destinataireReference, [Validators.required, Validators.maxLength(9), Validators.pattern(BenefRegex)]],
      destinataireTitre: [this.destinataireTitre],
      destinataireRaisonSociale: [this.destinataireRaisonSociale],
      destinataireRaisonSociale2: [this.destinataireRaisonSociale2],
      destinataireAdresse: [this.destinataireAdresse],
      destinataireAdresse2: [this.destinataireAdresse2],
      destinataireCodePostal: [this.destinataireCodePostal, [Validators.required, Validators.maxLength(5), Validators.pattern(NumberRegex)]],
      destinataireCommune: [this.destinataireCommune, [Validators.required]],
      dateCreation: [this.todayDate, [Validators.required]],
      piecesJointes: [''],
      vosReferences: [this.vosReferences],
      vosReferences2: [''],
      nosReferences: [''],
      numDossier: [this.numDossier],
      contact: [this.contact, [Validators.required]],
      copieInformation: [''],
      objet: [this.objet, [Validators.required]],
      signataire: ['', [Validators.required]]
    });

    setTimeout(() => {
      this.setControldestinataire();
      this.setControlDate();
      this.setControlAdresse();
      this.setControlRaisonSociale();
    }, 0)
  }

  ngOnChanges() {
  }

  /**
   * Permet de fermer le dialog de création de courrier
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Récupère les informations du FormGroup pour pouvoir générer le courrier
   * Ajoute a l'objet this.courrier toutes les valeurs de la popup
   */
  onSubmit() {
    this.spinnerLuncher.show();
    // Destinataire
    this.courrier.destinataire = this.destinataire;
    //    Destinataire : Référence
    this.courrier.destinataire.reference = this.destinataireReferenceControl.value.toUpperCase();
    //    Destinataire : Raison sociale
    this.courrier.destinataire.raisonSociale1 = this.destinataireRaisonSocialeControl.value;
    //    Destinataire : Raison sociale
    this.courrier.destinataire.raisonSociale2 = this.destinataireRaisonSociale2Control.value;
    //    Destinataire : Adresse (Objet)
    this.courrier.destinataire.address = this.destinataireAdresseComplete;
    //        Destinataire : Adresse - Adresse
    this.courrier.destinataire.address.adresse3 = this.destinataireAdresseControl.value;
    //        Destinataire : Adresse - Adresse
    this.courrier.destinataire.address.adresse4 = this.destinataireAdresse2Control.value;
    //        Destinataire : Adresse - Titre
    this.courrier.destinataire.address.titreCivilite = this.destinataireTitreControl.value;
    //        Destinataire : Adresse - Code Postal
    this.courrier.destinataire.address.codePostal = this.destinataireCodePostalControl.value;
    //        Destinataire : Adresse - Commune
    this.courrier.destinataire.address.acheminement = this.destinataireCommuneControl.value.toUpperCase();
    //    Destinataire : Commune (Objet)
    this.courrier.destinataire.commune = this.destinataireCommuneComplete;


    // Permet de gerer la différence de format entre la Date par défaut et la date sélectionnée dans le datePicker
    if (this.dateCreationControl.value._d) {
      // Si la date à été modifiée
      this.courrier.dateCreation = this.dateCreationControl.value._d;
    } else {
      // Si la date est celle par défaut
      this.courrier.dateCreation = this.dateCreationControl.value;
    }

    // valorisation du courrier
    this.courrier.piecesJointes = this.piecesJointesControl.value;
    this.courrier.vosReferences1 = this.vosReferencesControl.value;
    this.courrier.vosReferences2 = this.vosReferences2Control.value;
    this.courrier.nosReferences = this.nosReferencesControl.value;
    this.courrier.numDossier = this.numDossier;
    this.courrier.copieInformation = this.copieInformationControl.value;
    this.courrier.objet = this.objetControl.value;

    // debut de création du courrier
    this.dossierService.postCourrier(this.courrier, this.dossierService.dossier.id).pipe(takeUntil(this.unsubscribe))
      .subscribe(courrierGcd => {
        this.spinnerLuncher.hide();
        // si le courrier est bien crée
        this.courrierGcd = courrierGcd;
        this.dialogRef.close(false);
        this.snackbar.open(`Le courrier a bien été créé.`, 'X', snackbarConfigSuccess);
        window.open(this.courrierGcd.urlOffice.toString(), '_self')
      },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          // s'il y a un erreur de création
          const snackMessage = getErrorMessage(error, `La création du courrier a échoué. Contacter l'administrateur.`);
          this.snackbar.open(snackMessage, 'X', snackbarConfigLongError);
        });


  }

  // -------------------------- MODELE --------------------------

  /**
   * Enregistre l'objet Modele sélectionné dans l'objet Courrier
   * @param event
   */
  onModeleSelect(event: ModeleGCD) {
    this.courrier.modele = event
  }

  /**
  * Gère comment un Modele doit être affiché dans la liste déroulante
  * @param modele le modele à formater
  */
  displayModele(modele: ModeleGCD): string | undefined {
    if (modele) {
      return `${modele.type}`;
    }
  }

  // -------------------------- DESTINATAIRE --------------------------

  /**
   * Controle si il y a des changement de valeur de la référence du destinataire
   * Gère l'ajout des informations liées à un destinataire lorsque une référence valide est ajoutée
   * Fonction appellée lorsqu'un utilisateur selectionne dans la popup de recherche un destinataire
   */
  setControldestinataire() {
    // Lorsque le formControl de la référence change
    this.destinataireReferenceControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value: string) => {
        // Et qu'il est valide
        if (this.destinataireReferenceControl.valid) {
          this.destinataireReference = this.destinataireReferenceControl.value.toUpperCase();
          // Récupère les données completes du destinataire vers le back à partir de sa référence
          //    Permet de gérer le manque d'informations (adresse...) ramené par la popup de recherche
          this.dossierService.getBeneficaire(this.destinataireReference)
            .subscribe((destinataire) => {
              this.destinataire = destinataire
              // Ajoute les informations du destinataire
              //    Raison sociale
              this.destinataireRaisonSociale = destinataire.raisonSociale;
              this.destinataireRaisonSocialeControl.setValue(this.destinataireRaisonSociale);
              //    Raison sociale 2
              this.destinataireRaisonSociale2 = destinataire.raisonSociale2;
              this.destinataireRaisonSociale2Control.setValue(this.destinataireRaisonSociale2);
              //    Adresse (objet)
              this.destinataireAdresseComplete = destinataire.address;
              //      Adresse (objet) - Titre
              this.destinataireTitre = destinataire.address.titreCivilite;
              this.destinataireTitreControl.setValue(this.destinataireTitre);
              //      Adresse (objet) - Adresse
              this.destinataireAdresse = destinataire.address.adresse3;
              this.destinataireAdresseControl.setValue(this.destinataireAdresse);
              //      Adresse (objet) - Adresse 2
              this.destinataireAdresse2 = destinataire.address.adresse4;
              this.destinataireAdresse2Control.setValue(this.destinataireAdresse2);
              //      Adresse (objet) - Code Postal
              this.destinataireCodePostal = destinataire.address.codePostal;
              this.destinataireCodePostalControl.setValue(this.destinataireCodePostal);
              //      Adresse (objet) - Commune
              this.destinataireCommune = destinataire.address.acheminement;
              this.destinataireCommuneControl.setValue(this.destinataireCommune);
              //    Commune (Objet)
              this.destinataireCommuneComplete = destinataire.commune;
            },
              (error: HttpErrorResponse) => {
                this.destinataireReferenceControl.setErrors({ 'benefNotFound': true });
                this.message = getErrorMessage(error);

                this.setdestinataireToNull();
              }
            );
        } else {
          this.setdestinataireToNull();
        }
      }
      );
  }

  /**
   * Supprime toutes les valeurs liées au destinataire
   * (dans le cas d'une erreur dans la référence)
   */
  setdestinataireToNull() {
    this.destinataire = null;
    //    Supprime le titre
    this.destinataireTitre = null;
    this.destinataireTitreControl.setValue(null);
    //    Supprime la raison sociale
    this.destinataireRaisonSociale = null;
    this.destinataireRaisonSocialeControl.setValue(null);
    this.destinataireRaisonSociale2 = null;
    this.destinataireRaisonSociale2Control.setValue(null);
    //    Supprime l'adresse
    this.destinataireAdresseComplete = null;
    this.destinataireAdresse = null;
    this.destinataireAdresseControl.setValue(null);
    this.destinataireAdresse2 = null;
    this.destinataireAdresse2Control.setValue(null);
    //    Supprime le code postal
    this.destinataireCommuneComplete = null;
    this.destinataireCodePostal = null;
    this.destinataireCodePostalControl.setValue(null);
    //    Supprime la commune
    this.destinataireCommune = null;
    this.destinataireCommuneControl.setValue(null);
  }

  /**
  * Ouvre la popup de recherche de destinataire
  */
  searchDestinataire() {
    const matDialogRef = this.openSearchDestinataireDialog();

    matDialogRef.afterClosed().subscribe(
      res => {
        if (res === false) {
          // Récupère le destinataire sélectionné
          this.destinataire = matDialogRef.componentInstance.data.beneficiaire;
          this.courrier.destinataire = this.destinataire;

          //    Ajoute la référence du destinataire (à pour effet d'appeler la fonction setControlDestinataire())
          this.destinataireReference = this.destinataire.reference;
          this.destinataireReferenceControl.setValue(this.destinataireReference);
        }
      });

  }

  /**
   * Configuration de la popup de recherche de destinataire
   */
  openSearchDestinataireDialog(): MatDialogRef<SearchPopupInterlocuteurComponent> {
    const config = new MatDialogConfig();
    config.width = '90%';
    config.disableClose = true;
    config.autoFocus = false;
    config.data = { beneficiaire: null, title: 'Recherche Destinataire' };
    return this.dialog.open(SearchPopupInterlocuteurComponent, config);
  }

  // ----- Destinataire : Raison sociale -----

  /**
 * Controle si il y a des changement de valeur des deux champs Raison sociale
 * Ajoute une erreur sur le deuxieme champs (destinataireRaisonSociale2) si aucun des deux champs ne contient de valeur
 */
  setControlRaisonSociale() {
    // Verifie les changements de valeurs de la premiere ligne de raison sociale
    this.destinataireRaisonSocialeControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (!value && !this.destinataireRaisonSociale2Control.value) {
          // Si la valeur du champs est null, alors met une erreur
          this.destinataireRaisonSocialeControl.setErrors({ 'raisonSocialeRequired': true });
        } else if (value === '' && this.destinataireRaisonSociale2Control.value === '') {
          // Si la valeur du champs est vide, alors met une erreur
          this.destinataireRaisonSocialeControl.setErrors({ 'raisonSocialeRequired': true });
        } else {
          // Dans le cas contraire, enleve l'erreur
          this.destinataireRaisonSocialeControl.setErrors(null);
        }
      });

    // Verifie les changements de valeurs de la seconde ligne de raison sociale
    this.destinataireRaisonSociale2Control.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (!value && !this.destinataireRaisonSocialeControl.value) {
          // Si la valeur du champs est null, alors met une erreur
          this.destinataireRaisonSocialeControl.setErrors({ 'raisonSocialeRequired': true });
        } else if (value === '' && this.destinataireRaisonSocialeControl.value === '') {
          // Si la valeur du champs est vide, alors met une erreur
          this.destinataireRaisonSocialeControl.setErrors({ 'raisonSocialeRequired': true });
        } else {
          // Dans le cas contraire, enleve l'erreur
          this.destinataireRaisonSocialeControl.setErrors(null);
        }
      });

  }

  // ----- Destinataire : Adresse -----

  /**
   * Controle si il y a des changement de valeur des deux champs Adresse
   * Ajoute une erreur sur le deuxieme champs (destinataireAdresse2) si aucun des deux champs ne contient de valeur
   */
  setControlAdresse() {
    // Verifie les changements de valeurs de la premiere ligne d'adresse
    this.destinataireAdresseControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (!value && !this.destinataireAdresse2Control.value) {
          // Si la valeur du champs est null, alors met une erreur
          this.destinataireAdresseControl.setErrors({ 'adresseRequired': true });
        } else if (value === '' && this.destinataireAdresse2Control.value === '') {
          // Si la valeur du champs est vide, alors met une erreur
          this.destinataireAdresseControl.setErrors({ 'adresseRequired': true });
        } else {
          // Dans le cas contraire, enleve l'erreur
          this.destinataireAdresseControl.setErrors(null);
        }
      });

    // Verifie les changements de valeurs de la seconde ligne d'adresse
    this.destinataireAdresse2Control.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (!value && !this.destinataireAdresseControl.value) {
          // Si la valeur du champs est null, alors met une erreur
          this.destinataireAdresseControl.setErrors({ 'adresseRequired': true });
        } else if (value === '' && this.destinataireAdresseControl.value === '') {
          // Si la valeur du champs est vide, alors met une erreur
          this.destinataireAdresseControl.setErrors({ 'adresseRequired': true });
        } else {
          // Dans le cas contraire, enleve l'erreur
          this.destinataireAdresseControl.setErrors(null);
        }
      });

  }


  // -------------------------- DATE CREATION --------------------------

  /**
   * Controle si il y a des changement de valeur de la date de creation
   * Gère les erreurs de format de date
   */
  setControlDate() {
    this.dateCreationControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (value && value._i && !(value._i instanceof Object)) {
          if (!isNaN(Number(value._i)) && value._i.length > 8) {
            this.dateCreationControl.setErrors({ 'dateLength': true });
          }
          if (isNaN(Number(value._i)) && value._i.length > 10) {
            this.dateCreationControl.setErrors({ 'dateLength': true });
          }
          // vérifie que la date respecte le format jj/mm/aaaa
          if (!FrenchDateRegex.test(value._i)) {
            this.dateCreationControl.setErrors({ 'wrongFormat': true });
          }
        }
      });
  }

  // -------------------------- LR AVEC AVIS DE RECEPTION --------------------------

  /**
   * Enregistre dans l'objet Courrier la valeur du toggle bouton de LR avec avis de récéption
   * @param event boolean : Valeur du toggle bouton
   */
  onChangeToggle(event) {
    this.courrier.avisDeReception = event;
  }


  // -------------------------- CONTACT --------------------------

  /**
   * Enregistre l'objet contact sélectionné dans l'objet Courrier
   * @param contact
   */
  onContactSelect(contact: ResponsableTechnique) {
    this.courrier.contact = contact;
  }

  /**
   * Gère comment un Contact doit être affiché dans la liste déroulante
   * @param contact le contact à formater
   */
  displayContact(contact: ResponsableTechnique): string | undefined {
    if (contact) {
      return `${contact.prenom}  ${contact.nom}`;
    }
  }

  // -------------------------- SIGNATAIRE --------------------------

  /**
   * Enregistre l'objet signataire sélectionné dans l'objet Courrier
   * @param signataire
   */
  onSignataireSelect(signataire: ResponsableTechnique) {
    this.courrier.signataire = signataire;
  }

  /**
   * Gère comment un Signataire doit être affiché dans la liste déroulante
   * @param signataire a given signataire to be formatted
   */
  displaySignataire(signataire: ResponsableTechnique): string | undefined {
    if (signataire) {
      return `${signataire.prenom}  ${signataire.nom}`;
    }
  }

  /**
   * Filtre la liste déroulante en fonction de ce qu'écris l'utilisateur
   * @param value user input
   */
  filterSignataires(value: string) {
    return this.signataires.filter(sign => {
      let result = false;
      sign.nom.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (sign.prenom.toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }

  // ------------------------------------------------------------------------------------------

  /**
   * Détruit les subscribe actifs
   */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


}
