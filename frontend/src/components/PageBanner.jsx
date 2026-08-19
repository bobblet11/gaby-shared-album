import React from "react";
import PropTypes from "prop-types";

export default function PageBanner({ title, nextPageName, goToNextPage, variant = "default" }) {
        return (
                <header className={`top-banner ${variant}`}>
                        <div className="title-card">{title}</div>
                        <button className="upload-button" onClick={goToNextPage}>
				{nextPageName}
                        </button>
                </header>
        );
}


PageBanner.propTypes = {
        title: PropTypes.string.isRequired,
        nextPageName: PropTypes.string.isRequired,
        goToNextPage: PropTypes.func.isRequired,
        variant: PropTypes.string.isRequired,
};
