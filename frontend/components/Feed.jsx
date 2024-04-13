import React, { useEffect, useState } from 'react';
import Post from './Post';
import { useNavigate } from 'react-router-dom';

function Feed({ profile, fetchComments, comments, allComments, handlePostAndComments }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');

    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        fetchComments();
        document.body.style.overflow = 'auto';
    }, []);

    useEffect(() => {
        if (isLoading) {
            const timer = setInterval(() => {
                setLoadingMessage(prev => prev === 'Loading...' ? 'Loading..' : 'Loading...');
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isLoading]);

    const fetchPosts = async () => {
        setIsLoading(true);
        const response = await fetch('/api/posts');
        const data = await response.json();
        const sortedPosts = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);
        setIsLoading(false);
    };

    const travelNewPost = () => {
        navigate('/new-post');
    };

    return (
        <div>
            <div className='feed-background'></div>
            <div className='feed-container'>
                <h1 className='feed-header'>Main Feed</h1>
                <button className="floating-button" onClick={travelNewPost}>New Post</button>
                <div className='posts-container'>
                    {isLoading ? (
                        <h1 style={{marginTop: '50px', fontSize:'50px'}}>{loadingMessage}</h1>
                    ) : posts.length === 0 ? (
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