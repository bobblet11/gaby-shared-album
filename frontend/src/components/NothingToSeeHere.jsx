import React from "react";
import PropTypes from "prop-types";

export default function NothingToSeeHere({ variant = "default", style, text = "Nothing to see here... Try uploading something!"}) {
        return (
                <div style={style} className={`nothing-to-see-here ${variant}`}>
                        {text}
                </div>
        );
}

NothingToSeeHere.propTypes = {
        style: PropTypes.object,
        variant: PropTypes.string.isRequired,
        text: PropTypes.string
};
