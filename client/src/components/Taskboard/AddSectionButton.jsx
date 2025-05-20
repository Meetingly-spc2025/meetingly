import React from "react";
// import "../../styles/AddSectionButton.css";

const AddSectionButton = ({ onClick }) => {
  return (
    <div className="add-section">
      <button onClick={onClick} className="add-button">
        ＋
      </button>
    </div>
  );
};

export default AddSectionButton;
