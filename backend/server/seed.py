
from datetime import datetime
from random import randint, choice as rc
from app import app
from models import db, Profile, Post, Comment, Like
from faker import Faker

fake = Faker()

print(fake.name())

def create_profiles():
    profiles = []
    for _ in range(10):  # Adjust the number of profiles as needed
        p = Profile(
            name=fake.name(),
            username=fake.user_name(),
            email=fake.email(),
            password='stupid',
            birthday=fake.date_of_birth(minimum_age=18, maximum_age=90),
            profile_picture='https://wallpapers.com/images/hd/funny-dog-picture-vznfz9yqlvhukg0f.jpg',
            description=fake.text(max_nb_chars=400)
        )
        profiles.append(p)
    return profiles

def create_posts(profiles):
    posts = []
    for _ in range(40):  # Adjust the number of posts as needed
        p = Post(
            content=fake.text(max_nb_chars=500),
            image_url=fake.image_url(),
            profile=rc(profiles)
        )
        posts.append(p)
    return posts

def create_comments(posts, profiles):
    comments = []
    for _ in range(40):  # Adjust the number of comments as needed
        c = Comment(
            content=fake.text(max_nb_chars=300),
            profile=rc(profiles),
            post=rc(posts)
        )
        comments.append(c)
    return comments

def create_likes(posts, profiles):
    likes = []
    for _ in range(10):  # Adjust the number of likes as needed
        l = Like(
            profile=rc(profiles),
            post=rc(posts)
        )
        likes.append(l)
    return likes

if __name__ == '__main__':
    with app.app_context():
        print('Clearing database...')
        Like.query.delete()
        Comment.query.delete()
        Post.query.delete()
        Profile.query.delete()

        print('Seeding profiles...')
        profiles = create_profiles()
        db.session.add_all(profiles)
        db.session.commit()

        print('Seeding posts...')
        posts = create_posts(profiles)
        db.session.add_all(posts)
        db.session.commit()

        print('Seeding comments...')
        comments = create_comments(posts, profiles)
        db.session.add_all(comments)
        db.session.commit()

        print('Seeding likes...')
        likes = create_likes(posts, profiles)
        db.session.add_all(likes)
        db.session.commit()

        print('Seeding complete')