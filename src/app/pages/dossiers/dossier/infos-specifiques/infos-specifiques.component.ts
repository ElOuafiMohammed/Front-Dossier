import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import NumberUtils from 'app/shared/utils/number-utils';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Dossier } from '../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../dossiers.service';
import { ValeurInfoSpecComponent } from './valeur-info-spec/valeur-info-spec.component';


@Component({
  selector: 'siga-infos-specifiques',
  templateUrl: './infos-specifiques.component.html',
  styleUrls: ['./infos-specifiques.component.scss']
})
export class InfosSpecifiquesComponent extends ComponentViewRightMode implements OnInit, OnChanges, OnDestroy {
  @Input() dossier: Dossier;
  @Output() infoUpdated: EventEmitter<boolean> = new EventEmitter();
  @Output() pageHasErrorEvent: EventEmitter<boolean> = new EventEmitter();
  settings = null;
  source: LocalDataSource = new LocalDataSource();
  currentThema: string;
  private unsubscribe = new Subject<void>();
  infoSpecAgri = false;
  infoSpecAeep = false;
  infoSpecIndt = false;
  infoSpecIntl = false;
  widthValeur = null;
  widtLabel = null;
  prixTotalEau = 0;
  prixHtv = 0;
  prixTotalControl: FormControl = new FormControl(this.prixTotalEau);
  prixHtvControl: FormControl = new FormControl(this.prixHtv);


  constructor(private dossierService: DossierService) {
    super(dossierService);
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dossier && this.dossier.thematique) {
      this.prixHtv = this.dossier.totalPrixHtva ? this.dossier.totalPrixHtva : 0;
      this.prixTotalEau = this.dossier.totalPrixEauTtc ? this.dossier.totalPrixEauTtc : 0;
      this.source.load(this.dossier.donneeSpecifiqueThema);
      this.manageAgri(this.dossier.thematique)
      this.manageAeep(this.dossier.thematique)
      this.manageIndt(this.dossier.thematique)
      this.manageIntl(this.dossier.thematique)
      this.settings = this.initSetting(this.widtLabel, this.widthValeur);
    }

  }

  manageAgri(thematique) {
    if (thematique.code === 'AGRI') {
      this.infoSpecAgri = true;
      this.currentThema = 'AGRI'
      this.widthValeur = '22%'
      this.widtLabel = '50%';
    } else {
      this.infoSpecAgri = false;
    }
  }

  manageAeep(thematique) {
    if (thematique.code === 'AEEP' || thematique.code === 'ASST' || thematique.code === 'GREE') {
      this.infoSpecAeep = true;
      this.widthValeur = '70%'
      this.widtLabel = '30%';
    } else {
      this.infoSpecAeep = false;
    }
  }
  manageIndt(thematique) {
    if (thematique.code === 'INDT') {
      this.widthValeur = '75%';
      this.currentThema = 'INDT';
      this.widtLabel = '25%';
      this.infoSpecIndt = true;
    } else {
      this.infoSpecIndt = false;
    }
  }

  manageIntl(thematique) {
    if (thematique.code === 'INTL') {
      this.widthValeur = '78%'
      this.widtLabel = '22%';
      this.infoSpecIntl = true;
    } else {
      this.infoSpecIntl = false;
    }
  }


  initSetting(widthLabelParam: string, widthValeurParam: string) {
    return {
      hideSubHeader: true,
      columns: {
        libelle: {
          type: 'html',
          filter: false,
          width: widthLabelParam,
          valuePrepareFunction: (cell: any, row: any) => {
            let label = null;
            if (row && row.parametreDonneeSpec) {
              label = row.parametreDonneeSpec.label;
            }
            return `<div>${label}</div>`;
          }
        },
        valeurDouble: {
          type: 'custom',
          renderComponent: ValeurInfoSpecComponent,
          onComponentInitFunction: (instance) => {
            instance.editApplicationEventSelect.pipe(takeUntil(this.unsubscribe)).subscribe((value: boolean) => {
              this.infoUpdated.emit(value)
            });
            instance.pageHasErrorEvent.pipe(takeUntil(this.unsubscribe)).subscribe((value: boolean) => {
              this.pageHasErrorEvent.emit(value)
            });
          },
          width: widthValeurParam,
          filter: false,
          addable: false,
        }
      },
      actions: false
    };
  }

  totalOnBlur(total: any) {
    this.candTotalPrix(total);
    this.dossier.totalPrixEauTtc = total;
  }

  candTotalPrix(prixttc?: any, prixHtv?: any) {
    if (this.dossier.totalPrixEauTtc !== prixttc || this.dossier.totalPrixHtva !== prixHtv) {
      this.infoUpdated.emit(true);
    } else {
      this.infoUpdated.emit(false);
    }
  }
  htvaOnBlur(htva: any) {
    this.candTotalPrix(htva)
    this.dossier.totalPrixHtva = htva;
  }
  resetTotalInputs() {
    this.prixTotalControl.setValue(0);
  }

  resetHtvaInputs() {
    this.prixHtvControl.setValue(0);
  }

  onlyDecimalMontant(control: AbstractControl, value: any) {
    if (value) {
      control.setValue(NumberUtils.onlyDecimalLimit(value, 2, 2));
    }
  }
  ngOnDestroy() {
    this.unsubscribe.complete();
    this.unsubscribe.unsubscribe();
  }

}


