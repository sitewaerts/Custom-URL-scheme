'use strict';

const path = require('path');
const fs = require('fs');

const ID = "cordova-plugin-customurlscheme";
const LP = ID + " - electron - update_build_json.js: ";

let electronJson;

function getPluginVar(context, varName)
{
    // console.log(context.opts.plugin.dir);
    // console.log("electron.json at " + path.resolve(context.opts.plugin.dir, '../electron.json'));
    electronJson = electronJson || JSON.parse(fs.readFileSync(path.resolve(context.opts.plugin.dir, '../electron.json')).toString());
    return electronJson.installed_plugins[context.opts.plugin.id][varName];
}

function buildJsonPath(context){

    // console.log("build.json at " + path.resolve(context.opts.plugin.dir, '../../platforms/electron', 'build.json'));
    return path.resolve(context.opts.plugin.dir, '../../platforms/electron', 'build.json');
}

function loadBuildJson(context)
{
    const file = buildJsonPath(context);
    try
    {
        if(!fs.existsSync(file))
            return {};
        return JSON.parse(fs.readFileSync(file) || '{}');
    } catch (e)
    {
        console.warn(LP + ": cannot read file " + file, e);
        return {};
    }
}

function writeBuildJson(context, buildJson)
{
    fs.writeFileSync(buildJsonPath(context), JSON.stringify(buildJson, null, 2), 'utf8');
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
