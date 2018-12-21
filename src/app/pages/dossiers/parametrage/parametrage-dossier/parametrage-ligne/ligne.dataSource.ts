import { DataSource } from '@angular/cdk/table';
import { Lignes } from 'app/pages/dossiers/dossier/dossier.interface';
import { ListValeur } from 'app/pages/dossiers/dossiers.interface';
import { Observable, of as observableOf } from 'rxjs';


export class LigneDataSource extends DataSource<any> {
  constructor(private data: Lignes[]) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ListValeur[]> {
    const rows = [];
    this.data.forEach((element: Lignes) => {
      //  let caracteristique = element.listeCaracteristique
      rows.push(element, { detailRow: true, element });
    });
    return observableOf(rows);
  }
  disconnect() { }
}








