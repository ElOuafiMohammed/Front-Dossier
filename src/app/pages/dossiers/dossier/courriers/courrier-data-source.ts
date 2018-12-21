import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable } from 'rxjs';

import { DossierService } from '../../dossiers.service';
import { Courrier } from './courrier.interface';

export class CourrierDataSource implements DataSource<Courrier> {
  /**
   * Sujet courrier permettant la gestion des courriers
   * récupérés depuis le back.
   */
  private courrierSubject: BehaviorSubject<Courrier[]>;

  /**
   * Constructeur de la classe
   * @param dossierService
   */
  constructor(private dossierService: DossierService) {
    this.courrierSubject = new BehaviorSubject<Courrier[]>([]);
  }

  /**
   * Fonction connect de DataSource
   */
  connect(): Observable<Courrier[]> {
    return this.courrierSubject.asObservable();
  }

  /**
   * Fonction disconnect de DataSource
   */
  disconnect(): void {
    this.courrierSubject.complete();
  }

  /**
   * Fonction permettant de récupérer les courriers depuis le back
   * et d'envoyer les données au tableau.
   * @param idDossier
   */
  loadCourriers(idDossier: number) {

    this.dossierService.getCourriers(idDossier)
      .subscribe(courrier => {
        this.courrierSubject.next(courrier);
      });
  }
}
