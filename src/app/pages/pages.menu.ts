import { EnumParametrage } from './dossiers/dossier/enumeration/enumerations';

const general = {
  menu: {
    dossiers: {
      title: 'Dossiers',
      accueil: 'Accueil',
      new: 'Créer',
      update: 'Dossier',
      dossier: 'Dossier',
      search: 'Rechercher',
      gererPrev: 'Gérer prévisionnel',
      validerSiege: 'Valider siège',
      valider: 'Valider Délégué/DGA',
      saisirAvis: 'Saisir avis',
      preparerSession: 'Préparer',
      parametrer: 'Paramétrer',
      imprimer: 'Imprimer',
      gererSession: 'Gérer session',
      attributeAide: 'Attribuer les aides',
      followDossier: 'Suivre les dossiers',
      signDocAttributif: 'Vérifier/Signer',
      notify: 'Notifier',
      controlPartenarial: 'Contrôle partenarial',
      gererTransfert: 'Gérer transferts',
      validerPMAV: 'Valider PMAV',
      revive: 'Relancer',
      closeDossier: 'Clôturer dossiers',
      emitRecette: 'Emettre recette'
    }
  }
}
export const PAGES_MENU = [
  {
    path: '',
    children: [
      {
        path: 'accueil',
        data: {
          menu: {
            title: general.menu.dossiers.accueil,
            icon: 'ion-grid',
            selected: false,
            expanded: false,
            order: 600
          }
        }
      },
      {
        path: '',
        data: {
          menu: {
            title: general.menu.dossiers.title,
            icon: 'ion-ios-list-outline',
            selected: false,
            expanded: false,
            order: 600
          }
        },
        children: [
          {
            path: 'recherche',
            data: {
              menu: {
                title: general.menu.dossiers.search,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: 'creation',
            data: {
              menu: {
                title: general.menu.dossiers.new,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: 'gererPrev',
            data: {
              menu: {
                title: general.menu.dossiers.gererPrev,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: 'validerSiege',
            data: {
              menu: {
                title: general.menu.dossiers.validerSiege,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: 'valider',
            data: {
              menu: {
                title: general.menu.dossiers.valider,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: '',
            data: {
              menu: {
                title: general.menu.dossiers.gererSession,
                selected: false,
                expanded: false,
                order: 600
              }
            },
            children: [
              {
                path: 'preparerSession',
                data: {
                  menu: {
                    title: general.menu.dossiers.preparerSession,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'saisirAvis',
                data: {
                  menu: {
                    title: general.menu.dossiers.saisirAvis,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'attribuerAides',
                data: {
                  menu: {
                    title: general.menu.dossiers.attributeAide,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              }
            ]
          },
          {
            path: '',
            data: {
              menu: {
                title: general.menu.dossiers.followDossier,
                selected: false,
                expanded: false,
                order: 600
              }
            },
            children: [
              {
                path: 'signDocAttributif',
                data: {
                  menu: {
                    title: general.menu.dossiers.signDocAttributif,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'notify',
                data: {
                  menu: {
                    title: general.menu.dossiers.notify,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'controlPartenarial',
                data: {
                  menu: {
                    title: general.menu.dossiers.controlPartenarial,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'gererTransfert',
                data: {
                  menu: {
                    title: general.menu.dossiers.gererTransfert,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'validerPMAV',
                data: {
                  menu: {
                    title: general.menu.dossiers.validerPMAV,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'revive',
                data: {
                  menu: {
                    title: general.menu.dossiers.revive,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              },
              {
                path: 'closeDossier',
                data: {
                  menu: {
                    title: general.menu.dossiers.closeDossier,
                    selected: false,
                    expanded: false,
                    order: 600
                  }
                }
              }
            ]
          },
          {
            path: 'emitRecette',
            data: {
              menu: {
                title: general.menu.dossiers.emitRecette,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: 'update',
            data: {
              menu: {
                title: general.menu.dossiers.update,
                hidden: true
              }
            }
          },
          {
            path: 'dossier',
            data: {
              menu: {
                title: general.menu.dossiers.dossier,
                hidden: true,
                pathMatch: 'prefix',
                showingParent: true
              }
            }
          }
        ]
      },
      {
        path: 'parametrer',
        data: {
          menu: {
            title: general.menu.dossiers.parametrer,
            selected: false,
            icon: 'ion-network',
            expanded: false,
            order: 600
          }
        },
        children: [
          {
            path: EnumParametrage.A_LISTVAL,
            data: {
              menu: {
                title: EnumParametrage.A_LISTVAL,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: EnumParametrage.B_OP,
            data: {
              menu: {
                title: EnumParametrage.B_OP,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: EnumParametrage.C_SESSION,
            data: {
              menu: {
                title: EnumParametrage.C_SESSION,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: EnumParametrage.D_LIGNE,
            data: {
              menu: {
                title: EnumParametrage.D_LIGNE,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          },
          {
            path: EnumParametrage.E_FINANCEUR,
            data: {
              menu: {
                title: EnumParametrage.E_FINANCEUR,
                selected: false,
                expanded: false,
                order: 600
              }
            }
          }
        ]
      }
    ]
  }
];
