#!/usr/bin/env node
"use strict";

var moment = require("moment");
var path = require("path");
var shell = require("shelljs");

var version = require("../package.json").version;

var CHANGELOG = path.join(__dirname, "../CHANGELOG");

// get the last tag
var tags = shell.exec("git tag", { silent: true });
if (tags.code !== 0) { shell.exit(tags.code); }
var lastTag = tags.stdout.trim().split(/\r\n?|\n/g).slice(-1)[0];

var gitLogRange = lastTag + "..HEAD";
var log = shell.exec("git log --no-merges --pretty=format:'* %s (%an)' " +
					 gitLogRange, { silent: true });
if (log.code !== 0) { shell.exit(log.code); }

var SIMPLE_DATE = moment().locale('en-US').format("MMMM D, YYYY");

log = [
	SIMPLE_DATE + " - v" + version,
	"",
	log.stdout.trim(),
	"",
	shell.cat(CHANGELOG)
].join("\n");

log.to(CHANGELOG);
