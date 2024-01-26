import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewPost({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const post = {
            content,
            image_url: imageUrl,
        };
    
        const response = await fetch('http://127.0.0.1:5555/posts', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        });
    
        if (response.ok) {
            const newPost = await response.json();
            onPostCreated(newPost);
            setContent('');
            setImageUrl('');
            navigate('/feed'); // navigate to the feed after posting
        } else {
            console.error('Failed to create post');
        }
    };

    const handleClose = () => {
        navigate('/feed'); // navigate to the feed when the "Close" button is clicked
    };

    return (
        <div className="new-post-container">
            <form onSubmit={handleSubmit} className="new-post-form">
            <label>
                Content:
                <textarea className="new-post-input" value={content} onChange={e => setContent(e.target.value)} required />
            </label>
            <label>
                Image URL:
                <input type="url" className="new-post-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </label>
            <button type="submit" className="new-post-button">Create Post</button>
            <button type="button" onClick={handleClose} className="close-button">Close</button>
            </form>
        </div>
    );
}
    
export default NewPost;