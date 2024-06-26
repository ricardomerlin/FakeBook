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

@app.get('/')
def home():
    print(os.getenv('CLIENT_SECRET'))
    return 'Hello, World!'

@app.get('/api/check_session')
def check_session():
    profile = db.session.get(Profile, session.get('user_id'))
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
    try:
        profile = db.session.get(Profile, id)
        if not profile:
            return {'Error': 'Profile not found.'}
        profile_dict = profile.to_dict(rules = ['-likes', '-posts', '-comments'])
        return profile_dict, 202
    except Exception as e:
        return jsonify({'error': str(e)}), 400

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

@app.get('/api/conversations/<int:id>/last_message')
def get_last_message_of_conversation(id):
    try:
        conversation = Conversation.query.get(id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        last_message = Message.query.filter_by(conversation_id=id).order_by(Message.created_at.desc()).first()
        if not last_message:
            return jsonify({'message': 'No messages found for this conversation'}), 404
        return jsonify({
            'conversation_id': id,
            'last_message': last_message.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


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

        profile_picture_data = b64encode(profile_picture.read()).decode('utf-8')

        new_profile = Profile(
            name=request.form.get('name'),
            email=request.form.get('email'),
            username=request.form.get('username'),
            password=bcrypt.generate_password_hash(request.form.get('password')),
            birthday=birthday,
            profile_picture=profile_picture_data,
            description=request.form.get('description')
        )
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
        profile_id = request.form.get('profile_id')

        profile = Profile.query.get(profile_id)

        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        image = request.files.get('image')

        if not image:
            return jsonify({'error': 'No image uploaded'}), 400
        
        image_data = b64encode(image.read()).decode('utf-8')
        
        new_post = Post(
            content=request.form.get('content'),
            image=image_data,
            profile_id=profile_id,
            name=profile.name,
            profile_picture=profile.profile_picture
        )
        db.session.add(new_post)
        db.session.commit()
        
        return jsonify({
            'id': new_post.id,
            'content': new_post.content,
            'image': new_post.image,
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
        existing_conversation = Conversation.query.filter_by(
            sender_id=data.get('user1_id'),
            other_user_id=data.get('user2_id')
        ).first()
        if existing_conversation:
            print('Conversation already exists')
            return jsonify({'error': 'A conversation already exists between these two users'}), 400
        new_conversation = Conversation(
            sender_id=data.get('user1_id'),
            other_user_id=data.get('user2_id'),
            sender_name=data.get('user1_name'),
            other_user_name=data.get('user2_name'),
            sender_profile_picture=data.get('user1_profile_picture'),
            other_user_profile_picture=data.get('user2_profile_picture')
        )
        db.session.add(new_conversation)
        db.session.commit()
        return jsonify(new_conversation.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.post('/api/messages')
def create_message():
    try:
        data = request.get_json()
        new_message = Message(
            content=data.get('content'),
            conversation_id=data.get('conversation_id'),
            sender_id=data.get('sender_id'),
            receiver_id=data.get('receiver_id')
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
        existing_friendship = Friendship.query.filter_by(
            sender_id=data.get('sender_id'),
            receiver_id=data.get('receiver_id')
        ).first()
        if existing_friendship:
            return jsonify({'error': 'A friendship already exists between these two users'}), 400
        new_friendship = Friendship(
            sender_name=data.get('sender_name'),
            receiver_name=data.get('receiver_name'),
            sender_id=data.get('sender_id'),
            receiver_id=data.get('receiver_id'),
            sender_profile_picture=data.get('sender_profile_picture'),
            receiver_profile_picture=data.get('receiver_profile_picture')
        )
        print(new_friendship)
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

@app.delete('/api/friends/<int:sender_id>/<int:receiver_id>')
def delete_friendship_after_send(sender_id, receiver_id):
    try:
        friendship = Friendship.query.filter_by(sender_id=sender_id, receiver_id=receiver_id).first()
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
        return jsonify({'message': 'Login successful', 'id': user.id}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401


@app.post('/api/logout')
def post_logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(port=5555, debug=True)