from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from enum import Enum

# --- Énumérations pour la gestion des statuts ---

class Role(Enum):
    RESIDENT = "resident"
    ADMIN = "admin"

class ReportReason(Enum):
    BRUIT = "bruit"
    DEGRADATION = "degradation"
    INCIVILITE = "incivilite"
    AUTRE = "autre"

# --- Classes de Base (Entities) ---

@dataclass
class UserRef:
    """
    Représente l'utilisateur, peut etre admin ou non
    """
    id: int
    firstname: str
    lastname: str
    email: str
    is_admin: bool
    
    # Relations
    managed_residences: List['Residence'] = field(default_factory=list)
    managed_house: List['House'] = field(default_factory=list)
    authored_reviews: List['Review'] = field(default_factory=list)

@dataclass
class Residence:
    """
    Représente une résidence fermée (table residences).
    """
    id: int
    name: str
    address: str
    city: str
    created_at: datetime
    manager_id: int  # Clé étrangère vers celui qui "Gère"

    # Relations
    houses: List['House'] = field(default_factory=list)
    events: List['Event'] = field(default_factory=list)

@dataclass
class House:
    """
    Représente un foyer/maison
    """
    id: int
    address: str
    created_at: datetime
    residence_id: int
    creator_id: int # UserRef qui "Crée"

    # Relations
    occupants: List['Occupant'] = field(default_factory=list)
    reviews_context: List['Review'] = field(default_factory=list) # Reviews liées à la maison (Contexte)


@dataclass
class Occupant:
    """
    Un habitant de la maison
    """
    id: int
    firstname: str
    lastname: str
    age: int
    house_id: int

    # Relations
    received_reviews: List['Review'] = field(default_factory=list) # Relation "Associe"

@dataclass
class Review:
    """
    Une notation.
    """
    id: int
    rating: int # Entre 0 et 5
    comment: str
    created_at: datetime
    is_anonymous: bool
    author_id: int # UserRef (auteur)
    
    # Cibles (Une review peut cibler un occupant ET/OU avoir une maison pour contexte)
    target_occupant_id: Optional[int] = None # Relation avec l'occupant éventuellement mentionné
    context_house_id: Optional[int] = None   # Relation avec la maison concernée

@dataclass
class Report:
    """
    Pour le système de signalement (Report).
    """
    id: int
    author_id: int # Peut être null si totalement anonyme coté db, mais author_id préférable
    target_occupant_id: int
    reason: ReportReason
    description: str
    created_at: datetime
    is_processed: bool = False

@dataclass
class Event:
    """
    Gestion des évenements et condition d'accès
    """
    id: int
    title: str
    date: datetime
    min_score_required: float # Condition d'accès
    residence_id: int
