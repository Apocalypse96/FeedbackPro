from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db, User, Feedback
import logging

# Import route blueprints
from routes.auth import auth_bp
from routes.feedback import feedback_bp
from routes.users import users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Set up logging
    logging.basicConfig(level=app.config.get('LOG_LEVEL', 'INFO'))
    logger = logging.getLogger(__name__)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    # Create tables and sample data with error handling
    with app.app_context():
        try:
            logger.info("Attempting to create database tables...")
            db.create_all()
            create_sample_data()
            logger.info("Database initialization completed successfully!")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            # Don't fail the entire app startup - let it run without DB for now
            pass
    
    @app.route('/')
    def health_check():
        try:
            # Test database connection
            db.session.execute(db.text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            db_status = f"disconnected: {str(e)}"
        
        return jsonify({
            "message": "Feedback System API is running!",
            "status": "healthy",
            "database": db_status
        })
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

def create_sample_data():
    """Create sample users and feedback data matching hardcoded authentication"""
    
    try:
        # Clear existing data
        db.session.query(Feedback).delete()
        db.session.query(User).delete()
        
        # Create hardcoded users to match frontend authentication
        users_data = [
            {
                "id": 1,
                "name": "John Manager",
                "email": "manager1@company.com",
                "role": "manager",
                "manager_id": None
            },
            {
                "id": 2,
                "name": "Jane Employee",
                "email": "employee1@company.com",
                "role": "employee",
                "manager_id": 1
            },
            {
                "id": 3,
                "name": "Bob Employee", 
                "email": "employee2@company.com",
                "role": "employee",
                "manager_id": 1
            }
        ]
        
        for user_data in users_data:
            existing_user = User.query.filter_by(email=user_data["email"]).first()
            if not existing_user:
                user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    role=user_data["role"],
                    manager_id=user_data["manager_id"]
                )
                db.session.add(user)
        
        # Create sample feedback
        feedback_data = [
            {
                "manager_id": 1,
                "employee_id": 2,
                "strengths": "Excellent problem-solving skills and great team collaboration. Shows initiative in taking on challenging tasks.",
                "areas_to_improve": "Could improve time management and deadline adherence. Consider using project management tools.",
                "sentiment": "positive",
                "acknowledged": False
            },
            {
                "manager_id": 1,
                "employee_id": 3,
                "strengths": "Strong technical skills and attention to detail. Very reliable and consistent performer.",
                "areas_to_improve": "Would benefit from more proactive communication with team members and stakeholders.",
                "sentiment": "positive", 
                "acknowledged": True
            },
            {
                "manager_id": 1,
                "employee_id": 2,
                "strengths": "Great improvement in communication skills over the past quarter. Very responsive to feedback.",
                "areas_to_improve": "Continue working on presentation skills for client meetings.",
                "sentiment": "positive",
                "acknowledged": False
            }
        ]
        
        for feedback_item in feedback_data:
            feedback = Feedback(
                manager_id=feedback_item["manager_id"],
                employee_id=feedback_item["employee_id"],
                strengths=feedback_item["strengths"],
                areas_to_improve=feedback_item["areas_to_improve"],
                sentiment=feedback_item["sentiment"],
                acknowledged=feedback_item["acknowledged"]
            )
            db.session.add(feedback)
        
        db.session.commit()
        print("Sample data created successfully!")
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {e}")
        raise  # Re-raise for logging purposes

if __name__ == '__main__':
    app = create_app()
    port = app.config.get('PORT', 5000)
    debug = app.config.get('DEBUG', False)
    app.run(debug=debug, host='0.0.0.0', port=port) 