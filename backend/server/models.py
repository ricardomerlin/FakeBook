from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from datetime import datetime
from sqlalchemy import MetaData, ForeignKey
from sqlalchemy_serializer import SerializerMixin
from werkzeug.utils import secure_filename

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy()


class Friendship(db.Model, SerializerMixin):
    __tablename__ = 'friendship_table'

    id = db.Column(db.Integer, primary_key=True)
    added_at = db.Column(db.DateTime, default=datetime.now)
    accepted = db.Column(db.Boolean, default=False)
    sender_name = db.Column(db.String(100), nullable=False)
    recipient_name = db.Column(db.String(100), nullable=False)

    self_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'), nullable=False)

    self_profile_picture = db.Column(db.String(500), nullable=True)
    recipient_profile_picture = db.Column(db.String(500), nullable=True)

    sender = db.relationship('Profile', foreign_keys=[self_id], backref='friends')
    recipient = db.relationship('Profile', foreign_keys=[recipient_id], backref='friend_of')

    serialize_rules = ('-sender', '-recipient')
    
    def __repr__(self):
        return f'<Friendship {self.id}>'

class Conversation(db.Model, SerializerMixin):
    __tablename__ = 'conversation_table'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    self_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'), nullable=False)
    other_user_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'), nullable=False)

    self_name = db.Column(db.String(100), nullable=False)
    other_user_name = db.Column(db.String(100), nullable=False)

    self_profile_picture = db.Column(db.String(500), nullable=True)
    other_user_profile_picture = db.Column(db.String(500), nullable=True)

    user1 = db.relationship('Profile', foreign_keys=[self_id], backref='user1_conversations')
    user2 = db.relationship('Profile', foreign_keys=[other_user_id], backref='user2_conversations')

    messages = db.relationship('Message', back_populates='conversation', cascade='all, delete-orphan')

    serialize_rules = ('-messages', '-user1', '-user2')

    def __repr__(self):
        return f'<Conversation {self.id}>'

class Message(db.Model, SerializerMixin):
    __tablename__ = 'message_table'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    sender_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'), nullable=False)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation_table.id'), nullable=False)

    sender = db.relationship('Profile', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('Profile', foreign_keys=[receiver_id], backref='received_messages')
    conversation = db.relationship('Conversation', back_populates='messages')

    serialize_rules = ('-sender', '-receiver', '-conversation')

    def __repr__(self):
        return f'<Message {self.id}>'

class Profile(db.Model, SerializerMixin):
    __tablename__ = 'profile_table'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    birthday = db.Column(db.Date, nullable=True)
    profile_picture = db.Column(db.String(500), nullable=True)
    description = db.Column(db.String(400))

    posts = db.relationship('Post', back_populates='profile', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='profile', cascade='all, delete-orphan')
    likes = db.relationship('Like', back_populates='profile', cascade='all, delete-orphan')

    serialize_rules = ('-posts', '-comments', '-likes', '-sent_messages', '-received_messages', '-friends', '-friend_of')

    def __repr__(self):
        return f'<Profile {self.id}>'

class Post(db.Model, SerializerMixin):
    __tablename__ = 'post_table'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    image = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    name = db.Column(db.String(100), nullable=False)
    profile_picture = db.Column(db.String(500), nullable=True)

    profile_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'))
    profile = db.relationship('Profile', back_populates='posts')

    comments = db.relationship('Comment', back_populates='post', cascade='all, delete-orphan')
    likes = db.relationship('Like', back_populates='post', cascade='all, delete-orphan')

    serialize_rules = ('-profile', '-comments', '-likes')

    def __repr__(self):
        return f'<Post {self.id}>'

class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comment_table'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    name = db.Column(db.String(100), nullable=False)
    profile_picture = db.Column(db.String(500), nullable=True)

    profile_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'))
    profile = db.relationship('Profile', back_populates='comments')

    post_id = db.Column(db.Integer, db.ForeignKey('post_table.id'))
    post = db.relationship('Post', back_populates='comments')

    serialize_rules = ('-profile', '-post')

    def __repr__(self):
        return f'<Comment {self.id}>'

class Like(db.Model, SerializerMixin):
    __tablename__ = 'like_table'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    profile_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'))
    profile = db.relationship('Profile', back_populates='likes')

    post_id = db.Column(db.Integer, db.ForeignKey('post_table.id'))
    post = db.relationship('Post', back_populates='likes')

    serialize_rules = ('-profile', '-post')

    def __repr__(self):
        return f'<Like {self.id}>'