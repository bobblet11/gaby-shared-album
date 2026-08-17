import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/styles.css"

export default function PageBanner({ title, nextPageName, goToNextPage }) {
        return (
                <header className="top-banner">
			<div className="title-card">`${title}`</div>
                        <button className="upload-button" onClick={goToNextPage}>
                                `${nextPageName}`
                        </button>
                </header>
        );
}
