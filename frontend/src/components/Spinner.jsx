import React from "react";
import PropTypes from "prop-types";

export default function Spinner({ variant = "default", style}) {
        return <div className={`spinner ${variant}`} style={{ ...style }}></div>;
}

Spinner.propTypes = {
	style: PropTypes.object,
        variant: PropTypes.string.isRequired,
};
