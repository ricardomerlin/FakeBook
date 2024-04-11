import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ExtendedComments({ profile, post, comments }) {

    const [modalComments, setModalComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        filterComments();
    }, []);

    function showFeed () {
        navigate('/feed');
    }

    const handleNewCommentChange = (event) => {
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
                profile_picture: profile.profile_picture
            })
        });
        if (response.ok) {
            const data = await response.json();
            setModalComments([...comments, data]);
            setNewComment('');
        }
    };

    const filterComments = async () => {
        const response = await fetch(`/api/comments`);
        const data = await response.json();
        const postComments = comments.filter(comment => comment.post_id === post.id);
        setModalComments(postComments);
    };

    const reformatCommentDate = (comment) => {
        const dateObject = new Date(comment.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObject.toLocaleDateString(undefined, options);
    }

    const reformatCommentTime = (comment) => {
        const dateObject = new Date(comment.created_at);
        const options = { hour: 'numeric', minute: 'numeric', timeZone: 'America/New_York' };
        return dateObject.toLocaleTimeString('en-US', options);
    }

    return (
        <div className="comments-container-modal">
            <h1 style={{display:'flex', justifyContent:'center'}}>{post.name}'s Post</h1>
            <h2 className="comments-container-modal-close-modal-button" onClick={showFeed}>Close comments</h2>
            {modalComments.map((comment) => (
                <div key={comment.id} className="comment-card">
                    <img className="profile-pic" src={comment.profile_picture} alt="profile" />
                    <div className="comment-content">
                        <h3 className="comment-text">{comment.content}</h3>
                        <p className="comment-name">{comment.name}</p>
                        <p className="comment-date">{reformatCommentDate(comment)} at {reformatCommentTime(comment)}</p>
                    </div>
                </div>
            ))}
            <form onSubmit={handleNewCommentSubmit}>
                <input type="text" value={newComment} placeholder="Add a comment..." onChange={handleNewCommentChange}/>
                <button type="submit">Post</button>
            </form>
        </div>
    )
}

export default ExtendedComments;