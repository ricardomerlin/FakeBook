from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, Profile, Post, Comment, Like, Conversation, Message, Friendship
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from datetime import datetime
from base64 import b64encode

import os

load_dotenv()

app = Flask(__name__, static_folder='uploaded_images')
app.secret_key = os.getenv('CLIENT_SECRET')
CORS(app, origins=['http://localhost:5173'], supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

db.init_app(app)

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.get('/')
def home():
    print(os.getenv('CLIENT_SECRET'))
    return 'Hello, World!'

@app.get('/api/check_session')
def check_session():
    print('CHECKING SESSION')
    print('This is the userId:',session.get('user_id'))
    profile = db.session.get(Profile, session.get('user_id'))
    print(f'check session {session.get("user_id")}')
    if profile:
        return profile.to_dict(rules=['-password']), 200
    else:
        return {"message": "No user logged in"}, 401

@app.get('/api/profiles')
def get_profiles():
    profiles = Profile.query.all()
    return jsonify([p.to_dict(rules = ['-likes', '-posts', '-comments']) for p in profiles])

@app.get('/api/profiles/<int:id>')
def get_profile_by_id(id):
    profile = db.session.get(Profile, id)
    if not profile:
        return {'Error': 'Profile not found.'}
    profile_dict = profile.to_dict(rules = ['-likes', '-posts', '-comments'])
    return profile_dict, 202

@app.get('/api/posts')
def get_posts():
    posts = Post.query.all()
    return ([p.to_dict(rules = ['-likes', '-comments', '-profile']) for p in posts])

@app.get('/api/posts/<int:id>')
def get_post_by_id(id):
    post = db.session.get(Post, id)
    if not post:
        return {'Error': 'Post not found.'}
    return post.to_dict(rules = ['-likes', '-comments', '-profile']), 202

@app.get('/api/uploaded_images/<filename>')
def uploaded_images(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.get('/api/comments')
def get_comments():
    comments = Comment.query.all()
    return ([c.to_dict(rules = ['-profile', '-post']) for c in comments])

@app.get('/api/likes')
def get_likes():
    likes = Like.query.all()
    return ([l.to_dict(rules = ['-post', '-profile']) for l in likes])

@app.get('/api/conversations')
def get_conversations():
    conversations = Conversation.query.all()
    return jsonify([c.to_dict(rules = ['-messages']) for c in conversations])

@app.get('/api/messages')
def get_messages():
    messages = Message.query.all()
    return jsonify([m.to_dict() for m in messages])

@app.get('/api/friends')
def get_friends():
    friendships = Friendship.query.all()
    return jsonify([f.to_dict(rules = ['-profile', '-friend']) for f in friendships])

@app.post('/api/profiles')
def create_profile():
    try:
        birthday = datetime.strptime(request.form.get('birthday'), '%Y-%m-%d').date()

        profile_picture = request.files.get('profile_picture')

        profile_picture_data = None
        if profile_picture is not None:
            profile_picture_data = b64encode(profile_picture.read()).decode('utf-8')

        print('about to create profile')
        new_profile = Profile(
            name=request.form.get('name'),
            email=request.form.get('email'),
            username=request.form.get('username'),
            password=bcrypt.generate_password_hash(request.form.get('password')),
            birthday=birthday,
            profile_picture=profile_picture_data,
            description=request.form.get('description')
        )
        print('new_profile:', new_profile)
        db.session.add(new_profile)
        db.session.commit()
        return jsonify(new_profile.to_dict(rules = ['-likes.profile', '-posts.profile', '-comments.profile'])), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.post('/api/likes')
def create_like():
    try:
        data = request.get_json()
        new_like = Like(
            profile_id=data.get('profile_id'),
            post_id=data.get('post_id'),
            created_at=data.get('created_at', datetime.utcnow())
        )
        db.session.add(new_like)
        db.session.commit()
        return jsonify(new_like.to_dict(rules=['-profile.likes', '-post.likes'])), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.post('/api/posts')
def create_post():
    try:
        content = request.form.get('content')
        profile_id = request.form.get('profile_id')
        
        profile = Profile.query.get(profile_id)
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404

        image = request.files.get('image')
        if not image:
            return jsonify({'error': 'No image uploaded'}), 400

        if allowed_file(image.filename):
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        new_post = Post(
            content=content,
            sticker=filename,
            profile_id=profile_id,
            name=profile.name,
            profile_picture=profile.profile_picture
        )
        db.session.add(new_post)
        db.session.commit()
        
        return jsonify({
            'id': new_post.id,
            'content': new_post.content,
            'sticker': new_post.sticker,
            'profile_id': new_post.profile_id,
            'name': new_post.name,
            'profile_picture': new_post.profile_picture,
            'created_at': new_post.created_at
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.post('/api/comments')
def create_comment():
    try:
        data = request.get_json()
        new_comment = Comment(
            content=data.get('content'),
            profile_id=data.get('profile_id'),
            post_id=data.get('post_id'),
            name=data.get('name'),
            profile_picture=data.get('profile_picture')
        )
        db.session.add(new_comment)
        db.session.commit()
        return jsonify(new_comment.to_dict(rules = ['-profile.comments', '-post.comments']))
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.post('/api/conversations')
def create_conversation():
    try:
        data = request.get_json()
        new_conversation = Conversation(
            user1_id=data.get('user1_id'),
            user2_id=data.get('user2_id')
        )
        db.session.add(new_conversation)
        db.session.commit()
        return jsonify(new_conversation.to_dict(rules = ['-messages'])), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.post('/api/messages')
def create_message():
    try:
        data = request.get_json()
        new_message = Message(
            content=data.get('content'),
            conversation_id=data.get('conversation_id'),
            sender_id=data.get('sender_id')
        )
        db.session.add(new_message)
        db.session.commit()
        return jsonify(new_message.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.post('/api/friends')
def create_friendship():
    try:
        data = request.get_json()
        new_friendship = Friendship(
            sender_name=data.get('sender_name'),
            recipient_name=data.get('recipient_name'),
            self_id=data.get('self_id'),
            recipient_id=data.get('recipient_id')
        )
        db.session.add(new_friendship)
        db.session.commit()
        return jsonify(new_friendship.to_dict(rules = ['-profile.friends', '-friend.friends'])), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.patch('/api/friends/<int:id>')
def accept_friendship(id):
    try:
        friendship = Friendship.query.get(id)
        if not friendship:
            return jsonify({'error': 'Friendship not found'}), 404
        friendship.accepted = True
        db.session.commit()
        return jsonify(friendship.to_dict(rules = ['-profile.friends', '-friend.friends'])), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.delete('/api/posts/<int:id>')
def delete_post(id):
    try:
        post = Post.query.get(id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        db.session.delete(post)
        db.session.commit()
        return jsonify({'message': 'Post deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.delete('/api/likes/<int:id>')
def delete_like(id):
    try:
        like = Like.query.get(id)
        if not like:
            return jsonify({'error': 'Like not found'}), 404
        db.session.delete(like)
        db.session.commit()
        return jsonify({'message': 'Like deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.delete('/api/comments/<int:id>')
def delete_comment(id):
    try:
        comment = Comment.query.get(id)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comment deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.delete('/api/friends/<int:self_id>/<int:recipient_id>')
def delete_friendship_after_send(self_id, recipient_id):
    try:
        friendship = Friendship.query.filter_by(self_id=self_id, recipient_id=recipient_id).first()
        if not friendship:
            return jsonify({'error': 'Friendship not found'}), 404
        db.session.delete(friendship)
        db.session.commit()
        return jsonify({'message': 'Friendship deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.delete('/api/friends/<int:id>')
def refuse_friendship(id):
    try:
        friendship = Friendship.query.get(id)
        if not friendship:
            return jsonify({'error': 'Friendship not found'}), 404
        db.session.delete(friendship)
        db.session.commit()
        return jsonify({'message': 'Friendship deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400



@app.post('/api/login')
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = Profile.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        print('user.password:', user.password)
        print(password)
        print('login succesful')
        return jsonify({'message': 'Login successful', 'id': user.id}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401


@app.post('/api/logout')
def post_logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(port=5555, debug=True)