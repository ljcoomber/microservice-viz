///<reference path="../lib/jquery.d.ts" />
///<reference path="layout.ts" />

module Service {

    interface Service {
        name: string;
        url: string;
        network?: string;
    }

    function statusFromString(status:string) {
        switch (status) {
            case "Ok":
                return Layout.Status.Ok;
                break;
            case "NotOk":
                return Layout.Status.Err;
                break
            default:
                console.error(`Cannot parse status: ${status}`);
                return Layout.Status.Unknown;
        }
    }

    export class Checker {

        constructor(manifest:Url, public layout:Layout.MutableLayout) {
            function parseJson(j): any {
                try {
                    return jQuery.parseJSON(j)
                } catch(error) {
                    console.error(`Could not parse content: ${j}`)
                    throw error;
                }
            }

            console.log(`Loading services from ${manifest}`)
            jQuery.ajax(manifest, { cache: false })
                .done((data, textStatus, jqXHR) => {
                    parseJson(jqXHR.responseText).services.forEach((s: Service) => {
                        layout.addService(s.name, s.network, false);
                        this.checkService(s.name, s.url);
                    });

                    layout.redraw();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.log(`Failed to load service list from ${manifest} due to ${textStatus}`);
                })
        }

        handleStatusResponse(service, data) {
            function parseJson(j): any {
                try {
                    return jQuery.parseJSON(j)
                } catch(error) {
                    console.info(`Could not parse service response: ${j}`)
                }
            }

            if(data) {
                var dataObj = parseJson(data);
                if(dataObj) {
                    Object.keys(dataObj).forEach((dependency) => {
                        var id = `${service}-${dependency}`;

                        this.layout.addService(dependency);
                        this.layout.addConnection(id, service, dependency);

                        var status = statusFromString(dataObj[dependency].status);
                        this.layout.changeConnectionStatus(id, status);
                    });
                }
            }
        }

        checkService(name:string, url:string) {
            console.log(`Checking service ${name} at ${url}`);

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