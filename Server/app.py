# Server/app.py
from flask import Flask, send_from_directory
from models import db
from routes.history_route import history_bp

app = Flask(__name__)
app.config.from_object('instance.config.Config')

with app.app_context():
    db.init_app(app)
    db.create_all()
    
print(f"DATABASE CONNECTED")

app.register_blueprint(history_bp)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)