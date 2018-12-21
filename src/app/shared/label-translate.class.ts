import { TranslateService } from '@ngx-translate/core';

export class LabelTranslate {

  constructor(
    private _translate: TranslateService
  ) { }

  /**
   *
   * @param code
   */
  public translateCodeInLabel(code: string) {
    let libelle = '';
    if (code) {
      this._translate.get(code).subscribe(data => {
        libelle = data;
      });
    }

    return libelle;
  };

  /**
   * Transform code to label and replace
   * @param code
   * @param args
   */
  public translateCodeWithParamsToLabel(code: string, ...args) {
    let libelle = this.translateCodeInLabel(code);

    if (libelle) {
      let i = 0;
      for (const arg of args) {
        libelle = libelle.replace('{' + i++ + '}', (arg || ''))
      }
    }
    return libelle;
  }
}
