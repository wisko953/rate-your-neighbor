from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum

class Role(Enum):
    RESIDENT = "resident"
    ADMIN = "admin"

class ReportReason(Enum):
    BRUIT = "bruit"
    DEGRADATION = "degradation"
    INCIVILITE = "incivilite"
    AUTRE = "autre"

@dataclass
class Review:
    id: int
    rating: int
    comment: str
    created_at: datetime
    is_anonymous: bool
    author_id: int
    target_user_id: Optional[int] = None  # Renommé pour cibler un User
    context_house_id: Optional[int] = None

    def __post_init__(self):
        if not (0 <= self.rating <= 5):
            raise ValueError("Rating must be between 0 and 5")

    def validate_rating(self) -> bool:
        return 0 <= self.rating <= 5

    def anonymize_display(self) -> Dict[str, Any]:
        return {
            "rating": self.rating,
            "comment": self.comment,
            "date": self.created_at,
            "target_id": self.target_user_id
        }

@dataclass
class User:
    """
    Classe unifiée représentant un utilisateur, peut être un simple résident, un référent de foyer, ou un admin
    """
    id: int
    firstname: str
    lastname: str
    email: str
    age: int
    
    # Rôles et Statuts
    is_admin: bool = False
    is_ref: bool = False  # Le "Référent" du foyer
    
    # Localisation
    house_id: Optional[int] = None
    
    # Relations
    managed_residences: List['Residence'] = field(default_factory=list)
    authored_reviews: List['Review'] = field(default_factory=list)
    received_reviews: List['Review'] = field(default_factory=list) # Ex-Occupant data

    def calculate_individual_score(self) -> float:
        if not self.received_reviews:
            return 2.5
        total = sum(r.rating for r in self.received_reviews)
        return round(total / len(self.received_reviews), 2)

    def submit_report(self, target_id: int, reason: ReportReason, description: str) -> 'Report':
        return Report(
            id=0,
            author_id=self.id,
            target_occupant_id=target_id,
            reason=reason,
            description=description,
            created_at=datetime.now()
        )

    def approve_expulsion(self, house: 'House') -> bool:
        if not self.is_admin:
            return False
        return house.check_compliance_status() == "EXPULSION_WARNING"

    def configure_bonus_malus(self, rules: Dict[str, float]) -> bool:
        if not self.is_admin:
            return False
        return True

    def has_voted_this_week(self) -> bool:
        one_week_ago = datetime.now() - timedelta(days=7)
        recent_reviews = [r for r in self.authored_reviews if r.created_at >= one_week_ago]
        return len(recent_reviews) > 0

@dataclass
class House:
    id: int
    address: str
    created_at: datetime
    residence_id: int
    # creator_id réfère maintenant à un User (admin ou ref)
    creator_id: int 
    
    # Liste des habitants (User) au lieu d'Occupants
    residents: List['User'] = field(default_factory=list)
    reviews_context: List['Review'] = field(default_factory=list)

    def calculate_household_score(self) -> float:
        if not self.residents:
            return 2.5
        
        total_score = 0.0
        count = 0
        for resident in self.residents:
            # On appelle la méthode sur le User maintenant
            score = resident.calculate_individual_score()
            total_score += score
            count += 1
            
        return round(total_score / count, 2) if count > 0 else 2.5

    def check_compliance_status(self) -> str:
        score = self.calculate_household_score()
        if score < 0.5:
            return "EXPULSION_WARNING"
        elif score > 4.5:
            return "BONUS_ELIGIBLE"
        return "NORMAL"

    def get_monthly_history(self, month: int, year: int) -> List[float]:
        relevant_reviews = []
        for resident in self.residents:
            for review in resident.received_reviews:
                if review.created_at.month == month and review.created_at.year == year:
                    relevant_reviews.append(review.rating)
        return relevant_reviews

    def get_referent(self) -> Optional[User]:
        """
        Renvoie le référent du foyer actuel
        """
        for resident in self.residents:
            if resident.is_ref:
                return resident
        return None
    
    def add_residents(self, *args) -> None:
        """
        Ajoute un ou plusieurs résidents au foyer
        """
        for resident in args:
            if resident not in self.residents:
                self.residents.append(resident)
                resident.house_id = self.id


@dataclass
class Report:
    id: int
    author_id: int
    target_occupant_id: int # On garde l'ID (qui réfère maintenant à un User)
    reason: ReportReason
    description: str
    created_at: datetime
    is_processed: bool = False

@dataclass
class Residence:
    id: int
    name: str
    address: str
    city: str
    created_at: datetime
    manager_id: int
    houses: List['House'] = field(default_factory=list)
    events: List['Event'] = field(default_factory=list)

    def generate_leaderboard(self, top_n: int = 10) -> List[House]:
        return sorted(
            self.houses, 
            key=lambda h: h.calculate_household_score(), 
            reverse=True
        )[:top_n]

    def broadcast_news(self, message: str) -> str:
        return f"ANNOUNCEMENT to {self.name}: {message}"

@dataclass
class Event:
    id: int
    title: str
    date: datetime
    min_score_required: float
    residence_id: int
    participants: List[User] = field(default_factory=list) # Liste de Users maintenant

    def is_house_eligible(self, house: House) -> bool:
        return house.calculate_household_score() >= self.min_score_required

    def register_participant(self, user: User, house: House) -> bool:
        if self.is_house_eligible(house):
            self.participants.append(user)
            return True
        return False