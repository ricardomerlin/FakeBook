import React, { useEffect, useState } from 'react';

function ProfilePost({ post, profile, fetchPosts }) {
    const [likes, setLikes] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [imageSize, setImageSize] = useState({});
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [deleteable, setDeleteable] = useState(false);
    const [profilePic, setProfilePic] = useState('');
    const [userLike, setUserLike] = useState(null);
    
    useEffect(() => {
        fetchLikes();
        fetchComments();
        fetchPosts()
    }, []);
    
    useEffect(() => {
        fetchLikes();
        fetchComments();
    }, [liked, comments]);

    useEffect(() => {
        fetchProfile();
    }, [post.profile_id]);
    
    useEffect(() => {
        setDeleteable(post.profile_id === profile.id);
    }, [post, profile.id]);

    const fetchProfile = async () => {
        const response = await fetch(`/api/profiles/${post.profile_id}`);
        const data = await response.json();
        setProfilePic(data.profile_picture);
    };

    const fetchLikes = async () => {
        const response = await fetch(`/api/likes`);
        const data = await response.json();
        const profileLikes = data.filter(like => like.post_id === post.id);
        setLikes(profileLikes.length);
        const userLike = profileLikes.find(like => like.profile_id === profile.id);
        if (userLike) {
            setLiked(true);
            setUserLike(userLike);
        }
    };

    const fetchComments = async () => {
        const response = await fetch(`/api/comments`);
        const data = await response.json();
        const postComments = data.filter(comment => comment.post_id === post.id);
        setComments(postComments);
    };

    function handleLike() {
        fetchLikes();
        fetch(`/api/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile_id: post.profile_id,
                post_id: post.id
            })
        })
        .then((response) => response.json())
        .then((data) => {
            setLikes(likes + 1);
            setLiked(true);
            setUserLike(data);
        })}


    function handleUnlike() {
        fetchLikes();
        if (userLike && userLike.profile_id === post.profile_id) {
            fetch(`/api/likes/${userLike.id}`, {
                method: 'DELETE',
            })
            .then((response) => response.json())
            .then((data) => {
                console.log('Unliked post');
                setLikes(likes - 1);
                setLiked(false);
                setUserLike(null);
            })
    } else {
        console.log('You can only delete your own likes')
    }}


    const handleNewCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    function handleNewCommentSubmit(event) {
        event.preventDefault();
        fetch(`/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: post.id,
                content: newComment,
                created_at: new Date().toISOString(),
                name: profile.name,
                profile_picture: profile.profile_picture
            })
        })
        .then((response) => response.json())
        .then((data) => {
            setComments([...comments, data]);
            setNewComment('');
        })
    }

    const handleImageClick = () => {
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDeletePost = async () => {
        const response = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
        });
    
        if (response.ok) {
            console.log('Post deleted successfully');
            fetchPosts();
        } else {
            console.error('Failed to delete post');
        }
    };

    const imageUrl = "http://localhost:5555/uploaded_images";

    const stickerPath = `${imageUrl}/${post.sticker}`

    const reformatPostDate = () => {
        const dateObject = new Date(post.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObject.toLocaleDateString(undefined, options);
    }

    const reformatPostTime = () => {
        const dateObject = new Date(post.created_at);
        const options = { hour: 'numeric', minute: 'numeric' };
        return dateObject.toLocaleTimeString(undefined, options);
    }

    const reformatCommentDate = (comment) => {
        const dateObject = new Date(comment.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObject.toLocaleDateString(undefined, options);
    }

    const reformatCommentTime = (comment) => {
        const dateObject = new Date(comment.created_at);
        const options = { hour: 'numeric', minute: 'numeric' };
        return dateObject.toLocaleTimeString(undefined, options);
    }

    return (
        <div className="profile-post">
            <div className="profile-post-header">
                {deleteable ? <button className='delete-post-button' onClick={handleDeletePost}>X</button> : null}            
                <h5>Posted on {reformatPostDate()} at {reformatPostTime()}</h5>
            </div>
            <div className='profile-comment-and-image-container'>
                <div className="profile-image-like-wrapper">
                    {post.sticker ? 
                    <img className="profile-post-pic" src={stickerPath} alt="pic_post" onClick={handleImageClick} /> : null}
                    {liked ? <button className='unlike-button' onClick={handleUnlike}><strong>{likes} {likes == 1 ? 'Like' : 'Likes'}</strong></button> : <button className='like-button' onClick={handleLike}>Like ♡</button>}
                    {liked ? <p>You liked this post.</p> : null}
                </div>
                <div className="profile-comments-container">
                    {comments.map((comment, index) => (
                        <div key={index} className="profile-comment">
                            <p>{comment.content}</p>
                            <h5>{comment.name} on {reformatCommentDate(comment)} at {reformatCommentTime(comment)}</h5> 
                            <p>----------------------</p>
                        </div>
                    ))}
                    <form onSubmit={handleNewCommentSubmit}>
                        <input type="text" value={newComment} onChange={handleNewCommentChange} placeholder="Write a comment..." />
                        <button type="submit">Post Comment</button>
                    </form>
                </div>
            </div>
            {showModal && (
            <div className="modal">
                <span className="close" onClick={handleCloseModal}>&times;</span>
                <img className="modal-content" src={post.sticker} alt="pic_post" />
            </div>
            )}
        </div>
    );
}

export default ProfilePost;