from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from server import bcrypt, db, login_manager # Import from our __init__.py

# Create the Blueprint
auth_bp = Blueprint('auth', __name__)

# Firestore collection reference
users_ref = db.collection('users')

# --- User Model & Loader for Flask-Login ---
class User(UserMixin):
    def __init__(self, user_id, email, name=None):
        self.id = user_id
        self.email = email
        self.name = name

    @staticmethod
    def get(user_id):
        user_doc = users_ref.document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return User(
                user_id=user_doc.id, 
                email=user_data.get('email'),
                name=user_data.get('name')
            )
        return None

@login_manager.user_loader
def load_user(user_id):
    """Loads the user for the session."""
    return User.get(user_id)


# --- API Routes ---
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    query = users_ref.where('email', '==', email).limit(1).stream()
    if len(list(query)) > 0:
        return jsonify({"error": "User with this email already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user_data = {"name": name, "email": email, "password": hashed_password}
    
    # Add user to Firestore and get the document reference
    doc_ref = users_ref.add(user_data)
    user_id = doc_ref[1].id  # Get the document ID
    
    # Create user object and log them in
    user = User(user_id=user_id, email=email, name=name)
    login_user(user)  # Creates the session cookie
    
    return jsonify({
        "message": "User registered successfully", 
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    query = users_ref.where('email', '==', email).limit(1).stream()
    user_list = list(query)

    if len(user_list) == 0:
        return jsonify({"error": "Invalid credentials"}), 401

    user_doc = user_list[0]
    user_data = user_doc.to_dict()

    if bcrypt.check_password_hash(user_data['password'], password):
        user = User(user_id=user_doc.id, email=user_data['email'], name=user_data.get('name'))
        login_user(user) # Creates the session cookie
        return jsonify({"message": "Login successful", "user": {"id": user.id, "email": user.email, "name": user.name}}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/profile")
@login_required
def profile():
    # current_user is automatically available because of the @login_required decorator
    return jsonify({
        "message": f"Welcome {current_user.name or current_user.email}!",
        "user": {"id": current_user.id, "email": current_user.email, "name": current_user.name}
    }), 200