import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewPost({ onPostCreated, profile }) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append('name', profile.name)
        formData.append('content', content);
        formData.append('image', image);
        formData.append('profile_id', profile.id);
        formData.append('profile_picture', profile.profile_picture);
    
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
            });        
            if (response.ok) {
                const newPost = await response.json();
                onPostCreated(newPost);
                setContent('');
                setImage(null);
                handleClose();
            } else {
                console.error('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };
    

    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
    };

    const handleClose = () => {
        navigate('/feed');
    };

    return (
        <div className="new-post-container">
            <form onSubmit={handleSubmit} className="new-post-form" encType="multipart/form-data">
                <label>
                    Content:
                    <textarea className="new-post-input" value={content} onChange={e => setContent(e.target.value)} required />
                </label>
                <label>
                    Image:
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                <button type="submit" className="new-post-button">Create Post</button>
                <button type="button" onClick={handleClose} className="close-button">Close</button>
            </form>
        </div>
    );
}
    
export default NewPost;
