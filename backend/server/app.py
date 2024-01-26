from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, Profile, Post, Comment, Like
from flask_cors import CORS
from flask import make_response
from werkzeug.security import check_password_hash
from datetime import datetime


app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app, db)

db.init_app(app)

@app.get('/')
def index():
    response = make_response('Welcome')
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    return response

@app.get('/profiles')
def get_profiles():
    profiles = Profile.query.all()
    return jsonify([p.to_dict(rules = ['-likes', '-posts', '-comments']) for p in profiles])

@app.get('/profiles/<int:id>')
def get_profile_by_id(id):
    profile = db.session.get(Profile, id)
    if not profile:
        return {'Error': 'Profile not found.'}
    profile_dict = profile.to_dict(rules = ['-likes', '-posts', '-comments'])
    # publisher = db.session.get(Publisher, id).filter_by(author_id = id).all()
    return profile_dict, 202

@app.get('/posts')
def get_posts():
    posts = Post.query.all()
    return ([p.to_dict(rules = ['-likes', '-comments', '-profile']) for p in posts])

@app.get('/comments')
def get_comments():
    comments = Comment.query.all()
    return ([c.to_dict(rules = ['-profile', '-post']) for c in comments])

@app.get('/likes')
def get_likes():
    likes = Like.query.all()
    return ([l.to_dict(rules = ['-post', '-profile']) for l in likes])

@app.post('/profiles')
def create_profile():
    data = request.get_json()
    new_profile = Profile(
        username=data.get('username'),
        password=data.get('password'),
        birthday=data.get('birthday'),
        profile_picture=data.get('profile_picture'),
        description=data.get('description')
    )
    db.session.add(new_profile)
    db.session.commit()
    return jsonify(new_profile.to_dict(rules = ['-likes', '-posts', '-comments']))

@app.post('/likes')
def create_like():
    data = request.get_json()
    new_like = Like(
        profile_id=data.get('profile_id'),
        post_id=data.get('post_id'),
        created_at=data.get('created_at', datetime.utcnow())
    )
    db.session.add(new_like)
    db.session.commit()
    return jsonify(new_like.to_dict(rules = ['-profile.likes', '-post.likes']))

@app.post('/posts')
def create_post():
    data = request.get_json()
    new_post = Post(
        content=data.get('content'),
        image_url=data.get('image_url'),
        profile_id=data.get('profile_id')
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict(rules = ['-likes', '-comments']))


@app.post('/comments')
def create_comment():
    data = request.get_json()
    new_comment = Comment(
        content=data.get('content'),
        profile_id=data.get('profile_id'),
        post_id=data.get('post_id')
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(new_comment.to_dict(rules = ['-profile.comments', '-post.comments']))


@app.post('/login')
def post_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = Profile.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({'message': 'Login successful'}), 200

    # Here you would typically create a new session or token for the user
    # and return it in the response. The specifics of how to do this depend
    # on what authentication system you're using.

    return jsonify({'message': 'Logged in successfully'})

if __name__ == '__main__':
    app.run(port=5555, debug=True)