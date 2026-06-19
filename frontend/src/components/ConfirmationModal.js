import React from 'react';

// A reusable confirmation modal component
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    // The semi-transparent background overlay
    <div className="modal-overlay" onClick={onClose}>
      {/* The modal content itself, stopPropagation prevents closing when clicking inside */}
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          {/* The "No" or "Cancel" button */}
          <button className="btn btn-secondary" onClick={onClose}>
            No
          </button>
          {/* The "Yes" or "Confirm" button */}
          <button className="btn" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
