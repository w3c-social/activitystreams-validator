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
    if (type.indexOf(BASE_URI) === 0) {
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

  validateStringProperty = function(obj, path, property) {
    if (!_.isUndefined(obj[property]) && !_.isString(obj[property])) {
      notes.push(new Note(Note.ERROR, path, "'"+property+"' must be a string."));
    }
  };

  validateNonnegativeIntegerProperty = function(obj, path, property) {
    if (!_.isUndefined(obj[property]) && !_.isNumber(obj[property])) {
      // XXX: check for non-integers
      notes.push(new Note(Note.ERROR, path, "'"+property+"' must be an integer."));
    } else if (obj[property] < 0) {
      // XXX: check for non-integers
      notes.push(new Note(Note.ERROR, path, "'"+property+"' must not be negative."));
    }
  };

  validateIRI = function(item, path, name) {
    // FIXME: validate that item is an IRI
  };

  validateObjectProperty = function(obj, path, property) {
    validateScalar = function(item, path, name) {
      if (!!_.isUndefined(item) || _.isNull(item)) {
        return;
      } else if (_.isString(item)) {
        validateIRI(item, path, name);
      } else if (_.isObject(item)) {
        validateItem(item, path);
      } else {
        notes.push(new Note(Note.ERROR, path, "'"+name+"' must be an IRI string, an object, or an array of IRI strings and objects."));
      }
    };

    if (_.isArray(obj[property])) {
      if (obj[property].length === 0) {
        notes.push(new Note(Note.ERROR, path, "Empty list is not allowed for '"+property+"'; use null or leave out property."));
      } else {
        obj[property].forEach(function(item, i) {
          validateScalar(obj[property][i], [i, property].concat(path).reverse(), property+"["+i+"]");
        });
      }
    } else {
      validateScalar(obj[property], [property].concat(path).reverse(), property);
    }
  };

  validateCollectionProperty = function(obj, path, property) {
    // XXX: Restrict to Collection
    validateObjectProperty(obj, path, property);
  };

  validateCollectionPageProperty = function(obj, path, property) {
    // XXX: Restrict to CollectionPage or Link
    validateObjectProperty(obj, path, property);
  };

  validateContentProperty = function(obj, path, property) {
    // XXX: test for other parts of this?
    validateStringProperty(obj, path, property);
  };

  validateDateTimeProperty = function(obj, path, property) {
    // XXX: test for date format
    validateStringProperty(obj, path, property);
  };

  validateLinkProperty = function(obj, path, property) {
    // XXX: limit to Link type
    validateObjectProperty(obj, path, property);
  };

  validateMediaTypeProperty = function(obj, path, property) {
    // XXX: test for media type format
    validateStringProperty(obj, path, property);
  };

  validateDurationProperty = function(obj, path, property) {
    // XXX: test for media type format
    validateStringProperty(obj, path, property);
  };

  validateLanguageProperty = function(obj, path, property) {
    // XXX: test for media type format
    validateStringProperty(obj, path, property);
  };

  validateMapProperty = function(obj, path, property, base) {
    if (_.isUndefined(obj[property]) || _.isNull(obj[property])) {
      return;
    } else if (!_.isObject(obj[property])) {
      notes.push(new Note(Note.ERROR, path, "'"+property+"' must be an object mapping language tags to strings."));
    } else {
      if (!_.isUndefined(obj[base])) {
        notes.push(new Note(Note.ERROR, path, "Define '"+property+"' or '"+base+"' but not both."));
      }
      for (var tag in obj[property]) {
        if (!_.isString(tag)) {
          notes.push(new Note(Note.ERROR, path, "'"+property+"' key must be a string."));
        }
        // XXX: test that tag is a language identifier or "und"
        if (!_.isString(obj[property][tag])) {
          notes.push(new Note(Note.ERROR, path, "'"+property+"["+tag+"]' must be a string."));
        }
      }
    }
  };

  validateObject = function(obj, path) {
    if (!_.isString(obj.name) && !_.isObject(obj.nameMap)) {
      notes.push(new Note(Note.ERROR, path, "Object should have a 'name' or 'nameMap' property."));
    }
    if (!_.isString(obj.id)) {
      notes.push(new Note(Note.WARNING, path, "Object should have an 'id' property."));
    }
    validateStringProperty(obj, path, "name");
    validateMapProperty(obj, path, "nameMap", "name");
    validateObjectProperty(obj, path, "attachment");
    validateObjectProperty(obj, path, "attributedTo");
    validateContentProperty(obj, path, "content");
    validateMapProperty(obj, path, "contentMap", "content");
    validateObjectProperty(obj, path, "context");
    validateDateTimeProperty(obj, path, "endTime");
    validateObjectProperty(obj, path, "generator");
    validateObjectProperty(obj, path, "icon");
    validateObjectProperty(obj, path, "image");
    validateObjectProperty(obj, path, "inReplyTo");
    validateObjectProperty(obj, path, "location");
    validateObjectProperty(obj, path, "preview");
    validateDateTimeProperty(obj, path, "published");
    validateCollectionProperty(obj, path, "replies");
    validateObjectProperty(obj, path, "scope");
    validateDateTimeProperty(obj, path, "startTime");
    validateContentProperty(obj, path, "summary");
    validateMapProperty(obj, path, "summaryMap", "summary");
    validateObjectProperty(obj, path, "tag");
    validateDateTimeProperty(obj, path, "updated");
    validateLinkProperty(obj, path, "url");
    validateObjectProperty(obj, path, "to");
    validateObjectProperty(obj, path, "bto");
    validateObjectProperty(obj, path, "cc");
    validateObjectProperty(obj, path, "bcc");
    validateMediaTypeProperty(obj, path, "mediaType");
    validateDurationProperty(obj, path, "duration");
  };

  validateLink = function(obj, path) {
    if (!_.isString(obj.href)) {
      notes.push(new Note(Note.ERROR, path, "Link object must have an 'href' property."));
    }
    validateStringProperty(obj, path, "name");
    validateLanguageProperty(obj, path, "hreflang");
    validateMediaTypeProperty(obj, path, "mediaType");
    validateStringProperty(obj, path, "rel");
    validateNonnegativeIntegerProperty(obj, path, "height");
    validateNonnegativeIntegerProperty(obj, path, "width");
  };

  validateActivity = function(obj, path) {
    validateObject(obj, path);
    // XXX: recommendation for actor?
    validateObjectProperty(obj, path, "actor");
    validateObjectProperty(obj, path, "object");
    validateObjectProperty(obj, path, "target");
    validateObjectProperty(obj, path, "result");
    validateObjectProperty(obj, path, "origin");
    validateObjectProperty(obj, path, "instrument");
  };

  validateIntransitiveActivity = function(obj, path) {
    validateObject(obj, path);
    validateObjectProperty(obj, path, "actor");
    validateObjectProperty(obj, path, "target");
    validateObjectProperty(obj, path, "result");
    validateObjectProperty(obj, path, "origin");
    validateObjectProperty(obj, path, "instrument");
    if ((!_.isUndefined(obj.object) && !_.isNull(obj.object)))
    {
      notes.push(new Note(Note.WARNING, path, "'object' property is not specified for IntransitiveActivity types."));
    }
  };

  validateActor = function(obj, path) {
    validateObject(obj, path);
  };

  validateCollection = function(obj, path) {
    validateObject(obj, path);
    validateNonnegativeIntegerProperty(obj, path, "totalItems");
    validateCollectionPageProperty(obj, path, "current");
    validateCollectionPageProperty(obj, path, "first");
    validateCollectionPageProperty(obj, path, "last");
    // XXX: prefer array property here?
    validateObjectProperty(obj, path, "items");
  };

  validateOrderedCollection = function(obj, path) {
    validateObject(obj, path);
    validateNonnegativeIntegerProperty(obj, path, "totalItems");
    validateCollectionPageProperty(obj, path, "current");
    validateCollectionPageProperty(obj, path, "first");
    validateCollectionPageProperty(obj, path, "last");
    // XXX: prefer array property here?
    // XXX: check for "items"?
    validateObjectProperty(obj, path, "orderedItems");
  };

  validateCollectionPage = function(obj, path) {
    validateCollection(obj, path);
    validateCollectionPageProperty(obj, path, "partOf");
    validateCollectionPageProperty(obj, path, "next");
    validateCollectionPageProperty(obj, path, "prev");
  };

  validateOrderedCollectionPage = function(obj, path) {
    validateOrderedCollection(obj, path);
    validateNonnegativeIntegerProperty(obj, path, "startIndex");
    validateCollectionPageProperty(obj, path, "partOf");
    validateCollectionPageProperty(obj, path, "next");
    validateCollectionPageProperty(obj, path, "prev");
  };

  validateQuestion = function(obj, path) {
    validateIntransitiveActivity(obj, path);
    validateObjectProperty(obj, path, "anyOf");
    validateObjectProperty(obj, path, "oneOf");
    if ((!_.isUndefined(obj.anyOf) && !_.isNull(obj.anyOf)) &&
        (!_.isUndefined(obj.anyOf) && !_.isNull(obj.oneOf)))
    {
      notes.push(new Note(Note.ERROR, path, "Question object must not have both 'anyOf' and 'oneOf' properties."));
    }
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
      "OrderedCollectionPage": validateOrderedCollectionPage,
      "Accept": validateActivity,
      "Add": validateActivity,
      "Announce": validateActivity,
      "Arrive": validateIntransitiveActivity,
      "Block": validateActivity,
      "Create": validateActivity,
      "Delete": validateActivity,
      "Dislike": validateActivity,
      "Flag": validateActivity,
      "Follow": validateActivity,
      "Ignore": validateActivity,
      "Invite": validateActivity,
      "Join": validateActivity,
      "Leave": validateActivity,
      "Like": validateActivity,
      "Listen": validateActivity,
      "Move": validateActivity,
      "Offer": validateActivity,
      "Question": validateActivity,
      "Reject": validateActivity,
      "Read": validateActivity,
      "Remove": validateActivity,
      "TentativeReject": validateActivity,
      "TentativeAccept": validateActivity,
      "Travel": validateIntransitiveActivity,
      "Undo": validateActivity,
      "Update": validateActivity,
      "View": validateActivity,
      "Application": validateActor,
      "Group": validateActor,
      "Organization": validateActor,
      "Person": validateActor,
      "Service": validateActor,
      "Article": validateObject,
      "Audio": validateObject,
      "Document": validateObject,
      "Event": validateObject,
      "Image": validateObject,
      "Note": validateObject,
      "Page": validateObject,
      "Place": validateObject,
      "Profile": validateObject,
      "Relationship": validateObject,
      "Video": validateObject,
      "Mention": validateLink,
      "Question": validateQuestion
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

  this.validateTopLevelItem = function(obj) {
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
      this.validateTopLevelItem(top);
    }
  };

  this.getNotes = function(data) {
    return notes.slice();
  };
};

module.exports = Validator;
