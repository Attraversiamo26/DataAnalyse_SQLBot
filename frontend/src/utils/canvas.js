// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import SnowflakeID from 'snowflake-id';
const snowflake = new SnowflakeID({
    mid: 42,
    offset: (2010 - 1970) * 365 * 24 * 3600 * 1000,
});
export const guid = (prefix) => {
    if (prefix) {
        return `${prefix}_${snowflake.generate()}`;
    }
    else {
        return snowflake.generate();
    }
};
