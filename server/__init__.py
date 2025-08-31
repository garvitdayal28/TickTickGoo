import os
from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize extensions
cors = CORS()
bcrypt = Bcrypt()
login_manager = LoginManager()
db = None

def create_app():
    """Application Factory Function"""
    global db

    app = Flask(__name__)

    # --- App Configuration ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key-for-development')

    # --- Initialize Extensions ---
    cors.init_app(app, supports_credentials=True) # Allows cookies to be sent from React
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # --- Firebase Initialization ---
    # Make sure 'serviceAccount.json' is in the 'server' directory
    cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccount.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client() # Now db is our firestore client

    # --- Import and Register Blueprints ---
    from .routes.auth import auth_bp
    from .routes.task import tasks_bp # Assuming you have a tasks blueprint

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api')

    return app