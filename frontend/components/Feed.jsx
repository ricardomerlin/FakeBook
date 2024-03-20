// src/components/Feed.jsx
import React, { useEffect, useState } from 'react';
import Post from './Post';
import { useNavigate } from 'react-router-dom';

function Feed({ profile, fetchComments, comments, allComments, handlePostAndComments }) {
    const [posts, setPosts] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        // fetchComments();
    }, []);

    const fetchPosts = async () => {
        const response = await fetch('/api/posts');
        const data = await response.json();
        const sortedPosts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
    };

    const travelNewPost = () => {
        navigate('/new-post');
    };

    return (
        <div>
            <div className='feed-background'></div>
            <div className='feed-container'>
                <header className='feed-header'>
                    <h1>Welcome to the Feed!</h1>
                </header>
                <button className="floating-button" onClick={travelNewPost}>New Post</button>
                <div className='posts-container'>
                    {posts.length === 0 ? (
                        <div className="empty-feed">
                            <h2>Be the first to post some of your favorite images!</h2>
                            <p>Share your thoughts, ideas, and moments with the world.</p>
                            <img className='dog-image' src='https://static8.depositphotos.com/1252474/957/i/450/depositphotos_9578561-stock-photo-dog-on-black-background.jpg' alt="raccoon in sunglasses" />
                            <p>Hit the 'New Post' button whenever you are ready!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <Post key={post.id} profile={profile} post={post} allComments={allComments} fetchPosts={fetchPosts} handlePostAndComments={handlePostAndComments}/>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Feed;