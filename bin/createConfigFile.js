"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateBridgeConfigFile = void 0;
const readline_sync_1 = __importDefault(require("readline-sync"));
const fs_1 = __importDefault(require("fs"));
const createOrUpdateBridgeConfigFile = (initialCfg = {}) => {
    const cfg = Object.assign({ tsConfigLocation: './tsconfig.json', sdkLocation: './sdk', typeLocation: './index.ts' }, initialCfg);
    const messages = {
        noBridgeTSFileDetected: '> ❌ No BridgeTS config file detected \n',
        noTSConfigFileDetected: '> ❌ No TS Config file detected \n',
        noSDKTypeFileDetected: '> ❌ The file containing your SDKType was not found, please create your SDKType. \n To know more about SDKType, check the documentation at https://bridgets.co/docs \n',
        noSDKTypeDetectedInFile: '> ❌ No SDKType found in the file provided \n To know more about SDKType, check the documentation at https://bridgets.co/docs \n',
        askForBridgeTSFileCreation: '> Do you want to create a BridgeTS config file ? (y) ',
        askForTSConfigLocation: `\n> Please provide the path to your tsconfig.json: (${cfg === null || cfg === void 0 ? void 0 : cfg.tsConfigLocation})`,
        askForTypeLocation: `\n> Please provide the path to the file containing your SDKFile: (${cfg === null || cfg === void 0 ? void 0 : cfg.typeLocation}) `,
        askForSdkLocation: `\n> Please provide the path to the desired output sdk location: (${cfg === null || cfg === void 0 ? void 0 : cfg.sdkLocation}) `,
        filesExistsAtLocation: `\n> The folder of the output sdk already exists. `,
        askForOverwriting: `\n> Do you want to overwrite the folder? (y) `,
        folderAlreadyExists: `\n> The folder of the sdk location already exists `,
        bridgeTSConfigFileCreated: '\n> ✅ The BridgeTS Config has successfully been created. \n>    You can change the config anytime in the bridgets.config.json file. \n\n',
    };
    console.log(messages.bridgeTSConfigFileCreated);
    console.log(messages.noBridgeTSFileDetected);
    const create = readline_sync_1.default.question(messages.askForBridgeTSFileCreation);
    if (!create.includes('y') && create)
        throw new Error(messages.noBridgeTSFileDetected);
    const tsConfigLocation = readline_sync_1.default.question(messages.askForTSConfigLocation) || cfg.tsConfigLocation;
    if (!fs_1.default.existsSync(tsConfigLocation))
        throw new Error(messages.noTSConfigFileDetected);
    cfg.tsConfigLocation = tsConfigLocation;
    fs_1.default.writeFileSync('./bridgets.config.json', JSON.stringify({ tsConfigLocation: cfg.tsConfigLocation }));
    const SdkLocation = readline_sync_1.default.question(messages.askForSdkLocation) || cfg.sdkLocation;
    if (fs_1.default.existsSync(SdkLocation)) {
        console.log(messages.filesExistsAtLocation);
        const overwrite = readline_sync_1.default.question(messages.askForOverwriting);
        if (!overwrite.includes('y') && overwrite)
            throw new Error(messages.folderAlreadyExists);
    }
    cfg.sdkLocation = SdkLocation;
    fs_1.default.writeFileSync('./bridgets.config.json', JSON.stringify(Object.assign(Object.assign({}, cfg), { typeLocation: undefined })));
    const typeLocation = readline_sync_1.default.question(messages.askForTypeLocation) || cfg.typeLocation;
    if (!fs_1.default.existsSync(typeLocation))
        throw new Error(messages.noSDKTypeFileDetected);
    if (!fs_1.default.readFileSync(typeLocation).includes('export type SDKType'))
        throw new Error(messages.noSDKTypeDetectedInFile);
    cfg.typeLocation = typeLocation;
    fs_1.default.writeFileSync('./bridgets.config.json', JSON.stringify({ typeLocation: cfg.typeLocation }));
    console.log(messages.bridgeTSConfigFileCreated);
    process.exit(1);
};
exports.createOrUpdateBridgeConfigFile = createOrUpdateBridgeConfigFile;
