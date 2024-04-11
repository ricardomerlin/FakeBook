import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewPost({ profile }) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [remainingChars, setRemainingChars] = useState(50);
    
    const navigate = useNavigate();

    const handleContentChange = (e) => {
        if (e.target.value.length <= 50) {
            setContent(e.target.value);
            setRemainingChars(50 - e.target.value.length);
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
    
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
            });        
            if (response.ok) {
                const newPost = await response.json();
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
        setPreviewImage(URL.createObjectURL(event.target.files[0]));
    };

    const handleClose = () => {
        navigate('/feed');
    };

    return (
        <div className="new-post-container">
            <form onSubmit={handleSubmit} className="new-post-form" encType="multipart/form-data">
                <h2>Create new post</h2>
                Share your thoughts:
                <label>
                    <textarea className="new-post-input" value={content} onChange={handleContentChange} required />
                </label>
                <p style={{paddingTop:'0'}}>Characters remaining: {remainingChars}</p>
                Attach your image:
                <label style={{display:'flex', alignItems:'center'}}>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                {previewImage ? (
                    <img src={previewImage} alt="Preview" style={{width: '200px', marginTop: '20px'}} />
                ) : (
                    <div style={{width: '200px', height: '200px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px'}}>
                        Preview image here!
                    </div>
                )}     
                <button type="submit" className="new-post-button">POST</button>           
                <button type="button" onClick={handleClose} className="close-button">Close Create Post</button>
            </form>
        </div>
    );
}
    
export default NewPost;