///<reference path="layout.ts" />
///<reference path="service.ts" />
"use strict";

function boot(manifest: Url = "src/test/resources/manifest.json"): Layout.MutableLayout {
    var cose = Layout.cose(() => {
        console.log("Layout initialised")
        new Service.Checker(manifest, cose);
    });

    return cose;
}

type Url = string

type Thunk = () => void