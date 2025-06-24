import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database Configuration - Handle Railway/Render database URLs
    DATABASE_URL = os.environ.get('DATABASE_URL') or os.environ.get('RAILWAY_PRIVATE_DOMAIN_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://')
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'sqlite:///feedback.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS Configuration - Allow Vercel domain
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,https://*.vercel.app').split(',')
    
    # Flask Configuration
    FLASK_ENV = os.environ.get('FLASK_ENV', 'production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # Port configuration for cloud deployments
    PORT = int(os.environ.get('PORT', 5000))

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///feedback.db'
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    DEBUG = False
    # Force HTTPS in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
    WTF_CSRF_ENABLED = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig  # Default to production for cloud deployments
} 