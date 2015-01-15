///<reference path="../lib/jquery.d.ts" />
///<reference path="layout.ts" />

module Service {

    interface Service {
        name: string;
        url: string;
    }

    function statusFromString(status:string) {
        switch (status) {
            case "Ok":
                return Layout.Status.Ok;
                break;
            case "Err":
                return Layout.Status.Err;
                break
            default:
                console.error("Cannot parse status: " + status);
                return Layout.Status.Unknown;
        }
    }

    export class Checker {

        constructor(manifest:Url, public layout:Layout.MutableLayout) {
            function parseJson(j): any {
                try {
                    return jQuery.parseJSON(j)
                } catch(error) {
                    console.error("Could not parse content: " + j)
                    throw error;
                }
            }

            console.log("Loading services from " + manifest.value)
            jQuery.ajax(manifest.value, { cache: false })
                .done((data, textStatus, jqXHR) => {
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

        handleStatusResponse(service, data) {
            function parseJson(j): any {
                try {
                    return jQuery.parseJSON(j)
                } catch(error) {
                    console.info("Could not parse service response: " + j)
                }
            }

            if(data) {
                var dataObj = parseJson(data);
                if(dataObj) {
                    Object.keys(dataObj).forEach((dependency) => {
                        var id = service + '-' + dependency;

                        this.layout.addService(dependency);
                        this.layout.addConnection(id, service, dependency);

                        var status = statusFromString(dataObj[dependency].status);
                        this.layout.changeConnectionStatus(id, status);
                    });
                }
            }
        }

        checkService(name:string, url:string) {
            console.log("Checking service " + name + " at " + url);

            this.layout.changeServiceStatus(name, Layout.Status.Checking);

            jQuery.ajax(url, { cache: false })
                .done((data, textStatus, jqXHR) => {
                    this.layout.changeServiceStatus(name, Layout.Status.Ok);
                    this.handleStatusResponse(name, jqXHR.responseText)
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    if(jqXHR.status > 0) {
                        this.layout.changeServiceStatus(name, Layout.Status.Err);
                        this.handleStatusResponse(name, jqXHR.responseText)
                    } else {
                        this.layout.changeServiceStatus(name, Layout.Status.CannotConnect);
                    }
                })

            // TODO: Enable when out of dev
            //setTimeout(() => { this.checkService(name, url)}, 5000);
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