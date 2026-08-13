const getCurrentISODatetime = (config = {}) => {
        const mergedConfig = {
                hasDate: true,
                hasTime: true,
                ...config,
        };

        const [datePart, timePart] = new Date().toISOString().split("T");
        let out = "";

        if (mergedConfig.hasDate) {
                out += datePart;
        }

        if (mergedConfig.hasTime && mergedConfig.hasDate) {
                out += `T${timePart}`;
        }

        if (mergedConfig.hasTime && !mergedConfig.hasDate) {
                out += `${timePart}`;
        }

        return out;
};

module.exports = getCurrentISODatetime;
