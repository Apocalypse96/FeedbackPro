from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Made nullable for hardcoded auth
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'manager' or 'employee'
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    team_members = db.relationship('User', backref=db.backref('manager', remote_side=[id]))
    given_feedback = db.relationship('Feedback', foreign_keys='Feedback.manager_id', backref='manager')
    received_feedback = db.relationship('Feedback', foreign_keys='Feedback.employee_id', backref='employee')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'manager_id': self.manager_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    strengths = db.Column(db.Text, nullable=False)
    areas_to_improve = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), nullable=False)  # 'positive', 'neutral', 'negative'
    acknowledged = db.Column(db.Boolean, default=False)
    tags = db.Column(db.String(200), nullable=True)  # Comma-separated tags
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship for comments
    comments = db.relationship('FeedbackComment', backref='feedback', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'manager_id': self.manager_id,
            'employee_id': self.employee_id,
            'manager_name': self.manager.name,
            'employee_name': self.employee.name,
            'strengths': self.strengths,
            'areas_to_improve': self.areas_to_improve,
            'sentiment': self.sentiment,
            'acknowledged': self.acknowledged,
            'tags': self.tags.split(',') if self.tags else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'comments_count': len(self.comments) if self.comments else 0
        }

class FeedbackComment(db.Model):
    __tablename__ = 'feedback_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)  # Use hardcoded user IDs
    comment_text = db.Column(db.Text, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('feedback_comments.id'), nullable=True)  # For replies
    likes = db.Column(db.Integer, default=0)
    liked_by_users = db.Column(db.Text, nullable=True)  # Comma-separated user IDs who liked this comment
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship for replies
    replies = db.relationship('FeedbackComment', backref=db.backref('parent', remote_side=[id]), lazy=True)
    
    def to_dict(self, current_user_id=None):
        # Map hardcoded user IDs to names
        user_names = {
            1: "John Manager",
            2: "Jane Employee", 
            3: "Bob Employee"
        }
        user_roles = {
            1: "manager",
            2: "employee",
            3: "employee"
        }
        
        # Check if current user liked this comment
        liked_by_user = False
        if current_user_id and self.liked_by_users:
            liked_user_ids = [int(uid.strip()) for uid in self.liked_by_users.split(',') if uid.strip()]
            liked_by_user = current_user_id in liked_user_ids
        
        return {
            'id': self.id,
            'feedback_id': self.feedback_id,
            'user_id': self.user_id,
            'user_name': user_names.get(self.user_id, 'Unknown User'),
            'user_role': user_roles.get(self.user_id, 'unknown'),
            'comment_text': self.comment_text,
            'parent_id': self.parent_id,
            'likes': self.likes,
            'liked_by_user': liked_by_user,
            'replies': [reply.to_dict(current_user_id) for reply in self.replies] if self.replies else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def add_like(self, user_id):
        """Add a like from a user"""
        if not self.liked_by_users:
            self.liked_by_users = str(user_id)
        else:
            liked_user_ids = [int(uid.strip()) for uid in self.liked_by_users.split(',') if uid.strip()]
            if user_id not in liked_user_ids:
                liked_user_ids.append(user_id)
                self.liked_by_users = ','.join(map(str, liked_user_ids))
        self.likes = len([uid for uid in self.liked_by_users.split(',') if uid.strip()])
    
    def remove_like(self, user_id):
        """Remove a like from a user"""
        if self.liked_by_users:
            liked_user_ids = [int(uid.strip()) for uid in self.liked_by_users.split(',') if uid.strip()]
            if user_id in liked_user_ids:
                liked_user_ids.remove(user_id)
                self.liked_by_users = ','.join(map(str, liked_user_ids)) if liked_user_ids else None
        self.likes = len([uid for uid in self.liked_by_users.split(',') if uid.strip()]) if self.liked_by_users else 0

class FeedbackRequest(db.Model):
    __tablename__ = 'feedback_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, nullable=False)  # Use hardcoded user IDs
    manager_id = db.Column(db.Integer, nullable=False)   # Use hardcoded user IDs
    message = db.Column(db.Text, nullable=True)          # Optional message from employee
    status = db.Column(db.String(20), default='pending') # 'pending', 'completed', 'declined'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        # Map hardcoded user IDs to names
        user_names = {
            1: "John Manager",
            2: "Jane Employee", 
            3: "Bob Employee"
        }
        
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'manager_id': self.manager_id,
            'employee_name': user_names.get(self.employee_id, 'Unknown Employee'),
            'manager_name': user_names.get(self.manager_id, 'Unknown Manager'),
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        } 