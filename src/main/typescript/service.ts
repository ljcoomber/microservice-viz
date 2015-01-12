// Used for loading JSON, TODO: use something else
///<reference path="../lib/d3.d.ts" />
///<reference path="layout.ts" />


module Service {

    interface Service {
        name: string;
    }

    export class Checker {

        pendingFirstChecks:Array<Service> = [];

        constructor(manifest:Url, public layout:Layout.MutableLayout) {
            console.log("Loading services from " + manifest.value)
            d3.json(manifest.value, (error, graph) => {
                if (error) {
                    console.log("Failed to load service list from " + manifest.value + " due to " + error);
                } else {
                    graph.services.forEach((s:Service) => {
                        layout.addService(s.name, false)
                        this.pendingFirstChecks.push(s)
                    });
                }

                layout.redraw();
            });
        }
    }
}