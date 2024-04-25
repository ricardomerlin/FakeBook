import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewPost({ profile, fetchAllPosts }) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [remainingChars, setRemainingChars] = useState(100);
    
    const navigate = useNavigate();

    const handleContentChange = (e) => {
        if (e.target.value.length <= 100) {
            setContent(e.target.value);
            setRemainingChars(100 - e.target.value.length);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append('name', profile.name)
        formData.append('content', content);
        formData.append('image', image);
        formData.append('profile_id', profile.id);
        formData.append('profile_picture', profile.profile_picture);

        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,
        });        
        if (response.ok) {
            const newPost = await response.json();
            setContent('');
            setImage(null);
            fetchAllPosts();
            handleClose();
        } else {
            console.error('Failed to create post');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleClose = () => {
        navigate('/feed');
    };

    return (
        <div className="new-post-container">
            <form onSubmit={handleSubmit} className="new-post-form" encType="multipart/form-data">
                <h2>Create new post</h2>
                <div className="form-group">
                    <label htmlFor="content">Share your thoughts:</label>
                    <textarea id="content" className="new-post-input" value={content} onChange={handleContentChange} required />
                    <p className="char-count">Characters remaining: {remainingChars}</p>
                    <label htmlFor="image" className='custom-file-upload'>Attach your image here
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} style={{display: 'none'}}/>
                    </label>
                </div>
                <div className="preview-container">
                    {previewImage ? (
                        <img src={previewImage} alt="Preview" className="preview-image" />
                    ) : (
                        <div className="no-preview">Preview image here!</div>
                    )}
                </div>
                <div className="form-group">
                    <button type="submit" className="new-post-button">POST</button>           
                    <button type="button" onClick={handleClose} className="close-button">Close Create Post</button>
                </div>
            </form>
        </div>
    );
}
    
export default NewPost;
