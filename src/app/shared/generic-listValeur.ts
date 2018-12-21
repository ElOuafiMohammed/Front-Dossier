import { AbstractControl } from "@angular/forms";
import {
  NatureOperation,
  SessionDecision
} from "app/pages/dossiers/dossier/dossier.interface";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import {
  Ligne,
  ResponsableTechnique
} from "../pages/dossiers/create-dossier/create-dossier.interface";

export default class GeneriqueListValeur {
  /**
   * Manages how a standard SIGA list value is filtered upon user input
   * @param userInput user input in field
   * @param listValues the generic listValue to filter (should be of type {ListValeur})
   * @param searchLength number of characters to start filtering
   */
  static filterListValeur(
    userInput: string,
    listValues: any[],
    searchLength: number
  ) {
    return listValues.filter(value => {
      let result = false;
      if (userInput.length < searchLength) {
        return (
          value.code
            .toLowerCase()
            .search(userInput.toString().toLowerCase()) === 0
        );
      }
      value.libelle
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(userInput.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        value.code.toLowerCase().search(userInput.toString().toLowerCase()) ===
          0 || result
      );
    });
  }

  /**
   * Manages how a standard SIGA list value is filtered upon user input
   * @param userInput user input in field
   * @param dates the generic listValue to filter (should be of type {Date})
   * @param searchLength number of characters to start filtering
   */
  static filterDate(userInput: string, dates: any[], searchLength: number) {
    return dates.filter(value => {
      let result = false;
      if (userInput.length < searchLength) {
        return (
          value.toLowerCase().search(userInput.toString().toLowerCase()) === 0
        );
      }
      value
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(userInput.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        value.toLowerCase().search(userInput.toString().toLowerCase()) === 0 ||
        result
      );
    });
  }

  /**
   * Generic autocomplete input validator for reactive forms
   * @param listValues the generic listValue to work with
   * @param key used to manage the error state to display
   */
  static sigaAutocompleteValidatorFactory(listValues: any[], key: string) {
    return (group: AbstractControl): { [key: string]: boolean } => {
      let foundValue = false;

      if (listValues) {
        listValues.forEach(value => {
          if (JSON.stringify(value) === JSON.stringify(group.value)) {
            foundValue = true;
          }
        });
      }

      if (!foundValue && group.value) {
        return { [key]: true };
      }

      return null;
    };
  }

  // Set synchronous validator once the data is available
  /**
   *
   * @param listValues
   * @param control
   * @param keyValidator
   * @param minSearch
   */
  static filtringList(
    listValues: any[],
    control: AbstractControl,
    keyValidator: string,
    minSearch: number,
    typeList: string
  ): Observable<any[]> {
    let filteredList = null;
    if (listValues.length !== 0) {
      if (control.validator) {
        control.setValidators([
          control.validator,
          this.sigaAutocompleteValidatorFactory(listValues, keyValidator)
        ]);
      } else {
        control.setValidators(
          this.sigaAutocompleteValidatorFactory(listValues, keyValidator)
        );
      }
    }
    if (typeList === "listValeur") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterListValeur(value, listValues, minSearch)
            : listValues.slice()
        )
      );
    }
    if (typeList === "date") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterDate(value, listValues, minSearch)
            : listValues.slice()
        )
      );
    }
    if (typeList === "sessionDecision") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterSessionDecision(value, listValues)
            : listValues.slice()
        )
      );
    }
    if (typeList === "responsableTech") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterResponsablesTech(value, listValues)
            : listValues.slice()
        )
      );
    }
    if (typeList === "natureOperation") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterNature(value, listValues)
            : listValues.slice()
        )
      );
    }
    if (typeList === "ligne") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterLignes(value, listValues)
            : listValues.slice()
        )
      );
    }
    if (typeList === "modele") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterListValeurModele(value, listValues, 1)
            : listValues.slice()
        )
      );
    }
    if (typeList === "contact") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterContacts(value, listValues)
            : listValues.slice()
        )
      );
    }
    if (typeList === "departement") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterListDepartement(value, listValues, minSearch)
            : listValues.slice()
        )
      );
    }
    if (typeList === "commune") {
      filteredList = control.valueChanges.pipe(
        startWith(""),
        map(value =>
          value && control.hasError(keyValidator)
            ? this.filterListCommune(value, listValues, minSearch)
            : listValues.slice()
        )
      );
    }
    return filteredList;
  }

  /**
   * Manages how already filtered NaturesOperation are filtered upon user input
   * @param value user input
   */
  static filterLignes(value: string, lignes: Ligne[]) {
    return lignes.filter(ligne => {
      const result = false;
      if (value.length < 3) {
        return (
          ligne.numero.toLowerCase().search(value.toString().toLowerCase()) ===
          0
        );
      }
      return (
        result ||
        ligne.numero.toLowerCase().search(value.toString().toLowerCase()) === 0
      );
    });
  }

  /**
   * Manages how SessionDecisions are filtered upon user input
   * @param value user input
   */
  static filterSessionDecision(
    value: any,
    sessions: SessionDecision[],
    minSearch?: number
  ) {
    return sessions.filter(session => {
      let result = false;
      if (value.length < minSearch) {
        return (
          session.numero
            .toString()
            .toLowerCase()
            .search(value.toString().toLowerCase()) === 0
        );
      }
      session.annee
        .toString()
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(value.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        session.numero
          .toString()
          .toLowerCase()
          .search(value.toString().toLowerCase()) === 0 || result
      );
    });
  }

  /**
   * Filters ResponsableTechnique upon user input
   * @param value user input
   */
  static filterResponsablesTech(
    value: string,
    responsablesTech: ResponsableTechnique[]
  ) {
    return responsablesTech.filter(responsableTech => {
      let result = false;
      responsableTech.nom
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(value.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        responsableTech.prenom
          .toLowerCase()
          .search(value.toString().toLowerCase()) === 0 || result
      );
    });
  }

  /**
   * Manages how already filtered NaturesOperation are filtered upon user input
   * @param value user input
   */
  static filterNature(value: string, natures: NatureOperation[]) {
    return natures.filter(operation => {
      let result = false;
      if (value.length < 3) {
        return (
          operation.numero
            .toLowerCase()
            .search(value.toString().toLowerCase()) === 0
        );
      }
      if (value.length < 3) {
        return (
          operation.ligne
            .toLowerCase()
            .search(value.toString().toLowerCase()) === 0
        );
      }
      operation.libelle
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(value.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        result ||
        operation.ligne.toLowerCase().search(value.toString().toLowerCase()) ===
          0 ||
        operation.numero
          .toLowerCase()
          .search(value.toString().toLowerCase()) === 0
      );
    });
  }

  static fillListSessions(
    type: string,
    sessionDecisions: SessionDecision[],
    sessionControl: AbstractControl,
    sessionValidatorKey: string
  ): Observable<SessionDecision[]> {
    // Allow auto-complete filtering on priorites
    let sessions: SessionDecision[] = [];
    sessions = sessionDecisions.filter(session => session.type === type);
    return sessionControl.valueChanges.pipe(
      startWith(""),
      map(value =>
        value && sessionControl.hasError(sessionValidatorKey)
          ? this.filterSessionDecision(value, sessions)
          : sessions.slice()
      )
    );
  }

  /**
   * Filtre la liste déroulante en fonction de ce qu'écris l'utilisateur
   * @param userInput user input in field
   * @param listValues the generic listValue to filter (should be of type {ListValeur})
   * @param searchLength number of characters to start filtering
   */
  static filterListValeurModele(
    userInput: string,
    listValues: any[],
    searchLength: number
  ) {
    return listValues.filter(value => {
      let result = false;
      if (userInput.length < searchLength) {
        return (
          value.type
            .toLowerCase()
            .search(userInput.toString().toLowerCase()) === 0
        );
      }
      value.type
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(userInput.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        value.type.toLowerCase().search(userInput.toString().toLowerCase()) ===
          0 || result
      );
    });
  }

  /**
   * Filtre la liste déroulante en fonction de ce qu'écris l'utilisateur
   * @param value user input
   */
  static filterContacts(value: string, listValues: any[]) {
    return listValues.filter(contact => {
      let result = false;
      contact.nom
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(value.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        contact.prenom.toLowerCase().search(value.toString().toLowerCase()) ===
          0 || result
      );
    });
  }

  /**
   * Manages how a standard SIGA list value is filtered upon user input
   * @param userInput user input in field
   * @param listValues the list of department to filter (should be of type {Departements})
   * @param searchLength number of characters to start filtering
   */
  static filterListDepartement(
    userInput: string,
    listValues: any[],
    searchLength: number
  ) {
    return listValues.filter(value => {
      let result = false;
      if (userInput.length < searchLength) {
        return (
          value.numero
            .toLowerCase()
            .search(userInput.toString().toLowerCase()) === 0
        );
      }
      value.nomDept
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(userInput.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        value.numero
          .toLowerCase()
          .search(userInput.toString().toLowerCase()) === 0 || result
      );
    });
  }

  /**
   * Manages how a standard SIGA list value is filtered upon user input
   * @param userInput user input in field
   * @param listValues the list of town to filter (should be of type {Communes})
   * @param searchLength number of characters to start filtering
   */
  static filterListCommune(
    userInput: string,
    listValues: any[],
    searchLength: number
  ) {
    return listValues.filter(value => {
      let result = false;
      if (userInput.length < searchLength) {
        return (
          value.numInsee
            .toLowerCase()
            .search(userInput.toString().toLowerCase()) === 0
        );
      }
      value.nomCommune
        .toLowerCase()
        .split(" ")
        .forEach(word => {
          if (word.search(userInput.toString().toLowerCase()) === 0) {
            result = true;
          }
        });
      return (
        value.numInsee
          .toLowerCase()
          .search(userInput.toString().toLowerCase()) === 0 || result
      );
    });
  }
}
