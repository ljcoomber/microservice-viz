///<reference path="../lib/jquery.d.ts" />
///<reference path="layout.ts" />

module Service {

    interface Service {
        name: string;
        url: string;
    }

    export class Checker {

        constructor(manifest:Url, public layout:Layout.MutableLayout) {
            console.log("Loading services from " + manifest.value)
            jQuery.get(manifest.value)
                .done((data, textStatus, jqXHR) => {

                    function parseJson(j): any {
                        try {
                            return jQuery.parseJSON(j)
                        } catch(error) {
                            console.error("Could not parse manifest: " + j)
                            throw error;
                        }
                    }

                    parseJson(jqXHR.responseText).services.forEach((s: Service) => {
                        layout.addService(s.name, false)
                        this.checkService(s.name, s.url);
                    });

                    layout.redraw();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.log("Failed to load service list from " + manifest.value + " due to " + textStatus);
                })
        }

        checkService(name:string, url:string) {
            console.log("Checking service " + name + " at " + url);

            this.layout.changeServiceStatus(name, Layout.Status.Checking);

            jQuery.ajax(url, { cache: false})
                .done((data, textStatus, jqXHR) => {
                    this.layout.changeServiceStatus(name, Layout.Status.Ok);
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.log("Service check for " + name + " failed: " + errorThrown);
                    this.layout.changeServiceStatus(name, Layout.Status.Err);
                })

            setTimeout(() => { this.checkService(name, url)}, 5000);
        }
    }
}


//
//    interface Service {
//        name: string;
//        url?: string;
//        vlan?: string;
//    }
//


//
//    export class Checker {
//
//        constructor(serviceListUrl: string, public layout: Layout.MutableLayout) {
//            console.log("Loading services from " + serviceListUrl)
//            d3.json(serviceListUrl, (error, graph) => {
//                if (error) {
//                    console.log("Failed to load service list from " + serviceListUrl + " due to " + error);
//                } else {
//                    graph.services.forEach((s) => {
//                        // TODO: Support for clustered services
//                        layout.addService(s.name, s.url, s.vlan)
//                        this.startServiceCheck(s.name, s.url);
//                    });
//                }
//            });
//        }
//
//        startServiceCheck(serviceName:string,url:string) {
//            var check = () => {
//                this.checkService(serviceName, url);
//            };
//
//            setInterval(check, 5000) // TODO Config setting
//        }
//
//        checkService(name:string, url:string) {
//            // TODO: Might not be necessary on proper response
//            var uncacheableURL = url + "?" + new Date().getTime()
//            console.log("Checking service " + name + " at " + uncacheableURL);
//
//            this.layout.changeServiceStatus(name, Layout.Status.Checking);
//
//            d3.json(uncacheableURL, (error, statusResponse) => {
//                if (error) {  // TODO: Get back an XMLHttpRequest, do something useful with it
//                    console.log("Service check for " + name + " failed: " + error);
//                    this.layout.changeServiceStatus(name, Layout.Status.Err);
//                } else {
//                    console.log("Service check for " + name + " succeeded");
//                    this.layout.changeServiceStatus(name, Layout.Status.Ok);
//
//                    // TODO: Handle plain 200 responses
//                    Object.keys(statusResponse).forEach((dependency) => {
//                        var id = name + '-' + dependency;
//
//                        this.layout.addService(dependency);
//                        this.layout.addConnection(id, name, dependency);
//
//                        var status = statusFromString(statusResponse[dependency].status);
//                        this.layout.changeConnectionStatus(id, status);
//                    });
//                }
//            });
//        }
//    }
//}