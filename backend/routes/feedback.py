from flask import Blueprint, request, jsonify, send_file
from models import db, User, Feedback, FeedbackComment, FeedbackRequest
from sqlalchemy import or_
import logging
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import os
from datetime import datetime

feedback_bp = Blueprint('feedback', __name__)

def get_current_user_from_request():
    """Get current user from X-User-ID header (hardcoded auth)"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return None
    
    try:
        user_id = int(user_id)
        # Hardcoded user mapping
        if user_id == 1:
            return {"id": 1, "name": "John Manager", "email": "manager1@company.com", "role": "manager"}
        elif user_id == 2:
            return {"id": 2, "name": "Jane Employee", "email": "employee1@company.com", "role": "employee", "manager_id": 1}
        elif user_id == 3:
            return {"id": 3, "name": "Bob Employee", "email": "employee2@company.com", "role": "employee", "manager_id": 1}
        else:
            return None
    except (ValueError, TypeError):
        return None

def send_notification_email(to_email, subject, body):
    """
    Simulate sending email notification
    In production, this would integrate with SendGrid, AWS SES, or similar service
    """
    try:
        # Log the email that would be sent
        logging.info(f"📧 EMAIL NOTIFICATION:")
        logging.info(f"To: {to_email}")
        logging.info(f"Subject: {subject}")
        logging.info(f"Body: {body}")
        logging.info("---")
        
        # In production, you would use a real email service:
        # import sendgrid
        # from sendgrid.helpers.mail import Mail
        # 
        # sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        # message = Mail(
        #     from_email='noreply@company.com',
        #     to_emails=to_email,
        #     subject=subject,
        #     html_content=body
        # )
        # response = sg.send(message)
        
        return True
    except Exception as e:
        logging.error(f"Failed to send email notification: {str(e)}")
        return False

@feedback_bp.route('/', methods=['POST'])
def create_feedback():
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        if current_user['role'] != 'manager':
            return jsonify({'error': 'Only managers can create feedback'}), 403
        
        data = request.get_json()
        employee_id = data.get('employee_id')
        strengths = data.get('strengths')
        areas_to_improve = data.get('areas_to_improve')
        sentiment = data.get('sentiment')
        tags = data.get('tags', [])  # List of tags
        
        if not all([employee_id, strengths, areas_to_improve, sentiment]):
            return jsonify({'error': 'All fields are required'}), 400
        
        if sentiment not in ['positive', 'neutral', 'negative']:
            return jsonify({'error': 'Sentiment must be positive, neutral, or negative'}), 400
        
        # Check if employee exists and is under this manager
        employee = User.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        if employee.manager_id != current_user['id']:
            return jsonify({'error': 'You can only give feedback to your team members'}), 403
        
        # Convert tags list to comma-separated string
        # Handle both string tags and tag objects with 'name' property
        if tags:
            tag_names = []
            for tag in tags:
                if isinstance(tag, dict) and 'name' in tag:
                    tag_names.append(tag['name'])
                elif isinstance(tag, str):
                    tag_names.append(tag)
            tags_string = ','.join(tag_names)
        else:
            tags_string = ''
        
        feedback = Feedback(
            manager_id=current_user['id'],
            employee_id=employee_id,
            strengths=strengths,
            areas_to_improve=areas_to_improve,
            sentiment=sentiment,
            tags=tags_string
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({'feedback': feedback.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/', methods=['GET'])
def get_feedback():
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user['id']
        
        if current_user['role'] == 'manager':
            # Managers see feedback they've given to their team
            feedback_list = Feedback.query.filter_by(manager_id=user_id).all()
        else:
            # Employees see feedback they've received
            feedback_list = Feedback.query.filter_by(employee_id=user_id).all()
        
        return jsonify({
            'feedback': [feedback.to_dict() for feedback in feedback_list]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>', methods=['PUT'])
def update_feedback(feedback_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user['id']
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        # Only the manager who created the feedback can update it
        if current_user['role'] != 'manager' or feedback.manager_id != user_id:
            return jsonify({'error': 'You can only update your own feedback'}), 403
        
        data = request.get_json()
        
        if 'strengths' in data:
            feedback.strengths = data['strengths']
        if 'areas_to_improve' in data:
            feedback.areas_to_improve = data['areas_to_improve']
        if 'sentiment' in data:
            if data['sentiment'] not in ['positive', 'neutral', 'negative']:
                return jsonify({'error': 'Sentiment must be positive, neutral, or negative'}), 400
            feedback.sentiment = data['sentiment']
        if 'tags' in data:
            # Handle both string tags and tag objects with 'name' property
            tags = data['tags']
            if tags:
                tag_names = []
                for tag in tags:
                    if isinstance(tag, dict) and 'name' in tag:
                        tag_names.append(tag['name'])
                    elif isinstance(tag, str):
                        tag_names.append(tag)
                tags_string = ','.join(tag_names)
            else:
                tags_string = ''
            feedback.tags = tags_string
        
        db.session.commit()
        
        return jsonify({'feedback': feedback.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>/acknowledge', methods=['POST'])
def acknowledge_feedback(feedback_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user['id']
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        # Only the employee who received the feedback can acknowledge it
        if feedback.employee_id != user_id:
            return jsonify({'error': 'You can only acknowledge your own feedback'}), 403
        
        feedback.acknowledged = True
        db.session.commit()
        
        return jsonify({'feedback': feedback.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# NEW: Comment endpoints
@feedback_bp.route('/<int:feedback_id>/comments', methods=['GET'])
def get_feedback_comments(feedback_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        # Check if user has access to this feedback
        user_id = current_user['id']
        if not (feedback.manager_id == user_id or feedback.employee_id == user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get only top-level comments (parent_id is None) and their replies will be nested
        comments = FeedbackComment.query.filter_by(
            feedback_id=feedback_id, 
            parent_id=None
        ).order_by(FeedbackComment.created_at.asc()).all()
        
        return jsonify({
            'comments': [comment.to_dict(current_user_id=user_id) for comment in comments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>/comments', methods=['POST'])
def create_feedback_comment(feedback_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        # Check if user has access to this feedback
        user_id = current_user['id']
        if not (feedback.manager_id == user_id or feedback.employee_id == user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        comment_text = data.get('comment_text')
        parent_id = data.get('parent_id')  # Optional, for replies
        
        if not comment_text or not comment_text.strip():
            return jsonify({'error': 'Comment text is required'}), 400
        
        # If this is a reply, verify the parent comment exists and belongs to this feedback
        if parent_id:
            parent_comment = FeedbackComment.query.get(parent_id)
            if not parent_comment or parent_comment.feedback_id != feedback_id:
                return jsonify({'error': 'Parent comment not found'}), 404
        
        comment = FeedbackComment(
            feedback_id=feedback_id,
            user_id=user_id,
            comment_text=comment_text.strip(),
            parent_id=parent_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        # Send notification email to the other party (only for top-level comments)
        if not parent_id:
            try:
                # Get the other user's email (if manager comments, notify employee and vice versa)
                if user_id == feedback.manager_id:
                    # Manager commented, notify employee
                    employee_emails = {
                        2: "employee1@company.com",
                        3: "employee2@company.com"
                    }
                    recipient_email = employee_emails.get(feedback.employee_id)
                    recipient_name = {2: "Jane Employee", 3: "Bob Employee"}.get(feedback.employee_id)
                    
                    if recipient_email:
                        subject = f"New comment on your feedback from {current_user['name']}"
                        body = f"""
                        <h2>New Comment on Your Feedback</h2>
                        <p>Hi {recipient_name},</p>
                        <p>{current_user['name']} has added a comment to your feedback:</p>
                        <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
                            {comment_text}
                        </blockquote>
                        <p><a href="http://localhost:3000/feedback">View and respond to the comment</a></p>
                        <p>Best regards,<br>Your Feedback System</p>
                        """
                        send_notification_email(recipient_email, subject, body)
                else:
                    # Employee commented, notify manager
                    manager_email = "manager1@company.com"
                    manager_name = "John Manager"
                    
                    subject = f"New comment on feedback you gave to {current_user['name']}"
                    body = f"""
                    <h2>New Comment on Feedback</h2>
                    <p>Hi {manager_name},</p>
                    <p>{current_user['name']} has responded to the feedback you provided:</p>
                    <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #28a745;">
                        {comment_text}
                    </blockquote>
                    <p><a href="http://localhost:3000/feedback">View and respond to the comment</a></p>
                    <p>Best regards,<br>Your Feedback System</p>
                    """
                    send_notification_email(manager_email, subject, body)
                    
            except Exception as e:
                # Don't fail the comment creation if email fails
                logging.error(f"Failed to send notification email: {str(e)}")
        
        return jsonify({'comment': comment.to_dict(current_user_id=user_id)}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>/comments/<int:comment_id>', methods=['PUT'])
def update_feedback_comment(feedback_id, comment_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        comment = FeedbackComment.query.get(comment_id)
        if not comment or comment.feedback_id != feedback_id:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Only the comment author can edit it
        if comment.user_id != current_user['id']:
            return jsonify({'error': 'You can only edit your own comments'}), 403
        
        data = request.get_json()
        comment_text = data.get('comment_text')
        
        if not comment_text or not comment_text.strip():
            return jsonify({'error': 'Comment text is required'}), 400
        
        comment.comment_text = comment_text.strip()
        comment.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'comment': comment.to_dict(current_user_id=current_user['id'])}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_feedback_comment(feedback_id, comment_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        comment = FeedbackComment.query.get(comment_id)
        if not comment or comment.feedback_id != feedback_id:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Only the comment author can delete it
        if comment.user_id != current_user['id']:
            return jsonify({'error': 'You can only delete your own comments'}), 403
        
        # Delete the comment (and its replies due to cascade)
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>/comments/<int:comment_id>/like', methods=['POST'])
def toggle_comment_like(feedback_id, comment_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        comment = FeedbackComment.query.get(comment_id)
        if not comment or comment.feedback_id != feedback_id:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check if user has access to this feedback
        user_id = current_user['id']
        if not (feedback.manager_id == user_id or feedback.employee_id == user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if user already liked this comment
        liked_user_ids = []
        if comment.liked_by_users:
            liked_user_ids = [int(uid.strip()) for uid in comment.liked_by_users.split(',') if uid.strip()]
        
        if user_id in liked_user_ids:
            # Unlike the comment
            comment.remove_like(user_id)
            action = 'unliked'
        else:
            # Like the comment
            comment.add_like(user_id)
            action = 'liked'
        
        db.session.commit()
        
        return jsonify({
            'comment': comment.to_dict(current_user_id=user_id),
            'action': action
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user['id']
        
        if current_user['role'] == 'manager':
            # Manager dashboard: team overview
            team_members = User.query.filter_by(manager_id=user_id).all()
            team_feedback = Feedback.query.filter_by(manager_id=user_id).all()
            
            sentiment_counts = {
                'positive': len([f for f in team_feedback if f.sentiment == 'positive']),
                'neutral': len([f for f in team_feedback if f.sentiment == 'neutral']),
                'negative': len([f for f in team_feedback if f.sentiment == 'negative'])
            }
            
            dashboard_data = {
                'team_members_count': len(team_members),
                'total_feedback_given': len(team_feedback),
                'sentiment_distribution': sentiment_counts,
                'team_members': [member.to_dict() for member in team_members],
                'recent_feedback': [f.to_dict() for f in team_feedback[-5:]]
            }
        else:
            # Employee dashboard: personal feedback timeline
            personal_feedback = Feedback.query.filter_by(employee_id=user_id).all()
            acknowledged_count = len([f for f in personal_feedback if f.acknowledged])
            
            dashboard_data = {
                'total_feedback_received': len(personal_feedback),
                'acknowledged_feedback': acknowledged_count,
                'unacknowledged_feedback': len(personal_feedback) - acknowledged_count,
                'feedback_timeline': [f.to_dict() for f in personal_feedback]
            }
        
        return jsonify({'dashboard': dashboard_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>/export-pdf', methods=['GET'])
def export_feedback_pdf(feedback_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        # Check if user has access to this feedback
        user_id = current_user['id']
        if not (feedback.manager_id == user_id or feedback.employee_id == user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get comments for this feedback
        comments = FeedbackComment.query.filter_by(feedback_id=feedback_id).order_by(FeedbackComment.created_at.asc()).all()
        
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#1f2937')
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#374151')
        )
        
        # Title
        title = Paragraph("Feedback Report", title_style)
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        # Feedback details table
        feedback_data = [
            ['Manager:', feedback.manager.name],
            ['Employee:', feedback.employee.name],
            ['Date Created:', feedback.created_at.strftime('%B %d, %Y at %I:%M %p')],
            ['Sentiment:', feedback.sentiment.title()],
            ['Status:', 'Acknowledged' if feedback.acknowledged else 'Pending'],
        ]
        
        if feedback.tags:
            feedback_data.append(['Tags:', ', '.join(feedback.tags.split(','))])
        
        feedback_table = Table(feedback_data, colWidths=[1.5*inch, 4*inch])
        feedback_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(feedback_table)
        elements.append(Spacer(1, 20))
        
        # Strengths section
        strengths_heading = Paragraph("Strengths", heading_style)
        elements.append(strengths_heading)
        strengths_text = Paragraph(feedback.strengths, styles['Normal'])
        elements.append(strengths_text)
        elements.append(Spacer(1, 15))
        
        # Areas to improve section
        improve_heading = Paragraph("Areas to Improve", heading_style)
        elements.append(improve_heading)
        improve_text = Paragraph(feedback.areas_to_improve, styles['Normal'])
        elements.append(improve_text)
        elements.append(Spacer(1, 20))
        
        # Comments section
        if comments:
            comments_heading = Paragraph("Comments & Discussion", heading_style)
            elements.append(comments_heading)
            elements.append(Spacer(1, 10))
            
            for comment in comments:
                # Comment header
                comment_header = f"<b>{comment.to_dict()['user_name']}</b> ({comment.to_dict()['user_role']}) - {comment.created_at.strftime('%B %d, %Y at %I:%M %p')}"
                header_para = Paragraph(comment_header, styles['Normal'])
                elements.append(header_para)
                
                # Comment text
                comment_text = Paragraph(comment.comment_text, styles['Normal'])
                elements.append(comment_text)
                elements.append(Spacer(1, 10))
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        footer = Paragraph(footer_text, styles['Normal'])
        elements.append(footer)
        
        # Build PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer
        pdf_data = buffer.getvalue()
        buffer.close()
        
        # Create a new BytesIO object for sending
        pdf_buffer = BytesIO(pdf_data)
        
        # Generate filename
        filename = f"feedback_{feedback.employee.name.replace(' ', '_')}_{feedback.created_at.strftime('%Y%m%d')}.pdf"
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logging.error(f"Failed to generate PDF: {str(e)}")
        return jsonify({'error': 'Failed to generate PDF'}), 500

# NEW: Feedback Request endpoints
@feedback_bp.route('/requests', methods=['POST'])
def create_feedback_request():
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        if current_user['role'] != 'employee':
            return jsonify({'error': 'Only employees can request feedback'}), 403
        
        data = request.get_json()
        message = data.get('message', '')
        
        # Get manager ID for this employee
        manager_id = current_user.get('manager_id')
        if not manager_id:
            return jsonify({'error': 'No manager assigned'}), 400
        
        # Check if there's already a pending request
        existing_request = FeedbackRequest.query.filter_by(
            employee_id=current_user['id'],
            manager_id=manager_id,
            status='pending'
        ).first()
        
        if existing_request:
            return jsonify({'error': 'You already have a pending feedback request'}), 400
        
        feedback_request = FeedbackRequest(
            employee_id=current_user['id'],
            manager_id=manager_id,
            message=message.strip() if message else None
        )
        
        db.session.add(feedback_request)
        db.session.commit()
        
        # Send notification email to manager
        try:
            manager_email = "manager1@company.com"
            manager_name = "John Manager"
            
            subject = f"Feedback request from {current_user['name']}"
            body = f"""
            <h2>New Feedback Request</h2>
            <p>Hi {manager_name},</p>
            <p>{current_user['name']} has requested feedback from you.</p>
            {f'<p><strong>Message:</strong> {message}</p>' if message else ''}
            <p><a href="http://localhost:3000/feedback-requests">View and respond to the request</a></p>
            <p>Best regards,<br>Your Feedback System</p>
            """
            send_notification_email(manager_email, subject, body)
        except Exception as e:
            logging.error(f"Failed to send request notification email: {str(e)}")
        
        return jsonify({'request': feedback_request.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/requests', methods=['GET'])
def get_feedback_requests():
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user['id']
        
        if current_user['role'] == 'manager':
            # Managers see requests from their team members
            requests = FeedbackRequest.query.filter_by(manager_id=user_id).order_by(FeedbackRequest.created_at.desc()).all()
        else:
            # Employees see their own requests
            requests = FeedbackRequest.query.filter_by(employee_id=user_id).order_by(FeedbackRequest.created_at.desc()).all()
        
        return jsonify({
            'requests': [req.to_dict() for req in requests]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/requests/<int:request_id>', methods=['PUT'])
def update_feedback_request(request_id):
    try:
        current_user = get_current_user_from_request()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        feedback_request = FeedbackRequest.query.get(request_id)
        if not feedback_request:
            return jsonify({'error': 'Feedback request not found'}), 404
        
        # Only the manager can update the request status
        if current_user['role'] != 'manager' or feedback_request.manager_id != current_user['id']:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['completed', 'declined']:
            return jsonify({'error': 'Status must be completed or declined'}), 400
        
        feedback_request.status = status
        if status == 'completed':
            feedback_request.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        # Send notification email to employee
        try:
            employee_emails = {
                2: "employee1@company.com",
                3: "employee2@company.com"
            }
            employee_names = {
                2: "Jane Employee", 
                3: "Bob Employee"
            }
            
            recipient_email = employee_emails.get(feedback_request.employee_id)
            recipient_name = employee_names.get(feedback_request.employee_id)
            
            if recipient_email:
                if status == 'completed':
                    subject = f"Your feedback request has been completed"
                    body = f"""
                    <h2>Feedback Request Completed</h2>
                    <p>Hi {recipient_name},</p>
                    <p>Great news! {current_user['name']} has completed your feedback request.</p>
                    <p><a href="http://localhost:3000/feedback">View your new feedback</a></p>
                    <p>Best regards,<br>Your Feedback System</p>
                    """
                else:
                    subject = f"Your feedback request has been declined"
                    body = f"""
                    <h2>Feedback Request Declined</h2>
                    <p>Hi {recipient_name},</p>
                    <p>{current_user['name']} has declined your feedback request. You can try requesting again later or discuss this directly with your manager.</p>
                    <p>Best regards,<br>Your Feedback System</p>
                    """
                
                send_notification_email(recipient_email, subject, body)
        except Exception as e:
            logging.error(f"Failed to send status update notification email: {str(e)}")
        
        return jsonify({'request': feedback_request.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 