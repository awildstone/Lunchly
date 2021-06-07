const { InvalidInputError } = require("./errors");

/** Sanitize search form.
 * Confirms that the data is a non-empty string, is NaN, and is not null/undefined.
 * Confirms the first and last name are capitalized, if not capitalizes.
 * Returns an Array of Capitalized First and Last name.
 * If the data is invalid throws an InvalidInputError.
 */

function sanitizeSearchQuery(queryString) {
    if (queryString !== "" && queryString !== " " && isNaN(queryString) && queryString !== null && queryString !== undefined) {
        let [ firstName, lastName ] = queryString.split(' ');
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        return [ firstName, lastName ]
    } else {
        throw new InvalidInputError(`Search term (${queryString}) is invalid. Please sesrch by first and last name.`, 400);
    }
}

module.exports = sanitizeSearchQuery;