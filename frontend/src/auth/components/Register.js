import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Register.css';


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData.email, formData.password);
      setSuccess(response.message + ' Redirection en cours...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <h1 className="register-title">Créer un compte</h1>
                    <p className="register-subtitle">Rejoignez Rate Your Neighbor</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre.email@exemple.com"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Mot de passe</label>
                        <input
                            className="form-input"
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 caractères"
                            disabled={loading}
                            required
                            minLength="8"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <input
                            className="form-input"
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Ressaisissez votre mot de passe"
                            disabled={loading}
                            required
                            minLength="8"
                        />
                    </div>

                    {error && <p className="alert alert-error">{error}</p>}
                    {success && <p className="alert alert-success">{success}</p>}

                    <button className="register-button" type="submit" disabled={loading}>
                        {loading ? 'Inscription en cours...' : "S'inscrire"}
                    </button>
                </form>

                <p className="register-footer">
                    Vous avez déjà un compte ?{' '}
                    <Link className="register-link" to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};



export default Register;
