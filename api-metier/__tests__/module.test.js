// models.test.js
const { User, Occupant, House, Residence, Review, Event, ReportReason } = require('../models');

describe('Test RateYourNeighbour Logic', () => {
    
    let userAdmin, userVoisin, userPere;
    let residence, maisonDupont;
    let occPere, occFils, occVoisin;

    // Equivalent du setUp() en Python
    beforeEach(() => {
        // 1. Création des Users (Comptes techniques)
        userAdmin = new User({ id: 1, email: "admin@ryn.com", isAdmin: true });
        userVoisin = new User({ id: 2, email: "paul.voisin@ryn.com" });
        userPere = new User({ id: 10, email: "jean.dupont@ryn.com" });

        // 2. Création Structure
        residence = new Residence({
            id: 1, name: "Les Lilas", address: "10 Rue Paix", 
            city: "Paris", managerId: userAdmin.id
        });

        maisonDupont = new House({
            id: 101, address: "Villa 4", 
            residenceId: residence.id, referentUserId: userPere.id
        });
        userPere.managedHouseId = maisonDupont.id;

        // 3. Création Occupants (Physiques)
        occPere = new Occupant({ id: 100, firstname: "Jean", lastname: "Dupont", age: 45, houseId: 101 });
        occFils = new Occupant({ id: 101, firstname: "Kevin", lastname: "Dupont", age: 19, houseId: 101 });
        occVoisin = new Occupant({ id: 200, firstname: "Paul", lastname: "Martin", age: 35, houseId: 102 });

        // 4. Liens
        maisonDupont.addOccupant(occPere);
        maisonDupont.addOccupant(occFils);
        residence.houses.push(maisonDupont);
    });

    test('Validation des notes (Review Rating)', () => {
        // Test valeur hors borne (doit throw Error)
        expect(() => {
            new Review({
                id: 1, rating: 6, comment: "Bad", isAnonymous: false,
                submitterUserId: userAdmin.id, authorOccupantId: occVoisin.id, targetOccupantId: occPere.id
            });
        }).toThrow("Rating must be between 0 and 5");

        // Test valeur valide
        const rev = new Review({
            id: 1, rating: 4, comment: "Ok", isAnonymous: false,
            submitterUserId: userAdmin.id, authorOccupantId: occVoisin.id, targetOccupantId: occPere.id
        });
        expect(rev.validateRating()).toBe(true);
    });

    test('Calcul des scores (Occupant & House)', () => {
        // Score initial
        expect(occPere.calculateIndividualScore()).toBe(2.5);

        // Ajout notes via la méthode du User
        const r1 = userVoisin.submitReviewOnBehalfOf(occVoisin, occPere, 5, "Top voisin");
        const r2 = userVoisin.submitReviewOnBehalfOf(occVoisin, occPere, 3, "Moyen");

        // Simulation DB: on push dans le tableau de l'occupant
        occPere.receivedReviews.push(r1, r2);

        // Moyenne (5+3)/2 = 4.0
        expect(occPere.calculateIndividualScore()).toBe(4.0);

        // Score Foyer: (Père 4.0 + Fils 2.5) / 2 = 3.25
        expect(maisonDupont.calculateHouseholdScore()).toBe(3.25);
    });

    test('Règles d\'expulsion', () => {
        const badRev = new Review({
            id: 3, rating: 0, comment: "Nul", isAnonymous: false,
            submitterUserId: userVoisin.id, authorOccupantId: occVoisin.id, targetOccupantId: occPere.id
        });

        // On applique la note horrible à tout le monde
        occPere.receivedReviews = [badRev];
        occFils.receivedReviews = [badRev];

        expect(maisonDupont.calculateHouseholdScore()).toBe(0.0);
        expect(maisonDupont.checkComplianceStatus()).toBe("EXPULSION_WARNING");
    });

    test('Règles de bonus', () => {
        const goodRev = new Review({
            id: 4, rating: 5, comment: "Top", isAnonymous: false,
            submitterUserId: userVoisin.id, authorOccupantId: occVoisin.id, targetOccupantId: occPere.id
        });

        occPere.receivedReviews = [goodRev];
        occFils.receivedReviews = [goodRev];

        expect(maisonDupont.calculateHouseholdScore()).toBe(5.0);
        expect(maisonDupont.checkComplianceStatus()).toBe("BONUS_ELIGIBLE");
    });

    test('Accès Événement', () => {
        const evt = new Event({
            id: 50, title: "Gala", date: new Date(), 
            minScoreRequired: 4.0, residenceId: residence.id
        });

        // Score par défaut (2.5) -> Refus
        expect(evt.registerParticipant(occPere, maisonDupont)).toBe(false);

        // Boost score
        const goodRev = new Review({
            id: 5, rating: 5, comment: "Génial", isAnonymous: false,
            submitterUserId: userVoisin.id, authorOccupantId: occVoisin.id, targetOccupantId: occPere.id
        });
        occPere.receivedReviews = [goodRev];
        occFils.receivedReviews = [goodRev];

        // Acceptation
        expect(evt.registerParticipant(occPere, maisonDupont)).toBe(true);
        expect(evt.participants).toContain(occPere);
    });

    test('Permissions Admin', () => {
        // Mock (surcharge) temporaire de la fonction de status
        maisonDupont.checkComplianceStatus = () => "EXPULSION_WARNING";

        // Père (User simple) ne peut pas expulser
        expect(userPere.approveExpulsion(maisonDupont)).toBe(false);
        
        // Admin peut
        expect(userAdmin.approveExpulsion(maisonDupont)).toBe(true);
    });

    test('Signalement (Report)', () => {
        const report = userVoisin.submitReport(
            occFils.id,
            ReportReason.BRUIT,
            "Musique trop forte"
        );

        expect(report.reason).toBe(ReportReason.BRUIT);
        expect(report.authorUserId).toBe(userVoisin.id);
        expect(report.targetOccupantId).toBe(occFils.id);
    });

    test('Lien Référent Foyer', () => {
        expect(maisonDupont.referentUserId).toBe(userPere.id);
    });
});