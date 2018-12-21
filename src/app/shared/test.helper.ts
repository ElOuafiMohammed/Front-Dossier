import { ListValeur } from "app/pages/dossiers/dossiers.interface";

import { ResponsableTechnique } from "../pages/dossiers/create-dossier/create-dossier.interface";

// No use of static class because it would break the Webpack tree-shaking
// https://github.com/webpack/webpack/issues/4080

export function getStubListValeur(): ListValeur[] {
  const list: ListValeur[] = [
    {
      id: 1,
      code: "fake code",
      libelle: "fake label",
      codeParam: "fake code param",
      libelleParam: "fake label param"
    }
  ];

  return list;
}

export class SpinnerLuncherStub {
  public hide() {}
  public show() {}
}

export const dummyResponsableAdministratif: ResponsableTechnique = {
  login: "login",
  prenom: "prenom",
  nom: "nom",
  email: "email",
  organisation: "organisation",
  telephone: "0000000"
};
