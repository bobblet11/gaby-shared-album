import React from "react";
import PropTypes from "prop-types";

export default function ModalOverlay({ variant = "default", style, onClick, children }) {
        return (
                <div className={`modal-backdrop ${variant}`} onClick={onClick}>
                        {children}
                </div>
        );
}

ModalOverlay.propTypes = {
        style: PropTypes.object,
        variant: PropTypes.string.isRequired,

        onClick: PropTypes.func,
        children: PropTypes.node,
};
