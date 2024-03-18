import React from 'react';

function DeleteConfirmationModal({ isOpen, onClose, onDelete }) {
    return (
        <>
            {isOpen && (
                <div className="delete-modal">
                    <div className="delete-modal-content">
                        <div className="delete-modal-header">
                            <h2>Confirm Deletion</h2>
                            <span className="delete-modal-close" onClick={onClose}>&times;</span>
                        </div>
                        <div className="delete-modal-body">
                            <p>Are you sure you want to delete this post?</p>
                        </div>
                        <div className="delete-modal-footer">
                            <button className="delete-modal-button" onClick={onDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


export default DeleteConfirmationModal;
