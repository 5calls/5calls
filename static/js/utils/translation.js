const i18n = require('i18next');

/*  This method takes a localization key(and other arguments) and returns localized text or a localized choo fragment
*   
*   Arguments:
*   "key" - the localization key in the locale file
*   "variableObject" - a json object having variables that will be interpolated into the localized string
*   "justText" - if true, the object will be returned as just a text string and not turned into a choo fragment.
*       There is at least one use case where this is required(a placeholder in a text input cannot have text within a span)
*   "useDiv" - if true, wrap the text in a <div> tag instead of a span.  This is not currently used, but may be required 
*       with larger fragments such as we will get for issues.  By default(false), the localized text is wrapped in 
*       a <span> tag.  
*   Note: if the third parameter is true, this fourth parameter will be ignored because the text will not be wrapped at all.
*/
function getText(key, variableObject, justText, useDiv) {
  variableObject = variableObject || {};
  justText = justText || false;
  useDiv = useDiv || false;

    //get the localized string from the i18n cache
  let template = i18n.t(key, variableObject);

  if (justText) {
    return template;
  }

  const parser = new DOMParser();

  template = useDiv
        ? "<div>" + template + "</div>"
        : "<span>" + template + "</span>";

  let doc = parser.parseFromString(template, "text/html");
  let node = useDiv ? doc.querySelector("div") : doc.querySelector("span");
  return node;
}

module.exports = getText;