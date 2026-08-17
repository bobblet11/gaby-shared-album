import React from "react";
import PropTypes from "prop-types";
import "../styles/styles.css";

export default function Spinner({ variant = "default", style}) {
        return <div className={`spinner ${variant}`} style={{ ...style, margin: "4rem auto" }}></div>;
}

Spinner.propTypes = {
	style: PropTypes.object,
        variant: PropTypes.string.isRequired,
};
