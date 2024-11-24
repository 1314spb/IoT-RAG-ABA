# Server/routes/history_route.py
from flask import Blueprint, jsonify, request
from models.student_sessions import StudentSession
from models import db

history_bp = Blueprint('history', __name__)

def student_session_to_dict(session):
    return {
        'id': session.id,
        'student_id': session.student_id,
        'date': session.date.isoformat() if session.date else None,
        'session_id': session.session_id,
        'domain': session.domain,
        'task': session.task,
        'subtask': session.subtask,
        'trialresult': session.trialresult,
        'score': session.score,
        'noofP': session.noofP,
        'noof_negative': session.noof_negative,
        'noof_positive': session.noof_positive,
        'noofOT': session.noofOT,
        'noofUndo': session.noofUndo,
        'timestamp': session.timestamp,
        'light': session.light,
        'co2': session.co2,
        'RH': session.RH,
        'ambienttemp': session.ambienttemp,
        'bvp': session.bvp,
        'gsr': session.gsr,
        'wristtemp': session.wristtemp,
        'ibi': session.ibi,
        'acceleration_x': session.acceleration_x,
        'acceleration_y': session.acceleration_y,
        'acceleration_z': session.acceleration_z,
        'acceleration': session.acceleration,
    }

@history_bp.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    print("get_student: ", student_id)
    sessions = StudentSession.query.filter_by(student_id=student_id).all()
    
    if not sessions:
        return jsonify({
            'message': f'No sessions found for student_id {student_id}'
        }), 404
        
    sessions_data = [student_session_to_dict(session) for session in sessions]
    return jsonify({
        'student_id': student_id,
        'sessions': sessions_data
    }), 200