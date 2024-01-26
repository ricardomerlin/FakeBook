// src/components/Feed.jsx
import React, { useEffect, useState } from 'react';
import Post from './Post';
import { useNavigate } from 'react-router-dom';

function Feed() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
        const response = await fetch('http://127.0.0.1:5555/posts');
        const data = await response.json();
        const sortedPosts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
        };
        fetchPosts();
    }, []);

    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/new-post');
    };

    return (
        <div>
            <button className="floating-button" onClick={handleButtonClick}>New Post</button>
            {posts.map(post => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
}

export default Feed;