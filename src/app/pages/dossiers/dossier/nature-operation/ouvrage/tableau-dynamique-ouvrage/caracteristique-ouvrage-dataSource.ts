import { DataSource } from '@angular/cdk/table';
import { Observable, of as observableOf } from 'rxjs';

import { Ouvrage } from '../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';


/**
 * Data source caracteristique ouvrage
 */
export class CaracteristiqueOuvrageDataSource extends DataSource<any> {
  constructor(private elementData: Ouvrage[]) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Ouvrage[]> {
    const rows = [];
    this.elementData.forEach((element: Ouvrage) => {
      rows.push(element, { detailRow: true, element });
    });
    return observableOf(rows);
  }

  disconnect() { }
}
