import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';


export const noDispositifRattacheMessage = 'Pas de dispositif associé';
export const noPrevisionnelLineRattacheMessage = 'Pas de ligne previsionnel associée';
export const noCofinanceurRattacheMessage = 'Pas de cofinanceur associé';
export const noDossierAtraitterMessage = 'Pas de dossier à traiter';
export const PrevisionnelLinesTotalMessage = '';
export const noMasseDeauMessage = 'Pas de masse d\'eau associée';
export const noOuvrageMessage = 'Pas d\'ouvrage associé';
export const noDataMessage = 'Pas de donnée associée';
export const noPieceJointe = 'Pas de pièce jointe associée';
export const noCourrierAssocie = 'Pas de courrier associé';

export const snackbarConfigSuccess: MatSnackBarConfig = {
  duration: 2000,
  horizontalPosition: 'right',
  verticalPosition: 'bottom',
  panelClass: 'snack-bar-success'
};
export const snackbarConfigError: MatSnackBarConfig = {
  duration: 2000,
  horizontalPosition: 'right',
  verticalPosition: 'bottom',
  panelClass: 'snack-bar-error'
};
export const snackbarConfigLongError: MatSnackBarConfig = {
  duration: 4000,
  horizontalPosition: 'right',
  verticalPosition: 'bottom',
  panelClass: 'snack-bar-error'
};

export const snackbarConfigErrorPersistant: MatSnackBarConfig = {
  // duration: 10000,
  horizontalPosition: 'right',
  verticalPosition: 'bottom',
  panelClass: 'snack-bar-error'
};

/**
 * Returns the error message to display for either :
 *  - informing the user with a snackbar : the defaultTechnicalErrorMessage has to be set
 *    + when the error status is 500, the error corresponds to a technical error
 *      and the given default technical error message is returned
 *    + when the error status is different of 500, the error corresponds to a business error
 *      and the message contained in the HTTP error response is returned
 *      whatever it is a sigaapierreur or a common SIGA HTTP error response
 *  - or highlighting a field in error : the defaultTechnicalErrorMessage has not to be set
 *    The message contained in the HTTP error response is then returned
 *    whatever the HTTP error response is a sigaapierreur or an internal SIGA server error
 * @param httpErrorResponse the HTTP error response
 * @param defaultTechnicalErrorMessage the optionnal default technical error message
 */
export function getErrorMessage(httpErrorResponse: HttpErrorResponse, defaultTechnicalErrorMessage?: string): string {
  let message = null;

  // In case of technical error (informing the user with a snackbar)
  if (defaultTechnicalErrorMessage != null) {
    if (httpErrorResponse.status !== 500) {
      // Recover error message of the HTTP error response
      message = getHttpErrorMessage(httpErrorResponse);
    } else {
      message = defaultTechnicalErrorMessage;
    }

    // In case of business management rule (highlighting a field)
  } else {
    // Recover error message of the HTTP error response
    message = getHttpErrorMessage(httpErrorResponse);
  }
  return message;
}

/**
 * Get error message from the HTTP error response
 * The HTTP error response corresponds either to a sigaapierreur (generally when status != 500)
 * or to an internal SIGA server error (generally when status = 500)
 * @param httpErrorResponse the generic listValue to work with
 * @param defaultMessage used to manage the error state to display
 */
function getHttpErrorMessage(httpErrorResponse: HttpErrorResponse): string {
  let httpErrorMessage = null;

  // In case of a catched backend error (business error)
  if (httpErrorResponse.error.sigaapierreur != null) {
    httpErrorMessage = httpErrorResponse.error.sigaapierreur.message;
    // In case of an uncatched backend error (technical error)
  } else {
    httpErrorMessage = httpErrorResponse.error.message;
  }

  return httpErrorMessage;
}

/**
     * Afficher un message de validite dans la snackbar
     * avec detection des changements de composant
     * @param error
     * @param message
     */
export function afficherMessageValide(messageInfo: string, snackBar: MatSnackBar, submitted: boolean, changeDetector: ChangeDetectorRef) {
  afficherMessageValideWithChangeDetector(messageInfo, true, snackBar, changeDetector);
}

/**
 * Afficher un message de validite dans la snackbar
 * avec possibilite de detecter ou non les changements de composants
 * @param error
 * @param message
 */
function afficherMessageValideWithChangeDetector(messageInfo: string, withChangeDetector: boolean, snackBar: MatSnackBar, changeDetector: ChangeDetectorRef) {
  const snackbarRef = snackBar.open(messageInfo, 'X', snackbarConfigSuccess);
  snackbarRef.afterDismissed()
    .subscribe(() => {
      if (withChangeDetector) {
        changeDetector.detectChanges();
      }
    });
}

/**
 * Afficher une erreur dans la snackbar
 * @param error
 * @param message
 */
export function afficherErreur(error: HttpErrorResponse, messageErr: string, snackBar: MatSnackBar, changeDetector: ChangeDetectorRef) {
  const snackMessage = getErrorMessage(error, messageErr);
  const snackbarRef = snackBar.open(snackMessage, 'X', snackbarConfigError);
  snackbarRef.afterDismissed()
    .subscribe(() => {
      changeDetector.detectChanges();
    });
}
