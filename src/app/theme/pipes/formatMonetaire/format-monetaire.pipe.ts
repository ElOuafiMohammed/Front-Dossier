import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import NumberUtils from 'app/shared/utils/number-utils';

@Pipe({
  name: 'formatMonetaire'
})
export class FormatMonetairePipe  implements PipeTransform {
  transform(value: any): string {
    if(typeof value !== 'number'){
      const newValue = NumberUtils.toNumber(value);
      return formatNumber(Math.round(newValue), 'fr-FR');
    }
    
      return formatNumber(Math.round(value), 'fr-FR');
  }
 
  
}
