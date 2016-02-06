#!/usr/bin/env node
"use strict";

var Promise = require("babybird");
var browserify = require("browserify");
var concat = require("concat-stream");
var fs = require("fs");
var moment = require("moment");
var path = require("path");
var shell = require("shelljs");

var version = require("../package.json").version;
var buildDir = path.join(__dirname, "../dist");
var srcDir = path.join(__dirname, "../src");
var testsDir = path.join(__dirname, "../tests");

var RIGHT_NOW = moment().locale('en-US').format("D-MMMM-YYYY HH:mm:ss");
var LICENSE = [
    "/*!",
    shell.cat(path.join(__dirname, "../LICENSE")),
    "*/",
    "/* Version v" + version + ", Build time: " + RIGHT_NOW + " */"
].map(function(s) { return s.trim(); }).join("\n");

function writeFile(filename, contents) {
    return new Promise(function(resolve, reject) {
        var fullname = path.join(buildDir, filename);
        console.log("Writing", path.relative(process.cwd(), fullname));
        fs.writeFile(fullname, contents, 'utf8', function(err) {
            if (err) { reject(err); } else { resolve(); }
        });
    });
}

function concatP() {
    var resolve;
    var promise = new Promise(function(r) { resolve = r; });
    var stream = concat(resolve);
    return { stream: stream, promise: promise };
}

function build(target, filename) {
    var results = [null];
    results[0] = new Promise(function(resolve, reject) {
        var bundle = browserify();

        bundle.require(path.join(srcDir, "index.js"), { expose: "parserlib" });

        if (target === "split") {
            bundle.require(path.join(srcDir, "util"),
                           { expose: "parserlib-core" });
            var css = concatP(); results.push(css.promise);
            var stub = concatP(); results.push(stub.promise);
            bundle.plugin('factor-bundle', {
                outputs: [ css.stream, stub.stream ]
            });
        }

        bundle.bundle(function(err, src) {
            if (err) { reject(err); } else { resolve(src); }
        });
    });
    return Promise.all(results).then(function(results) {
        if (target === "split") {
            var core = results[0];
            var css = results[1];
            var stub = results[2];
            core = [
                LICENSE,
                "var parserlib = (function () {",
                "var require;",
                core,
                stub,
                "return { _require: require, util: require('parserlib-core') };",
                "})();"
            ].join("\n");
            css = [
                LICENSE,
                "(function () {",
                "var require = parserlib._require;",
                css,
                "parserlib.css = require('parserlib').css;",
                "})();"
            ].join("\n");
            return Promise.all([
                writeFile("parserlib-core.js", core),
                writeFile("parserlib-css.js", css)
            ]);
        } else {
            var src = results[0];
            src = [
                LICENSE,
                "var parserlib = (function () {",
                "var require;",
                src,
                "return require('parserlib');",
                "})();"
            ];
            if (target === 'node') {
                src.push("module.exports = parserlib;");
            }
            return writeFile(filename, src.join("\n"));
        }
    });
}

function buildTests(filename) {
    // Build the list of test files
    var tests = shell.find(testsDir).filter(function(file) {
        return file.match(/\.js$/);
    });
    return new Promise(function(resolve, reject) {
        var bundle = browserify();
        tests.forEach(function(f, i) {
            bundle.require(f, { expose: "test"+i });
        });
        bundle.exclude('yuitest');
        bundle.exclude(path.join(srcDir, "index.js"));
        bundle.bundle(function(err, src) {
            if (err) { reject(err); } else { resolve(src); }
        });
    }).then(function(src) {
        src = [
            LICENSE,
            "(function () {",
            "var require = function(x) {",
            "if (x==='yuitest') { return YUITest; }",
            "return parserlib;",
            "};",
            src
        ].concat(tests.map(function(f,i) {
            return "require('test"+i+"');";
        })).concat([
            "})();"
        ]);
        writeFile(filename, src.join("\n"));
    });
}

Promise.resolve().then(function() {
    // Ensure build directory is present.
    shell.mkdir('-p', buildDir);
}).then(function() {
    return build("full", "parserlib.js");
}).then(function() {
    return build("node", "node-parserlib.js");
}).then(function() {
    return build("split");
}).then(function() {
    return buildTests("parserlib-tests.js");
});
