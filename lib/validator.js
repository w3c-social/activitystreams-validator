// activitystreams-validator: https://github.com/w3c-social/activitystreams-validator
//
// Copyright © 2016 World Wide Web Consortium, (Massachusetts Institute of
// Technology, European Research Consortium for Informatics and Mathematics,
// Keio University, Beihang). All Rights Reserved. This work is distributed
// under the W3C® Software License [1] in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// [1] http://www.w3.org/Consortium/Legal/copyright-software

var _ = require("lodash");

var Note = require('../lib/note');

var BASE_URI = "http://www.w3.org/ns/activitystreams#";

var Validator = function() {

  notes = [];

  canonicalType = function(type) {
    if (type.indexOf(BASE_URI) == 0) {
      return type.substr(BASE_URI.length);
    } else {
      return type;
    }
  };

  validateJSONType = function(value) {    // Check for type
    if (_.isNumber(value)) {
      notes.push(new Note(Note.ERROR, [], "Top-level is a number; must be an object"));
      return true;
    } else if (_.isString(value)) {
      notes.push(new Note(Note.ERROR, [], "Top-level is a string; must be an object"));
      return true;
    } else if (_.isArray(value)) {
      notes.push(new Note(Note.ERROR, [], "Top-level is an array; must be an object"));
      return true;
    } else {
      return false;
    }
  };

  validateContext = function(obj) {
    if (!_.has(obj, "@context")) {
      notes.push(new Note(Note.WARNING, [], "Top-level does not contain a '@context' property"));
    } else if (_.isString(obj["@context"])) {
      if (obj["@context"] != "http://www.w3.org/ns/activitystreams") {
        notes.push(new Note(Note.WARNING, [], "'@context' property does not refer to Activity Streams context"));
      }
    } else if (_.isObject(obj["@context"])) {
      // FIXME: test to see if the AS2 context is referenced in the @context tree
    } else {
      notes.push(new Note(Note.ERROR, [], "'@context' property is neither a string nor an object"));
    }
  };

  validateObject = function(obj, path) {
    var recommended = [
      "name"
    ];
    var suggested = [
      "id",
      "type"
    ];
    var optional = [
       "attachment",
       "attributedTo",
       "content",
       "context",
       "endTime",
       "generator",
       "icon",
       "image",
       "inReplyTo",
       "location",
       "preview",
       "published",
       "replies",
       "scope",
       "startTime",
       "summary",
       "tag",
       "updated",
       "url",
       "to",
       "bto",
       "cc",
       "bcc",
       "mediaType",
       "duration"
    ];
    if (!_.isString(obj.name) && !_.isObject(obj.nameMap)) {
      notes.push(new Note(Note.ERROR, path, "Object should have a 'name' or 'nameMap' property."));
    }
    if (!_.isString(obj.id)) {
      notes.push(new Note(Note.WARNING, path, "Object should have an 'id' property."));
    }
    if (_.isString(obj.attachment)) {

    } else if (_.isObject(obj.attachment)) {
      validateItem(obj.attachment, ["attachment"].concat(path));
    } else {
      notes.push(new Note(Note.ERROR, path, "'attachment' property must be a string or object."));

    }
  };

  validateLink = function(obj, path) {

  };

  validateActivity = function(obj, path) {

  };

  validateIntransitiveActivity = function(obj, path) {

  };

  validateActor = function(obj, path) {

  };

  validateCollection = function(obj, path) {

  };

  validateOrderedCollection = function(obj, path) {

  };

  validateCollectionPage = function(obj, path) {

  };

  validateOrderedCollectionPage = function(obj, path) {

  };

  validateFunction = function(type) {
    var ctype = canonicalType(type);
    var typeToFunction = {
      "Object": validateObject,
      "Link": validateLink,
      "Activity": validateActivity,
      "IntransitiveActivity": validateIntransitiveActivity,
      "Actor": validateActor,
      "Collection": validateCollection,
      "OrderedCollection": validateOrderedCollection,
      "CollectionPage": validateCollectionPage,
      "OrderedCollectionPage": validateOrderedCollectionPage
    };
    return typeToFunction[ctype];
  };

  validateItem = function(obj, path) {
    if (!obj.type) {
      notes.push(new Note(Note.NOTICE, path, "Object does not have a type property."));
    } else {
      var validateFn = validateFunction(obj.type);
      if (!validateFn) {
        notes.push(new Note(Note.INFO, path, "Object of unrecognized type " + obj.type));
      } else {
        validateFn(obj, path);
      }
    }
  };

  validateTopLevelItem = function(obj) {
    var stop = validateJSONType(obj);
    if (!stop) {
      validateContext(obj);
      validateItem(obj, []);
    }
  };

  this.validateHTTPResponse = function(response) {

  };

  this.validateData = function(data) {
    var top = null;
    try {
      top = JSON.parse(data);
    } catch (err) {
      notes.push(new Note(Note.ERROR, [], "JSON parsing error: " + err.message));
    }
    if (top) {
      validateTopLevelItem(top);
    }
  };

  this.getNotes = function(data) {
    return notes.slice();
  };
};

module.exports = Validator;
