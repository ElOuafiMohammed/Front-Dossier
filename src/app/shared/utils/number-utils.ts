/**
 * utils CLASS to manage number
 */
export default class NumberUtils {
  // numberRegex: RegExp = new RegExp(/^0|[^0-9 ]+/g);

  /**
   * ne garde que les chiffres
   * @param value
   */
  static onlyNumber(value: any) {
    if (value !== '0' && typeof value !== 'number') {
      return value.replace(/^0|[^0-9 ]+/g, '');
    } else {
      return value;
    }
  }




  /**
   * ne garde que les chiffres réel
   * @param value
   */
  static onlyReel(value: any) {
    if (value !== '0.0' && typeof value !== 'number') {
      return value.replace(/[^\d.]/g, '') // numbers and decimals only
        .replace(/^0(.+)/g, '$1') // remove leading 0
        .replace(/(^0$)/g, '$1') // keep 0 if only 0
        .replace(/(^[\d]{10})[\d]/g, '$1') // not more than 2 digits at the beginning
        .replace(/(\..*)\./g, '$1') // decimal can't exist more than once
        .replace(/^\./g, '0.') // add leading 0 if missing
        .replace(/(\.[\d]{2})./g, '$1'); // not more than 2 digits at the end
    } else {
      return value;
    }
  }

  /**
   * retourne une valeur  aprés formatage
   * Passage en parametre
   * - du nombre de digit dans la partie entiere
   * - du nombre de digit dans la partie décimale
   */
  static onlyDecimalLimit(value: any, nbDigitPartieEntiereN: number, nbDigitPartieDecimaleN: number) {

    let reg1 = /[^\d]/g;  // entier
    if (nbDigitPartieDecimaleN > 0) {
      reg1 = /[^\d.]/g;  // décimales
    }
    const reg2 = /^0(.+)/g;  // remove leading 0
    const reg3 = /(^0$)/g;  // keep 0 if only 0
    let reg4 = /(^[\d]{10})[\d]/g;  // not more than N digits at the beginning
    // TODO : c'est nul mais parfois
    // reg4 = /(^[\d]{nbDigitPartieEntiereS})[\d]/g;  na marche pas parfois oui !!!!!!!!!!!!!!!!
    if (nbDigitPartieEntiereN === 2) {
      reg4 = /(^[\d]{2})[\d]/g;  // not more than N digits at the beginning
    } else if (nbDigitPartieEntiereN === 3) {
      reg4 = /(^[\d]{3})[\d]/g;  // not more than N digits at the beginning
    }
    const reg5 = /(\..*)\./g;  // decimal can't exist more than onceg
    const reg6 = /^\./g;   // add leading 0 if missing
    const reg7 = /(\.[\d]{2})./g;   // not more than N digits at the end

    return value.replace(reg1, '').replace(reg2, '$1').replace(reg3, '$1').replace(reg4, '$1').
      replace(reg5, '$1').replace(reg6, '0.').replace(reg7, '$1');
  }


  /**
   * ne garde que les chiffres y compris le zéro davant
   * @param value
   */
  static onlyNumber2(value: any) {
    if (value !== '0' && typeof value !== 'number') {
      const value2 = value.replace(/[^0-9 ]+/g, '');
      if (value2.length < 2 && value2 !== '') {
        value = 0 + value2;
      } else {
        value = value2;
      }
      return value;
    } else {
      return value;
    }
  }

  /**
   * ne garde que les chiffres
   * @param value
   */
  static onlyNumberSecond(value: any) {
    if ((value !== '0' || value !== 0) && typeof value !== 'number') {
      return value.replace(/[^0-9]+/g, '');
    } else {
      return value;
    }
  }
  /**
   * retourne un number from string
   * @param value
   */
  static toNumber(value: any) {
    if (typeof value !== 'number') {
      return value ? parseInt(value.replace(/\s/g, ''), 0) : 0;
    } else {
      return value;
    }
  }

  static toNumber2(value: string) {
    if (typeof value !== 'number') {
      return value ? parseInt(value.replace(/\s/g, ''), 0) : '';
    } else {
      return value;
    }
  }

  /**
   * retourne un reel from string
   * @param value
   */
  static toReel(value: string) {
    if (typeof value !== 'number') {
      return value ? parseInt(value.replace(/ /g, ''), 0) : '';
    } else {
      return value;
    }
  }

  /**
    * Custom Size to noDataMessage when there is any data
    */
  static myCustomSize(data: any[]) {
    if (data && data.length > 0) {
      return '1.1em';
    } else {
      return '1.0em';
    }
  }

  /**
   * allows the return to the line
   */
  addLine($event: any, oField: any) {
    let content: string = oField.value as string;
    if ($event.keyCode === 13) {
      content = (content.substring(0, oField.selectionStart) + '\n' +
        content.substring(oField.selectionStart, content.length));
    }
    return content;
  }
}
