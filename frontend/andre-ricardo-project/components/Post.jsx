import React, { useEffect, useState } from 'react';

function Post({ post, userData }) {
    const [likes, setLikes] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [imageSize, setImageSize] = useState({});
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [profilePic, setProfilePic] = useState('');



    useEffect(() => {
        const fetchLikes = async () => {
        const response = await fetch(`http://127.0.0.1:5555/likes`);
        const data = await response.json();
        const profileLikes = data.filter(like => like.profile_id === post.profile_id);
        console.log(post.profile_id)
        console.log(profileLikes)
        setLikes(profileLikes.length);
        };
        fetchLikes();

        if (post.image_url) {
        const img = new Image();
        img.onload = function() {
            setImageSize({ width: this.width, height: this.height });
        }
        img.src = post.image_url;
        }

        const fetchComments = async () => {
            const response = await fetch(`http://127.0.0.1:5555/comments`);
            const data = await response.json();
            const postComments = data.filter(comment => comment.post_id === post.id);
            setComments(postComments);
        };
        fetchComments();

    }, [post]);

    const handleLike = async () => {
        const response = await fetch(`http://127.0.0.1:5555/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile_id: post.profile_id, post_id: post.id, created_at: new Date().toISOString() }),
        });
    
        if (response.ok) {
            const newLike = await response.json();
            setLikes(likes + 1);
            setLiked(true);
        } else {
            console.error('Failed to like post');
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`http://127.0.0.1:5555/profiles/${post.profile_id}`);
            const data = await response.json();
            setProfilePic(data.profile_picture);
        };
        fetchProfile();
    }, [post.profile_id]);

    const handleUnlike = async () => {
  
        const likeId = post.id
        const response = await fetch(`http://127.0.0.1:5555/likes/${likeId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setLikes(likes - 1);
            setLiked(false);
        } else {
            console.error('Failed to unlike post');
        }
    };

    const handleNewCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleNewCommentSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch(`http://127.0.0.1:5555/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: post.id, content: newComment, created_at: new Date().toISOString() }),
        });

        if (response.ok) {
            const comment = await response.json();
            setComments([...comments, comment]);
            setNewComment('');
        } else {
            console.error('Failed to post comment');
        }
    };

    const handleImageClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const maxImageSize = 500;

    return (
        <div className="post">
            <img className="profile-pic" src={profilePic} alt="Profile" />
            <p>{post.content}</p>
            <div className="image-like-wrapper">
                {post.image_url && imageSize.width <= maxImageSize && imageSize.height <= maxImageSize ? 
                <img className="post-avatar" src={post.image_url} alt="pic_post" onClick={handleImageClick} /> : null}
                {liked ? <h4 onClick={handleUnlike}>{likes}</h4> : <button onClick={handleLike}>Like ♡</button>}
            </div>
            <h5>Posted on {post.created_at}</h5>
            {comments.map((comment, index) => (
                <div key={index} className="comment">
                    <p>{comment.content}</p>
                    <h5>Commented on {comment.created_at}</h5>
                </div>
            ))}
            <form onSubmit={handleNewCommentSubmit}>
                <input type="text" value={newComment} onChange={handleNewCommentChange} placeholder="Write a comment..." />
                <button type="submit">Post Comment</button>
            </form>
            {showModal && (
            <div className="modal">
                <span className="close" onClick={handleCloseModal}>&times;</span>
                <img className="modal-content" src={post.image_url} alt="pic_post" />
            </div>
            )}
        </div>
    );
}

export default Post;