import { DataSource } from '@angular/cdk/table';
import { ListValeur } from 'app/pages/dossiers/dossiers.interface';
import { Observable, of as observableOf } from 'rxjs';


export class ListValeurDataSource extends DataSource<any> {
  constructor(private data: ListValeur[]) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ListValeur[]> {
    const rows = [];
    this.data.forEach((element: ListValeur) => {
      //  let caracteristique = element.listeCaracteristique
      rows.push(element, { detailRow: true, element });
    });
    return observableOf(rows);
  }
  disconnect() { }
}








