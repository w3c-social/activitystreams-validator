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

var Note = function(level, path, text) {
  this.level = level;
  this.path = path;
  this.text = text;
};

Note.ERROR = "error";
Note.WARNING = "warning";
Note.NOTICE = "notice";
Note.INFO = "info";

module.exports = Note;
