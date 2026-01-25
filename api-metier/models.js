// models.js
const ReportReason = {
    BRUIT: "bruit",
    DEGRADATION: "degradation",
    INCIVILITE: "incivilite",
    AUTRE: "autre"
};

class Review {
    constructor({ id, rating, comment, createdAt, isAnonymous, submitterUserId, authorOccupantId, targetOccupantId, contextHouseId }) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt || new Date();
        this.isAnonymous = isAnonymous;
        this.submitterUserId = submitterUserId;
        this.authorOccupantId = authorOccupantId;
        this.targetOccupantId = targetOccupantId;
        this.contextHouseId = contextHouseId;

        this.validateRating();
    }

    validateRating() {
        if (this.rating < 0 || this.rating > 5) {
            throw new Error("Rating must be between 0 and 5");
        }
        return true;
    }
}

class Occupant {
    constructor({ id, firstname, lastname, age, houseId }) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.age = age;
        this.houseId = houseId;
        this.receivedReviews = []; // Liste des avis reçus
    }

    calculateIndividualScore() {
        if (this.receivedReviews.length === 0) {
            return 2.5;
        }
        const total = this.receivedReviews.reduce((sum, review) => sum + review.rating, 0);
        // Arrondi à 2 décimales
        return Number((total / this.receivedReviews.length).toFixed(2));
    }
}

class User {
    constructor({ id, email, isAdmin = false, isRef = false }) {
        this.id = id;
        this.email = email;
        this.isAdmin = isAdmin;
        this.managedHouseId = null;
    }

    submitReviewOnBehalfOf(occupantAuthor, targetOccupant, rating, comment) {
        // Le user (référent) crée l'avis technique
        return new Review({
            id: Math.floor(Math.random() * 10000), // ID temporaire
            rating: rating,
            comment: comment,
            createdAt: new Date(),
            isAnonymous: false,
            submitterUserId: this.id,
            authorOccupantId: occupantAuthor.id,
            targetOccupantId: targetOccupant.id,
            contextHouseId: targetOccupant.houseId
        });
    }

    submitReport(targetOccupantId, reason, description) {
        return new Report({
            id: Math.floor(Math.random() * 10000),
            authorUserId: this.id,
            targetOccupantId: targetOccupantId,
            reason: reason,
            description: description,
            createdAt: new Date()
        });
    }

    approveExpulsion(house) {
        if (!this.isAdmin) return false;
        return house.checkComplianceStatus() === "EXPULSION_WARNING";
    }
}

class House {
    constructor({ id, address, createdAt, residenceId, referentUserId }) {
        this.id = id;
        this.address = address;
        this.createdAt = createdAt || new Date();
        this.residenceId = residenceId;
        this.referentUserId = referentUserId;
        this.occupants = [];
    }

    addOccupant(occupant) {
        // Vérifie si l'occupant est déjà là (comparaison par ID)
        if (!this.occupants.find(o => o.id === occupant.id)) {
            this.occupants.push(occupant);
            occupant.houseId = this.id;
        }
    }

    calculateHouseholdScore() {
        if (this.occupants.length === 0) return 2.5;

        let totalScore = 0.0;
        this.occupants.forEach(occ => {
            totalScore += occ.calculateIndividualScore();
        });

        return Number((totalScore / this.occupants.length).toFixed(2));
    }

    checkComplianceStatus() {
        const score = this.calculateHouseholdScore();
        if (score < 0.5) return "EXPULSION_WARNING";
        if (score > 4.5) return "BONUS_ELIGIBLE";
        return "NORMAL";
    }

    getReferent(usersList) {
        // Dans une vraie DB, on ferait une requête. Ici on simule une recherche.
        return usersList.find(u => u.id === this.referentUserId);
    }
}

class Report {
    constructor({ id, authorUserId, targetOccupantId, reason, description, createdAt }) {
        this.id = id;
        this.authorUserId = authorUserId;
        this.targetOccupantId = targetOccupantId;
        this.reason = reason;
        this.description = description;
        this.createdAt = createdAt || new Date();
        this.isProcessed = false;
    }
}

class Residence {
    constructor({ id, name, address, city, createdAt, managerId }) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.city = city;
        this.createdAt = createdAt || new Date();
        this.managerId = managerId;
        this.houses = [];
    }

    generateLeaderboard(topN = 10) {
        return this.houses
            .sort((a, b) => b.calculateHouseholdScore() - a.calculateHouseholdScore())
            .slice(0, topN);
    }
}

class Event {
    constructor({ id, title, date, minScoreRequired, residenceId }) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.minScoreRequired = minScoreRequired;
        this.residenceId = residenceId;
        this.participants = []; // Liste d'Occupants
    }

    registerParticipant(occupant, house) {
        // Vérifie l'éligibilité de la maison de l'occupant
        if (house.calculateHouseholdScore() >= this.minScoreRequired) {
            this.participants.push(occupant);
            return true;
        }
        return false;
    }
}

module.exports = {
    User, Occupant, House, Residence, Review, Report, Event, ReportReason
};