// ---- getCurrentISODatetime.test.js ----
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const getCurrentISODatetime = require("../src/utils/getCurrentISODatetime");

describe("getCurrentISODatetime", () => {

        it("returns full ISO datetime by default", () => {
                const result = getCurrentISODatetime();
                assert.match(result, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it("returns only date when hasTime=false", () => {
                const result = getCurrentISODatetime({ hasTime: false });
                assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
        });

        it("returns only time when hasDate=false", () => {
                const result = getCurrentISODatetime({ hasDate: false });
                assert.match(result, /^\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it("returns empty string when both false", () => {
                const result = getCurrentISODatetime({ hasDate: false, hasTime: false });
                assert.equal(result, "");
        });
});
