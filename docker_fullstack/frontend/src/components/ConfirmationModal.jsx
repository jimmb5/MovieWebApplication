import "./ConfirmationModal.css";
// Parannukset tervetulleita tarpeenvaatiessa
function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "confirmation"
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const buttonClass = variant === "delete" 
    ? "confirmation-modal-button-delete" 
    : "confirmation-modal-button-confirm";

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>

        <div className="confirmation-modal-actions">
          <button className="confirmation-modal-button-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={buttonClass}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;

// esimerkki käyttö:
/*
<ConfirmationModal // itse komponentti
isOpen={showConfirmModal} // boolean joka määrittää onko modal näkyvissä vai ei
onClose={() => setShowConfirmModal(false)} // funktio jota kutsutaan kun painetaan cancel tai klikataan ulkopuolelle 
onConfirm={handleConfirmLeave} // funktio jota kutsutaan kun confirm buttonia klikataan
title="Leave Group?" // otsikko
message={`Are you sure you want to leave "${group.name}"? You will be accepted to the group again.`} // viesti
confirmText="Leave Group" // confirm button text
cancelText="Cancel" // cancel button text
variant="delete" //delete tai confirmation prop, sen mukaan halutaanko confirm buttonista punainen vai vihreä
/>
*/
