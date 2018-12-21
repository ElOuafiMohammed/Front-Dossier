import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs/Observable';

import { Correspondant } from './correspondant.interface';


export class CarateristiqueInterlocuteurDataSource extends DataSource<any>{
  constructor(private elementData: Correspondant[]) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Correspondant[]> {
    const rows = [];
    if (this.elementData) {
      this.elementData.forEach((element: Correspondant) => {
        rows.push(element);
      });
    }
    return Observable.of(rows);
  }

  disconnect() { }

}

