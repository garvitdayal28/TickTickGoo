import os
from flask import Flask, jsonify
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
    app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'fallback-secret-key-for-development')
    
    # Session configuration for cross-origin requests
    app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Allow cross-origin
    app.config['REMEMBER_COOKIE_SECURE'] = True
    app.config['REMEMBER_COOKIE_HTTPONLY'] = True
    app.config['REMEMBER_COOKIE_SAMESITE'] = 'None'

    # --- Initialize Extensions ---
    # Configure CORS with frontend origin
    frontend_origin = os.environ.get('FRONTEND_ORIGIN', 'http://localhost:5173')
    cors.init_app(app, 
                  supports_credentials=True, 
                  origins=[frontend_origin, "https://*.vercel.app", "http://localhost:5173"],
                  methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                  allow_headers=['Content-Type', 'Authorization'])
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # --- Firebase Initialization ---
    # Check if we're in production (Render) or development
    if os.environ.get('FIREBASE_PRIVATE_KEY'):
        # Production: Use environment variables
        firebase_config = {
            "type": "service_account",
            "project_id": os.environ.get('FIREBASE_PROJECT_ID'),
            "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.environ.get('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.environ.get('FIREBASE_CLIENT_EMAIL', '').replace('@', '%40')}",
            "universe_domain": "googleapis.com"
        }
        cred = credentials.Certificate(firebase_config)
    else:
        # Development: Use JSON file
        cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccount.json')
        cred = credentials.Certificate(cred_path)
    
    firebase_admin.initialize_app(cred)
    db = firestore.client() # Now db is our firestore client

    # --- Import and Register Blueprints ---
    from .routes.auth import auth_bp
    from .routes.task import tasks_bp # Assuming you have a tasks blueprint

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api')

    # Add a simple health check route
    @app.route('/api/health')
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is running!"}), 200

    @app.route('/')
    def home():
        return jsonify({"message": "Tick Tick Goo Backend API", "status": "running"}), 200

    return app