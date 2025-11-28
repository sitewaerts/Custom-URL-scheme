// Type definitions for Apache Cordova Custom URL scheme plugin
// Licensed under the MIT license


interface Window {
    handleOpenURL?: (url:string)=>void
}
