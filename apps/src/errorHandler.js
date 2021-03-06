var annotationList = require('./acemode/annotationList');
var logToCloud = require('./logToCloud');
var utils = require('./utils');

var ErrorLevel = utils.makeEnum('WARNING', 'ERROR');

/**
 * Method that will do appropriate console/debug logging for the current app.
 * No-op by default. Can be set by the app.
 * TODO: Refactor this whole file into something less global.
 * @type {function}
 */
var logMethod = function () {};

/**
 * Changes the log method used by the error handling methods in this file.
 * @param {function} newLogMethod
 */
function setLogMethod(newLogMethod) {
  logMethod = newLogMethod;
}

/**
 * Output error to console and gutter as appropriate
 * @param {string} warning Text for warning
 * @param {ErrorLevel} level
 * @param {number} lineNum One indexed line number
 */
function outputError(warning, level, lineNum) {
  var text = level + ': ';
  if (lineNum !== undefined) {
    text += 'Line: ' + lineNum + ': ';
  }
  text += warning;
  logMethod(text);
  if (lineNum !== undefined) {
    annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }

  // Send up to New Relic if it meets our sampling rate
  if (level === ErrorLevel.ERROR) {
    logToCloud.addPageAction(logToCloud.PageAction.UserJavaScriptError, {
      error: warning
    }, 1 / 20);
  }
}

module.exports = {
  ErrorLevel: ErrorLevel,
  outputError: outputError,
  setLogMethod: setLogMethod
};
