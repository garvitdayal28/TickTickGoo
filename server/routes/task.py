from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from firebase_admin import firestore
from server import db

# Create the Blueprint
tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route("/tasks", methods=["GET"])
@login_required
def get_tasks():
    """Get all tasks for the current user"""
    try:
        tasks_ref = db.collection('users').document(current_user.id).collection('tasks')
        tasks = []
        for doc in tasks_ref.stream():
            task_data = doc.to_dict()
            task_data['id'] = doc.id
            tasks.append(task_data)
        return jsonify({"tasks": tasks}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route("/tasks", methods=["POST"])
@login_required
def create_task():
    """Create a new task for the current user"""
    try:
        data = request.get_json()
        title = data.get('title')
        
        if not title:
            return jsonify({"error": "Title is required"}), 400
            
        task_data = {
            "title": title,
            "status": "pending",
            "completed": False,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        task_ref = db.collection('users').document(current_user.id).collection('tasks').document()
        task_ref.set(task_data)
        
        return jsonify({"message": "Task created successfully", "id": task_ref.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@tasks_bp.route("/tasks/<task_id>", methods=["PUT"])
@login_required
def update_task(task_id):
    """Update a task for the current user"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({"error": "Status is required"}), 400
            
        if status not in ['pending', 'ongoing', 'completed']:
            return jsonify({"error": "Invalid status"}), 400
        
        task_ref = db.collection('users').document(current_user.id).collection('tasks').document(task_id)
        
        # Check if task exists
        task_doc = task_ref.get()
        if not task_doc.exists:
            return jsonify({"error": "Task not found"}), 404
        
        # Update the task
        update_data = {
            "status": status,
            "completed": status == "completed",
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        if status == "completed":
            update_data["completed_at"] = firestore.SERVER_TIMESTAMP
        
        task_ref.update(update_data)
        
        return jsonify({"message": "Task updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route("/tasks/<task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    """Delete a task for the current user"""
    try:
        task_ref = db.collection('users').document(current_user.id).collection('tasks').document(task_id)
        
        # Check if task exists
        task_doc = task_ref.get()
        if not task_doc.exists:
            return jsonify({"error": "Task not found"}), 404
        
        task_ref.delete()
        
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500