/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

const PLUGIN_ID = "cordova-plugin-customurlscheme";

const schemePlugin = {};


let _initialized = false;

/**
 *
 * @type {string | null}
 * @private
 */
let _scheme = null;

/**
 * @type {CordovaElectronPlugin}
 */
const plugin = function (action, args, callbackContext)
{
    if (!schemePlugin[action])
        return false;
    try
    {
        Promise.resolve(schemePlugin[action](args)).then(
            callbackContext.success.bind(callbackContext),
            callbackContext.error.bind(callbackContext)
        );
    } catch (e)
    {
        console.error(PLUGIN_ID + ": "+ action + ' failed', e);
        callbackContext.error({message: PLUGIN_ID + ": " + action + ' failed', cause: e});
    }
    return true;
}

plugin.configure = (ctx) =>
{
    _scheme = ctx.getVariable("URL_SCHEME");
    console.log(PLUGIN_ID + ": URL_SCHEME=" + _scheme);

    const app = ctx.getApp();


    // for windows & linux
    // see https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock)
        app.quit()
}

plugin.initialize = (ctx) =>
{
    if (_initialized)
        return Promise.reject(new Error(PLUGIN_ID + ": already initialized"));
    _initialized = true;

    /**
     *
     * @param {string} url
     * @void
     */
    function handleUrl(url){
        try
        {
            ctx.sendPluginEvent({pluginId: PLUGIN_ID, eventName: 'handleURL', payload: url});
        } catch (e)
        {
            console.error(PLUGIN_ID + ": cannot send handle url:" + url, e);
        }

    }

    // see https://www.bigbinary.com/blog/deep-link-electron-app
    // see https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app

    const app = ctx.getApp();


    // for macOS
    app.on('open-url', (event, url) => {
        handleUrl(url);
    })

    // for windows & linux
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        const mainWindow = ctx.getMainWindow();
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore()
            mainWindow.focus()
        }
        // the commandLine is array of strings in which last element is deep link url
        handleUrl(commandLine.pop())
    });

    app.whenReady().then(() => {
        const customUrl = process.argv.find(item => item.startsWith(_scheme + "://"));
        if (customUrl) {
            handleUrl(customUrl);
        }
    });


}

module.exports = plugin;
