
/**
 * utils CLASS to manage alphanumeric
 */
export default class AlphanumericUtils {

  /**
   * allows the return to the line
   */
  static addLine($event: any, oField: any) {
    let content: string = oField.value as string;
    if ($event.keyCode === 13) {
      content = (content.substring(0, oField.selectionStart) + '\n' +
        content.substring(oField.selectionStart, content.length));
    }
    return content;
  }



  /**
 * pas garder les caractères speciaux
 * @param value
 */
  static onlyAlphaNumeric(value: any) {
    if (value !== '') {
      return value.replace(/[^A-Za-z0-9]+/g, '');
    } else {
      return value;
    }
  }

  static videInput(event, control) {
    if (event.target && event.target.value === '0') {
      control.setValue('');
    }
  }

}
