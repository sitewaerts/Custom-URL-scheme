'use strict';

const path = require('path');
const fs = require('fs');

const LP = "cordova-plugin-customurlscheme - before_build_electron.js: ";

let electronJson;

function getPluginVar(context, varName)
{
    console.log(context.opts.plugin.dir);
    console.log(path.resolve(context.opts.plugin.dir, '../electron.json'));
    electronJson = electronJson || JSON.parse(fs.readFileSync(path.resolve(context.opts.plugin.dir, '../electron.json')).toString());
    return electronJson.installed_plugins[context.opts.plugin.id][varName];
}

function buildJsonPath(context){
    return path.resolve(context.opts.plugin.dir, '../../platforms/electron', 'build.json');
}

function loadBuildJson(context)
{
    return JSON.parse(fs.readFileSync(buildJsonPath(context)).toString());
}

function writeBuildJson(context, buildJson)
{
    fs.writeFileSync(buildJsonPath(context), JSON.stringify(buildJson));
}

module.exports = function (context)
{

    //const cordovaCommon = context.requireCordovaModule('cordova-common');

    // console.log(LP + "process.argv", process.argv.join(" "));
    // console.log(LP + "context.opts.plugin", context.opts.plugin);
    //
    const URL_SCHEME = getPluginVar(context, 'URL_SCHEME');
    // console.log(LP + "URL_SCHEME", URL_SCHEME);

    const buildJson = loadBuildJson(context);
    buildJson.config = buildJson.config || {};
    buildJson.config.protocols = buildJson.config.protocols || [];

    let found = false;
    for (let protocolDef of buildJson.config.protocols)
    {
        if (protocolDef && protocolDef.schemes && protocolDef.schemes.indexOf(URL_SCHEME) >= 0)
        {
            found = true;
            break;
        }
    }
    if (!found)
    {
        buildJson.config.protocols.push({name: 'custom-url-scheme', schemes: [URL_SCHEME]});
        writeBuildJson(context, buildJson);
    }

}
