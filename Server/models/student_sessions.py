# Server/models/student_sessions.py
from . import db

class StudentSession(db.Model):
    __tablename__ = 'student_sessions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, nullable=True)
    date = db.Column(db.Date, nullable=True)
    session_id = db.Column(db.Integer, nullable=True)
    domain = db.Column(db.String(255), nullable=True)
    task = db.Column(db.String(255), nullable=True)
    subtask = db.Column(db.String(255), nullable=True)
    trialresult = db.Column(db.String(10), nullable=True)
    score = db.Column(db.Integer, nullable=True)
    noofP = db.Column(db.Integer, nullable=True)
    noof_negative = db.Column(db.Integer, nullable=True)
    noof_positive = db.Column(db.Integer, nullable=True)
    noofOT = db.Column(db.Integer, nullable=True)
    noofUndo = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.BigInteger, nullable=True)
    light = db.Column(db.Float, nullable=True)
    co2 = db.Column(db.Float, nullable=True)
    RH = db.Column(db.Float, nullable=True)
    ambienttemp = db.Column(db.Float, nullable=True)
    bvp = db.Column(db.Float, nullable=True)
    gsr = db.Column(db.Float, nullable=True)
    wristtemp = db.Column(db.Float, nullable=True)
    ibi = db.Column(db.Float, nullable=True)
    acceleration_x = db.Column(db.Float, nullable=True)
    acceleration_y = db.Column(db.Float, nullable=True)
    acceleration_z = db.Column(db.Float, nullable=True)
    acceleration = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f'<StudentSession {self.id}, Student {self.student_id}, Date {self.date}>'