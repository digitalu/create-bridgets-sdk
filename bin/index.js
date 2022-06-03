#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const copyModuleTypes_1 = require("./copyModuleTypes");
const createConfigFile_1 = require("./createConfigFile");
const createDtsFolderCommand = (tsConfigLocation, sdkLocation) => `npx tsc -p ${tsConfigLocation} --declaration --emitDeclarationOnly --rootDir ./ --outDir ${sdkLocation}`;
const runCommand = (command) => {
    try {
        (0, child_process_1.execSync)(`${command}`, { stdio: 'inherit' });
    }
    catch (e) {
        console.error(`Failed to execute ${command}`, e);
        return false;
    }
    return true;
};
if (!fs_1.default.existsSync('bridgets.config.json')) {
    throw new Error('CLI not ready, create yourself the bridgets.config.json file.');
    (0, createConfigFile_1.createOrUpdateBridgeConfigFile)();
    throw new Error('No Config');
}
// READ THE CONFIG BRIDGE FILE
const cfg = JSON.parse(fs_1.default.readFileSync('bridgets.config.json', 'utf-8'));
// DELETE SDK BEFORE RECREATING IT IF EXISTS
if (fs_1.default.existsSync(cfg.sdkLocation))
    fs_1.default.rmSync(cfg.sdkLocation, { recursive: true });
console.log('Compiling...');
// CREATE DTS FROM PROJECT CODE IN THE SDK
runCommand(createDtsFolderCommand(cfg.tsConfigLocation, `${cfg.sdkLocation}/dts`));
// COPYING TYPES FROM NODE_MODULES AND MINFYING THEM
(0, copyModuleTypes_1.copyTypesAndMinify)(cfg.sdkLocation);
// RUN THE PROJECT TO COMPILE THE BRIDGE SDK
runCommand(`npx ts-node ${cfg.pathToSourceFile} -compileBridgeSDK`);
