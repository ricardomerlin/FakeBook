import React from 'react';

function Comment({ comment }) {
    return (
        <div className="comment">
            <p>{comment.content}</p>
            <h5>Commented on {comment.created_at}</h5>
        </div>
    );
}

export default Comment;