(function () {
    const PLUGIN_ID = "cordova-plugin-customurlscheme";

    window._cdvElectronIpc.onPluginEvent(PLUGIN_ID, 'handleURL', function(url){

        try
        {
            if (window['handleOpenURL'])
                window.handleOpenURL(url);
            else
                console.warn(PLUGIN_ID + ": missing window.handleOpenURL", url);
        } catch (e)
        {
            console.error(PLUGIN_ID + ": cannot handle url:" + url, e);
        }


    });

}());
