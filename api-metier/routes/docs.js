const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration complète Swagger avec tous les endpoints
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Neighbors API - Gestion des Résidences et Cohabitation',
      description: 'API complète pour la gestion des résidences, foyers, occupants et système de notation/signalements. Testez les endpoints directement avec le bouton "Try it out".',
      version: '1.0.0',
      contact: {
        name: 'Support API'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.neighbors.app/api',
        description: 'Serveur de production'
      }
    ],
    paths: {
      '/residences': {
        get: {
          summary: 'Récupérer toutes les résidences',
          tags: ['Residences'],
          responses: {
            '200': {
              description: 'Liste de toutes les résidences',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Residence' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer une nouvelle résidence',
          tags: ['Residences'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResidenceInput' },
                example: {
                  name: 'Résidence Montsouris',
                  address: '123 Rue de Paris, 75014 Paris'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Résidence créée avec succès',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Residence' }
                }
              }
            },
            '400': {
              description: 'Données invalides'
            }
          }
        }
      },
      '/residences/{id}': {
        delete: {
          summary: 'Supprimer une résidence',
          tags: ['Residences'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la résidence'
            }
          ],
          responses: {
            '200': {
              description: 'Résidence supprimée'
            },
            '404': {
              description: 'Résidence non trouvée'
            }
          }
        }
      },
      '/residences/{id}/leaderboard': {
        get: {
          summary: 'Obtenir le classement des foyers d\'une résidence',
          tags: ['Residences'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Classement des foyers avec leurs scores',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        address: { type: 'string' },
                        score: { type: 'number' }
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Résidence non trouvée'
            }
          }
        }
      },
      '/houses': {
        get: {
          summary: 'Récupérer tous les foyers',
          tags: ['Houses'],
          responses: {
            '200': {
              description: 'Liste de tous les foyers',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/House' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer un nouveau foyer',
          tags: ['Houses'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HouseInput' },
                example: {
                  residenceId: 1,
                  address: 'Appartement 42, 123 Rue de Paris'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Foyer créé avec succès',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/House' }
                }
              }
            }
          }
        }
      },
      '/houses/{id}': {
        get: {
          summary: 'Récupérer un foyer avec son score actuel',
          tags: ['Houses'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Détails du foyer avec score et statut',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    allOf: [
                      { $ref: '#/components/schemas/House' },
                      {
                        type: 'object',
                        properties: {
                          currentScore: { type: 'number' },
                          status: { type: 'string', enum: ['COMPLIANT', 'WARNING', 'EXPULSION_WARNING'] }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '404': {
              description: 'Foyer non trouvé'
            }
          }
        },
        patch: {
          summary: 'Modifier un foyer',
          tags: ['Houses'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HouseInput' },
                example: {
                  residenceId: 1,
                  address: 'Appartement 42 (Rénové), 123 Rue de Paris'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Foyer modifié'
            },
            '404': {
              description: 'Foyer non trouvé'
            }
          }
        },
        delete: {
          summary: 'Supprimer un foyer',
          tags: ['Houses'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Foyer supprimé'
            },
            '404': {
              description: 'Foyer non trouvé'
            }
          }
        }
      },
      '/users': {
        get: {
          summary: 'Récupérer tous les utilisateurs (Référents/Admins)',
          tags: ['Users'],
          responses: {
            '200': {
              description: 'Liste de tous les utilisateurs',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer un nouvel utilisateur',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserInput' },
                example: {
                  name: 'Jean Dupont',
                  email: 'jean.dupont@neighbors.app',
                  role: 'admin'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Utilisateur créé'
            }
          }
        }
      },
      '/users/{id}': {
        delete: {
          summary: 'Supprimer un utilisateur',
          tags: ['Users'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Utilisateur supprimé'
            },
            '404': {
              description: 'Utilisateur non trouvé'
            }
          }
        }
      },
      '/users/{id}/approve-expulsion': {
        post: {
          summary: 'Approuver l\'expulsion d\'un foyer (Action Admin)',
          tags: ['Users'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    houseId: { type: 'integer' }
                  },
                  required: ['houseId']
                },
                example: {
                  houseId: 5
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Expulsion approuvée'
            },
            '400': {
              description: 'Les conditions d\'expulsion ne sont pas remplies'
            },
            '404': {
              description: 'Utilisateur ou foyer non trouvé'
            }
          }
        }
      },
      '/occupants': {
        get: {
          summary: 'Récupérer tous les occupants (membres des foyers)',
          tags: ['Occupants'],
          responses: {
            '200': {
              description: 'Liste de tous les occupants',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Occupant' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer un nouvel occupant',
          tags: ['Occupants'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OccupantInput' },
                example: {
                  name: 'Marie Dupont',
                  houseId: 1
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Occupant créé'
            }
          }
        }
      },
      '/occupants/{id}': {
        get: {
          summary: 'Récupérer un occupant avec son score',
          tags: ['Occupants'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Détails de l\'occupant avec score',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    allOf: [
                      { $ref: '#/components/schemas/Occupant' },
                      {
                        type: 'object',
                        properties: {
                          score: { type: 'number' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '404': {
              description: 'Occupant non trouvé'
            }
          }
        },
        patch: {
          summary: 'Modifier un occupant',
          tags: ['Occupants'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OccupantInput' },
                example: {
                  name: 'Marie Dupont-Martin',
                  houseId: 1
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Occupant modifié'
            },
            '404': {
              description: 'Occupant non trouvé'
            }
          }
        },
        delete: {
          summary: 'Supprimer un occupant',
          tags: ['Occupants'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Occupant supprimé'
            },
            '404': {
              description: 'Occupant non trouvé'
            }
          }
        }
      },
      '/reviews': {
        get: {
          summary: 'Récupérer tous les avis',
          tags: ['Reviews'],
          responses: {
            '200': {
              description: 'Liste de tous les avis',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Review' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer un nouvel avis sur un occupant',
          tags: ['Reviews'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewInput' },
                example: {
                  submitterUserId: 1,
                  authorOccupantId: 2,
                  targetOccupantId: 3,
                  rating: 4.5,
                  comment: 'Très bon voisin, très discret'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Avis créé'
            },
            '400': {
              description: 'Données invalides'
            },
            '404': {
              description: 'Utilisateur, auteur ou cible non trouvé'
            }
          }
        }
      },
      '/reviews/{id}': {
        delete: {
          summary: 'Supprimer un avis',
          tags: ['Reviews'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Avis supprimé'
            },
            '404': {
              description: 'Avis non trouvé'
            }
          }
        }
      },
      '/reports': {
        get: {
          summary: 'Récupérer tous les signalements',
          tags: ['Reports'],
          responses: {
            '200': {
              description: 'Liste de tous les signalements',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Report' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer un signalement contre un occupant',
          tags: ['Reports'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReportInput' },
                example: {
                  authorUserId: 1,
                  targetOccupantId: 3,
                  reason: 'Bruit excessif',
                  description: 'Musique forte tard le soir, plusieurs fois par semaine'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Signalement créé'
            },
            '404': {
              description: 'Utilisateur non trouvé'
            }
          }
        }
      },
      '/reports/{id}': {
        patch: {
          summary: 'Modifier un signalement',
          tags: ['Reports'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    isProcessed: { type: 'boolean' }
                  }
                },
                example: {
                  isProcessed: true
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Signalement modifié'
            },
            '404': {
              description: 'Signalement non trouvé'
            }
          }
        },
        delete: {
          summary: 'Supprimer un signalement',
          tags: ['Reports'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Signalement supprimé'
            },
            '404': {
              description: 'Signalement non trouvé'
            }
          }
        }
      },
      '/events': {
        get: {
          summary: 'Récupérer tous les événements',
          tags: ['Events'],
          responses: {
            '200': {
              description: 'Liste de tous les événements',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Event' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Créer un nouvel événement',
          tags: ['Events'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventInput' },
                example: {
                  title: 'Apéro du voisinage',
                  description: 'Venez nous rencontrer dans la cour commune',
                  minScoreRequired: 2.5,
                  date: '2026-02-15T18:00:00Z',
                  location: 'Cour commune, Bâtiment A'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Événement créé'
            }
          }
        }
      },
      '/events/{id}': {
        patch: {
          summary: 'Modifier un événement',
          tags: ['Events'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventInput' },
                example: {
                  title: 'Apéro du voisinage - Édition 2026',
                  description: 'Venez nous rencontrer dans la cour commune (déplacement à 18h30)',
                  minScoreRequired: 2.0,
                  date: '2026-02-15T18:30:00Z',
                  location: 'Cour commune, Bâtiment A'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Événement modifié'
            },
            '404': {
              description: 'Événement non trouvé'
            }
          }
        },
        delete: {
          summary: 'Supprimer un événement',
          tags: ['Events'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Événement supprimé'
            },
            '404': {
              description: 'Événement non trouvé'
            }
          }
        }
      },
      '/events/{id}/register': {
        post: {
          summary: 'Inscrire un occupant à un événement',
          tags: ['Events'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    occupantId: { type: 'integer' }
                  },
                  required: ['occupantId']
                },
                example: {
                  occupantId: 2
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Inscription réussie'
            },
            '403': {
              description: 'Inscription refusée - Score du foyer trop bas'
            },
            '404': {
              description: 'Événement ou occupant non trouvé'
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Residence: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unique de la résidence' },
            name: { type: 'string', description: 'Nom de la résidence' },
            address: { type: 'string', description: 'Adresse de la résidence' }
          },
          required: ['id', 'name', 'address']
        },
        ResidenceInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { type: 'string' }
          },
          required: ['name', 'address']
        },
        House: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            residenceId: { type: 'integer', description: 'ID de la résidence parent' },
            address: { type: 'string' },
            occupants: {
              type: 'array',
              items: { $ref: '#/components/schemas/Occupant' }
            }
          },
          required: ['id', 'residenceId', 'address']
        },
        HouseInput: {
          type: 'object',
          properties: {
            residenceId: { type: 'integer' },
            address: { type: 'string' }
          },
          required: ['residenceId', 'address']
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'referent'] }
          },
          required: ['id', 'name', 'email', 'role']
        },
        UserInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'referent'] }
          },
          required: ['name', 'email', 'role']
        },
        Occupant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            houseId: { type: 'integer', description: 'ID du foyer' },
            receivedReviews: {
              type: 'array',
              items: { $ref: '#/components/schemas/Review' }
            }
          },
          required: ['id', 'name', 'houseId']
        },
        OccupantInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            houseId: { type: 'integer' }
          },
          required: ['name', 'houseId']
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            submitterUserId: { type: 'integer' },
            authorOccupantId: { type: 'integer' },
            targetOccupantId: { type: 'integer' },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            comment: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'submitterUserId', 'authorOccupantId', 'targetOccupantId', 'rating']
        },
        ReviewInput: {
          type: 'object',
          properties: {
            submitterUserId: { type: 'integer' },
            authorOccupantId: { type: 'integer' },
            targetOccupantId: { type: 'integer' },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            comment: { type: 'string' }
          },
          required: ['submitterUserId', 'authorOccupantId', 'targetOccupantId', 'rating']
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            authorUserId: { type: 'integer' },
            targetOccupantId: { type: 'integer' },
            reason: { type: 'string' },
            description: { type: 'string' },
            isProcessed: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'authorUserId', 'targetOccupantId', 'reason']
        },
        ReportInput: {
          type: 'object',
          properties: {
            authorUserId: { type: 'integer' },
            targetOccupantId: { type: 'integer' },
            reason: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['authorUserId', 'targetOccupantId', 'reason']
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            minScoreRequired: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            participants: { type: 'array', items: { type: 'integer' } }
          },
          required: ['id', 'title']
        },
        EventInput: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            minScoreRequired: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            location: { type: 'string' }
          },
          required: ['title']
        }
      }
    },
    tags: [
      { name: 'Residences', description: 'Gestion des résidences' },
      { name: 'Houses', description: 'Gestion des foyers individuels' },
      { name: 'Users', description: 'Gestion des utilisateurs (Référents/Admins)' },
      { name: 'Occupants', description: 'Gestion des occupants des foyers' },
      { name: 'Reviews', description: 'Système de notation entre occupants' },
      { name: 'Reports', description: 'Système de signalements' },
      { name: 'Events', description: 'Gestion des événements de résidence' }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerSpec
};
