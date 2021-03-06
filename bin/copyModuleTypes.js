"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyTypesAndMinify = void 0;
var fs = require('fs');
var path = require('path');
const dtsMinifier_1 = require("./dtsMinifier");
// setup (provide a TS Compiler API object)
const minifier = (0, dtsMinifier_1.createMinifier)();
function copyFileSync(source, target) {
    var targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    if (targetFile.slice(-12) == 'package.json' || targetFile.slice(-5) === '.d.ts') {
        const data = fs.readFileSync(source, 'utf-8');
        if (targetFile.slice(-5) === '.d.ts')
            fs.writeFileSync(targetFile, minifier.minify(data));
        else {
            const dataJSON = JSON.parse(data);
            const newData = { name: dataJSON.name, main: dataJSON.main, files: dataJSON.files, types: dataJSON.types };
            fs.writeFileSync(targetFile, JSON.stringify(newData));
        }
    }
}
function copyFolderRecursiveSync(source, target) {
    var files = [];
    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach((file) => {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            }
            else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}
function cleanEmptyFoldersRecursively(folder) {
    var isDir = fs.statSync(folder).isDirectory();
    if (!isDir) {
        return;
    }
    var files = fs.readdirSync(folder);
    if (files.length > 0 || (files.length === 1 && files[0] === 'package.json')) {
        files.forEach(function (file) {
            var fullPath = path.join(folder, file);
            cleanEmptyFoldersRecursively(fullPath);
        });
        // re-evaluate files; after deleting subfolder
        // we may have parent folder empty now
        files = fs.readdirSync(folder);
    }
    if (files.length == 0 || (files.length === 1 && files[0] === 'package.json')) {
        // console.log('removing: ', folder);
        fs.rmSync(folder, { recursive: true });
        return;
    }
}
const copyTypesAndMinify = (sdkLocation) => {
    copyFolderRecursiveSync('./node_modules', `${sdkLocation}/dts`);
    cleanEmptyFoldersRecursively(`${sdkLocation}/dts`);
};
exports.copyTypesAndMinify = copyTypesAndMinify;
