import { DataSource } from '@angular/cdk/table';
import { Observable, of as observableOf } from 'rxjs';

import { Dossier } from '../../dossiers.interface';


export class DossierDataSource extends DataSource<any> {
  constructor(private data: Dossier[]) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Dossier[]> {
    const rows = [];
    this.data.forEach((element: Dossier) => {
      //  let caracteristique = element.listeCaracteristique
      rows.push(element, { detailRow: true, element });
    });
    return observableOf(rows);
  }
  disconnect() { }
}








