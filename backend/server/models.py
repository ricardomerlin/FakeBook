from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from datetime import datetime
from sqlalchemy import MetaData, ForeignKey
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})


db = SQLAlchemy()

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

    serialize_rules = ['-posts.profile', '-comments.profile', '-likes.profile']

    def __repr__(self):
        return f'<Profile {self.id}>'
    


class Post(db.Model, SerializerMixin):
    __tablename__ = 'post_table'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    profile_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'))
    profile = db.relationship('Profile', back_populates='posts')

    comments = db.relationship('Comment', back_populates='post', cascade='all, delete-orphan')
    likes = db.relationship('Like', back_populates='post', cascade='all, delete-orphan')

    serialize_rules = ['-profile.posts', '-comments.post', '-likes.post']

    def __repr__(self):
        return f'<Post {self.id}>'


class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comment_table'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'))
    profile = db.relationship('Profile', back_populates='comments')

    post_id = db.Column(db.Integer, db.ForeignKey('post_table.id'))
    post = db.relationship('Post', back_populates='comments')

    serialize_rules = ['-profile.comments', '-post.comments']

    def __repr__(self):
        return f'<Comment {self.id}>'


class Like(db.Model, SerializerMixin):
    __tablename__ = 'like_table'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile_id = db.Column(db.Integer, db.ForeignKey('profile_table.id'))
    profile = db.relationship('Profile', back_populates='likes')

    post_id = db.Column(db.Integer, db.ForeignKey('post_table.id'))
    post = db.relationship('Post', back_populates='likes')

    serialize_rules = ['-profile.likes', '-post.likes']

    def __repr__(self):
        return f'<Like {self.id}>'