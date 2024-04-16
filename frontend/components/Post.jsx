import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import OtherUser from './OtherUser';

function Post({ post, profile, allComments, fetchPosts, handlePostAndComments }) {
    const [likes, setLikes] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [deleteable, setDeleteable] = useState(false);
    const [userLike, setUserLike] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isTop, setIsTop] = useState(true);
    const [otherUserId, setOtherUserId] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchLikes();        
        fetchComments(allComments);

        const checkScroll = () => {
            setIsTop(window.pageYOffset === 0);
        };
        window.addEventListener('scroll', checkScroll);
        return () => {
            window.removeEventListener('scroll', checkScroll);
        };
    }, []);
    
    useEffect(() => {
        setDeleteable(post.profile_id === profile.id);
    }, [post, profile]);

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
    
    const fetchComments = async (allComments) => {
        const postComments = allComments.filter(comment => comment.post_id === post.id);
        setComments(postComments);
    };

    const handleLike = () => {
        fetchLikes();
        if (userLike === null) {
            fetch(`/api/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile_id: profile.id,
                    post_id: post.id
                })
            })
            .then((response) => response.json())
            .then((data) => {
                setLikes(likes + 1);
                setLiked(true);
                setUserLike(data);
            })
        }
    }

    console.log(allComments)

    const handleUnlike = () => {
        fetchLikes();
        if (userLike && userLike.profile_id === profile.id) {
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
        }
    }

    const handleNewCommentChange = (event) => {
        console.log('New comment:', event.target.value);
        setNewComment(event.target.value);
    };

    const handleNewCommentSubmit = async (event) => {
        event.preventDefault();
        console.log('Submitting new comment...');
        const response = await fetch(`/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: post.id,
                content: newComment,
                created_at: new Date().toISOString(),
                name: profile.name,
                profile_id: profile.id,
                profile_picture: profile.profile_picture
            })
        });
        if (response.ok) {
            const data = await response.json();
            setComments([...comments, data]);
            setNewComment('');
        }
    };

    const handleImageClick = () => {
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };
    const handleCloseModal = () => {
        setShowModal(false);
        document.body.style.overflow = 'auto';
    };

    const handleOpenOtherUser = (userId) => {
        if (userId === profile.id) {
            return;
        }
        setOtherUserId(userId);
    };

    const handleCloseOtherUser = () => {
        setOtherUserId(0);
    };

    const handleDeletePost = async () => {
        console.log('Deleting post...');
        setShowDeleteModal(false);
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

    const goProfile = () => {
        navigate('/profile');
    }

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

    function openComments () {
        handlePostAndComments(comments, post);
        navigate('/extended-comments');
    }

    return (
        <div className="post" onDoubleClick={liked ? handleUnlike : handleLike}>
            <div className="post-header">
                {post.profile_picture ? <img className="profile-pic" src={`data:image/jpeg;base64,${post.profile_picture}`} alt="Profile" /> : <img className='profile-pic' src='https://st2.depositphotos.com/11742109/48212/v/450/depositphotos_482126926-stock-illustration-gender-neutral-profile-avatar-front.jpg' alt='default-pfp' />}
                <h5>Posted by {post.profile_id == profile.id ? <a>you</a> : <a className='link-to-profile' onClick={() => handleOpenOtherUser(post.profile_id)}>{post.name}</a>} on {reformatPostDate()} at {reformatPostTime()}</h5>
            </div>
            <div className='content-header'>
                <p>{post.content}</p>
            </div>
            {post.image ? 
            <img className="post-pic" src={`data:image/jpeg;base64,${post.image}`} alt="pic_post" onClick={handleImageClick} /> : null}
            {liked ? <button className='unlike-button' onClick={handleUnlike}>♥ {likes} {likes == 1 ? 'Like' : 'Likes'}</button> : <button className='like-button' onClick={handleLike}>♡ {likes} {likes == 1 ? 'Like' : 'Likes'}</button>}
            {liked ? <p>You liked this post.</p> : null}
            <p style={{marginBottom: '0'}}><strong><u>Replies</u></strong></p>
            {comments.length >= 4 ? <p style={{marginTop: '3px', cursor: 'pointer'}} onClick={openComments}>Click to view more comments...</p>: null}
            <div className="comments-container">
                {comments.length === 0 ? (
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center'}}>
                        <p>No comments yet</p>
                    </div>
                ) : (
                    comments.slice(0, 3).map((comment, index) => (
                        <a key={index} className='comment'><a href='#' style={{color: 'black', marginRight: '10px'}}><strong onClick={() => handleOpenOtherUser(comment.profile_id)}>{comment.name}</strong></a>{comment.content}</a>
                    ))
                )}
                <form onSubmit={handleNewCommentSubmit} className='submit-comment-feed'>
                    <input type="text" style={{width: '200px'}} value={newComment} onChange={handleNewCommentChange} placeholder={`Reply to ${post.name}...`} />
                    <button type="submit" style={{marginTop: '10px'}}>Post</button>
                    {deleteable ? <a href='#' className='delete-post-feed-button' onClick={() => setShowDeleteModal(true)}>Delete post</a> : null}            
                </form>
            </div>
            {showModal && (
                <>
                <div className="modal-overlay" onClick={handleCloseModal}></div>
                <div className="modal">
                    <span className="close" onClick={handleCloseModal}>X</span>
                    <img className="modal-content" src={`data:image/jpeg;base64,${post.image}`} alt="pic_post" />
                </div>
                </>
            )}
            <OtherUser
                isOpen={otherUserId > 0}
                onClose={handleCloseOtherUser}
                otherUserId={otherUserId}
                profile={profile}
            />
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={handleDeletePost}
            />
        </div>
    );
}

export default Post;
