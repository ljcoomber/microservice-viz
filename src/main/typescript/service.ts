///<reference path="../lib/lodash.d.ts" />
///<reference path="../lib/jquery.d.ts" />
///<reference path="model.ts" />
///<reference path="layout.ts" />

module Service {

    function unmarshall(obj: any): Service {
        if(!obj.id) throw `Service must have an ID: ${JSON.stringify(obj)}`;

        if(obj.instances) {
            return new LogicalService(obj.id, obj.instances, obj.network)
        }
        else if(obj.url) {
            return new ServiceInstance(obj.id, obj.url, null, obj.network);
        }
        else {
            throw `Couldn't parse service: ${JSON.stringify(obj)}`;
        }
    }


    function statusFromString(status:string) {
        switch (status) {
            case "Ok": return Status.Ok;
            case "NotOk": return Status.Err;
            default:
                console.error(`Cannot parse status: ${status}`);
                return Status.Unknown;
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
                    parseJson(jqXHR.responseText).services.forEach((obj) => {
                        var service = unmarshall(obj);
                        layout.addService(service, false);

                        if(service instanceof LogicalService) {
                            _.map(service.instances, (instance) => {
                                this.checkService(instance.id, instance.url);
                            });
                        }
                        else if(service instanceof ServiceInstance) {
                            this.checkService(service.id, service.url);
                        }
                        else {
                            throw `Unexpected type back from service ${JSON.stringify(obj)}`;
                        }
                    });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.log(`Failed to load service list from ${manifest} due to ${textStatus}`);
                })
        }

        handleStatusResponse(service: ServiceId, data) {
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
                    Object.keys(dataObj).forEach((dependency: ServiceId) => {
                        var remote = new RemoteInstance(dependency);
                        var conn = new Connection({ id: service }, remote);
                        this.layout.addService(remote);
                        this.layout.addConnection(conn);

                        var status = statusFromString(dataObj[dependency].status);
                        this.layout.changeConnectionStatus(conn.id(), status);
                    });
                }
            }
        }

        checkService(service:ServiceId, url:Url) {
            console.log(`Checking service ${name} at ${url}`);

            this.layout.changeServiceStatus(service, Status.Checking);

            jQuery.ajax(url, { cache: false })
                .done((data, textStatus, jqXHR) => {
                    this.layout.changeServiceStatus(service, Status.Ok);
                    this.handleStatusResponse(service, jqXHR.responseText)
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    if(jqXHR.status > 0) {
                        this.layout.changeServiceStatus(service, Status.Err);
                        this.handleStatusResponse(service, jqXHR.responseText)
                    } else {
                        this.layout.changeServiceStatus(service, Status.CannotConnect);
                    }
                })

            // TODO: Enable when out of dev
            //setTimeout(() => { this.checkService(name, url)}, 5000);
        }
    }
}