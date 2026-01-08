import unittest
from datetime import datetime, timedelta
from models import (
    User, Residence, House, Review, 
    Event, Report, Role, ReportReason
)

class TestRateYourNeighbourUpdated(unittest.TestCase):
    
    def setUp(self):
        print("\n" + "="*60)
        print(f"▶ DÉMARRAGE DU TEST : {self._testMethodName}")
        print("-" * 60)
        
        # 1. Création des utilisateurs 
        self.admin = User(id=1, firstname="Admin", lastname="Principal", email="admin@ryn.com", age=40, is_admin=True)
        
        # Voisin (User externe à la maison testée)
        self.voisin = User(id=2, firstname="Paul", lastname="Martin", email="paul@ryn.com", age=35)
        
        # Famille Dupont
        # Jean est le référent (is_ref=True)
        self.user_pere = User(id=10, firstname="Jean", lastname="Dupont", email="jean@ryn.com", age=45, is_ref=True)
        # Kevin est un simple résident
        self.user_fils = User(id=11, firstname="Kevin", lastname="Dupont", email="kevin@ryn.com", age=19, is_ref=False)
        
        # 2. Création de la structure (Résidence / Maison)
        self.residence = Residence(id=1, name="Les Lilas", address="10 Rue Paix", city="Paris", created_at=datetime.now(), manager_id=self.admin.id)
        
        # Maison créée par le père (Référent)
        self.maison_dupont = House(id=101, address="Villa 4", created_at=datetime.now(), residence_id=self.residence.id, creator_id=self.user_pere.id)
        
        # 3. Association des résidents à la maison
        self.maison_dupont.add_residents(self.user_pere, self.user_fils)
        
        # Ajout maison à la résidence
        self.residence.houses.append(self.maison_dupont)
        
        print(f"[DEBUG] Setup complet : Maison {self.maison_dupont.address} contient {len(self.maison_dupont.residents)} résidents (Jean & Kevin).")

    def test_notation_validation(self):
        print("[DEBUG] -- Test de validation des notes --")
        # Test valeur hors borne
        with self.assertRaises(ValueError):
            Review(id=1, rating=6, comment="Bad", created_at=datetime.now(), is_anonymous=False, author_id=self.admin.id)
        
        # Test valeur valide
        rev = Review(id=1, rating=4, comment="Ok", created_at=datetime.now(), is_anonymous=False, author_id=self.admin.id)
        self.assertTrue(rev.validate_rating())
        print("[DEBUG] -> Validation des bornes OK.")

    def test_calcul_scores(self):
        print("[DEBUG] -- Test des calculs de scores (User & House) --")
        
        # Note initiale (2.5 par défaut)
        self.assertEqual(self.user_pere.calculate_individual_score(), 2.5)
        
        # Ajout notes pour le père (target_user_id)
        r1 = Review(1, 5, "Top", datetime.now(), False, self.voisin.id, target_user_id=self.user_pere.id)
        r2 = Review(2, 3, "Bof", datetime.now(), False, self.voisin.id, target_user_id=self.user_pere.id)
        self.user_pere.received_reviews.extend([r1, r2])
        
        # Moyenne père : (5+3)/2 = 4.0
        self.assertEqual(self.user_pere.calculate_individual_score(), 4.0)
        
        # Score Foyer (Père 4.0 + Fils 2.5) / 2 = 3.25
        self.assertEqual(self.maison_dupont.calculate_household_score(), 3.25)
        print(f"[DEBUG] -> Score Foyer calculé : {self.maison_dupont.calculate_household_score()} (Attendu 3.25)")

    def test_regles_expulsion(self):
        print("[DEBUG] -- Test des règles d'expulsion --")
        # Notes 0 pour tout le monde
        bad_rev = Review(3, 0, "Nul", datetime.now(), False, self.voisin.id)
        self.user_pere.received_reviews = [bad_rev]
        self.user_fils.received_reviews = [bad_rev]
        
        self.assertEqual(self.maison_dupont.calculate_household_score(), 0.0)
        self.assertEqual(self.maison_dupont.check_compliance_status(), "EXPULSION_WARNING")
        print("[DEBUG] -> Statut EXPULSION détecté.")

    def test_regles_bonus(self):
        print("[DEBUG] -- Test des règles de bonus --")
        # Notes 5 pour tout le monde
        good_rev = Review(4, 5, "Super", datetime.now(), False, self.voisin.id)
        self.user_pere.received_reviews = [good_rev]
        self.user_fils.received_reviews = [good_rev]
        
        self.assertEqual(self.maison_dupont.calculate_household_score(), 5.0)
        self.assertEqual(self.maison_dupont.check_compliance_status(), "BONUS_ELIGIBLE")
        print("[DEBUG] -> Statut BONUS détecté.")

    def test_acces_evenement(self):
        print("[DEBUG] -- Test Participation Événement --")
        evt = Event(id=50, title="Gala", date=datetime.now(), min_score_required=4.0, residence_id=self.residence.id)
        
        # Actuellement score par défaut (2.5) -> Refus
        self.assertFalse(evt.register_participant(self.user_pere, self.maison_dupont))
        
        # On booste les notes -> 5.0
        good_rev = Review(5, 5, "Génial", datetime.now(), False, self.voisin.id)
        self.user_pere.received_reviews = [good_rev]
        self.user_fils.received_reviews = [good_rev]
        
        # Acceptation
        self.assertTrue(evt.register_participant(self.user_pere, self.maison_dupont))
        self.assertIn(self.user_pere, evt.participants)
        print("[DEBUG] -> Inscription validée après amélioration du score.")

    def test_admin_permissions(self):
        print("[DEBUG] -- Test Permissions Admin --")
        self.maison_dupont.check_compliance_status = lambda: "EXPULSION_WARNING"
        
        # Le père (non admin) ne peut pas expulser
        self.assertFalse(self.user_pere.approve_expulsion(self.maison_dupont))
        # L'admin peut
        self.assertTrue(self.admin.approve_expulsion(self.maison_dupont))
        print("[DEBUG] -> Permissions vérifiées.")

    def test_signalement_report(self):
        print("[DEBUG] -- Test Création Signalement (Report) --")
        # Le voisin signale le fils pour bruit
        report = self.voisin.submit_report(
            target_id=self.user_fils.id,
            reason=ReportReason.BRUIT,
            description="Musique trop forte à 2h du matin"
        )
        
        self.assertIsInstance(report, Report)
        self.assertEqual(report.reason, ReportReason.BRUIT)
        self.assertEqual(report.author_id, self.voisin.id)
        self.assertEqual(report.target_occupant_id, self.user_fils.id)
        print(f"[DEBUG] -> Signalement créé : {report.reason} contre {self.user_fils.firstname}")

    def test_residence_leaderboard(self):
        print("[DEBUG] -- Test Residence Leaderboard --")
        # On crée une 2ème maison pour comparer
        maison_voisin = House(id=102, address="Villa 5", created_at=datetime.now(), residence_id=self.residence.id, creator_id=self.voisin.id)
        maison_voisin.residents = [self.voisin]
        self.residence.houses.append(maison_voisin)
        
        # Notes : Dupont=5.0 (défini précédemment), Voisin=2.5
        # On force les notes pour le test
        self.user_pere.received_reviews = [Review(1, 5, "", datetime.now(), False, 1)]
        self.user_fils.received_reviews = [Review(2, 5, "", datetime.now(), False, 1)]
        self.voisin.received_reviews = [] # Score 2.5
        
        leaderboard = self.residence.generate_leaderboard()
        self.assertEqual(leaderboard[0], self.maison_dupont) # Premier : Dupont (5.0)
        self.assertEqual(leaderboard[1], maison_voisin)      # Deuxième : Voisin (2.5)
        print(f"[DEBUG] -> Leaderboard ordre : {[h.address for h in leaderboard]}")

    def test_referent_foyer(self):
        print("[DEBUG] -- Test Récupération Référent --")
        ref = self.maison_dupont.get_referent()
        self.assertEqual(ref, self.user_pere)
        self.assertTrue(ref.is_ref)
        print(f"[DEBUG] -> Référent identifié : {ref.firstname}")

if __name__ == '__main__':
    unittest.main()