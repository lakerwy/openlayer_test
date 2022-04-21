/**
 * @param {string} url URL.
 * @return {Array<string>} Array of urls.
 */
export function expandUrl(url) {
  let templateUrl = url;
  let subdomains = [];
  let match = /\{([a-z])-([a-z])\}/.exec(url);
  if (match) {
    templateUrl = url.replace(match[0], "{s}");
    // char range
    const startCharCode = match[1].charCodeAt(0);
    const stopCharCode = match[2].charCodeAt(0);
    let charCode;
    for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
      subdomains.push(String.fromCharCode(charCode));
    }
    return { templateUrl, subdomains };
  }
  match = /\{(\d+)-(\d+)\}/.exec(url);
  if (match) {
    templateUrl = url.replace(match[0], "{s}");
    // number range
    const stop = parseInt(match[2], 10);
    for (let i = parseInt(match[1], 10); i <= stop; i++) {
      subdomains.push(i.toString());
    }
    return { templateUrl, subdomains };
  }
  return { templateUrl, subdomains };
}

/**
 * Appends query parameters to a URI.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {!Object} params An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.
 * @return {string} The new URI.
 */
export function appendParams(uri, params) {
    var keyParams = [];
    // Skip any null or undefined parameter values
    Object.keys(params).forEach(function (k) {
        if (params[k] !== null && params[k] !== undefined) {
            keyParams.push(k + '=' + encodeURIComponent(params[k]));
        }
    });
    var qs = keyParams.join('&');
    // remove any trailing ? or &
    uri = uri.replace(/[?&]$/, '');
    // append ? or & depending on whether uri has existing parameters
    uri = uri.indexOf('?') === -1 ? uri + '?' : uri + '&';
    return uri + qs;
}
