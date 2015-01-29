///<reference path="../lib/cytoscape.d.ts" />
///<reference path="model.ts" />

module Layout {

    var STYLE: Cy.Stylesheet[] = [
        {
            selector: "node",
            css: {
                "content": "data(id)",
                "text-valign": "center",
                "text-halign": "center",
                "font-family": "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
                "font-size": "8px",
                "border-width": 2,
                "shape": "roundrectangle",
                "padding-top": "10px",
                "padding-left": "10px",
                "padding-bottom": "10px",
                "padding-right": "10px"
            }
        },
        {
            selector: ".network",
            css: {
                "text-valign": "top",
                "border-color": "gray",
                "background-color": "white"
            }
        },
        {
            selector: ".serviceInstance",
            css: {
                "text-valign": "center",
                "border-color": "darkgray",
                "background-color": "white"
            }
        },
        {
            selector: ".logicalService",
            css: {
                "text-valign": "top",
                "border-color": "lightgray",
                "background-color": "lightgray"
            }
        },
        {
            selector: ".remoteInstance",
            css: {
                "border-color": "lightgray",
                "background-color": "lightgray"
            }
        },
        {
            selector: "edge",
            css: {
                "target-arrow-shape": "triangle",
                "line-color": "grey",
                "target-arrow-color": "grey"
            }
        }];

    export interface MutableLayout {
        cy;
        layoutStopped: boolean;
        addService(service: Service, redraw?: boolean): void;
        changeServiceStatus(id: ServiceId, status:Status): void;
        addConnection(connection: Connection): void;
        changeConnectionStatus(id: ConnectionId, status:Status): void;
    }

    export function cose(ready: Thunk): MutableLayout {
        return new CoseLayout(ready);
    }

    module Graph {
        export function addIfNotExists(cy:Cy.InitialisedCytoscape, id:string, defn:Cy.ElementObj): boolean {
            var exists = cy.$(`#${id}`).length > 0;
            if(!exists) {
                cy.add(defn)
            }

            var added = !exists
            return added;
        }

        export function addNode(cy:Cy.InitialisedCytoscape, id:string, parent:string, classes:string, restrictWidth:boolean):boolean {
            var width = id.length * 9   // Very crude width calculation
            var css = restrictWidth && {width: width} || {};

            return addIfNotExists(cy, id, {
                group: "nodes",
                css: css,
                data: {id: id, parent: parent},
                position: {x: 100, y: 100},
                classes: classes
            });
        }
    }

    class CoseLayout implements MutableLayout {
        cy: Cy.InitialisedCytoscape;

        layoutStopped = false;

        constructor(ready:Thunk) {
            this.cy = cytoscape({
                container: document.getElementById("cy"),
                ready: () => {
                    console.log("Cytoscape initialised");
                    this.cy.one("layoutstop", () => {
                        this.layoutStopped = true;
                    });
                    ready();
                },
                style: STYLE,
                layout: this.layout()
            });
        }

        layout(): Cy.Layout {
            return {
                name: "cose",
                numIter: 10000,
                nodeOverlap: 20,
                edgeElasticity: 10000,
                gravity: 500
            }
        }

        addNetwork(id:NetworkId):void {
            Graph.addIfNotExists(this.cy, id, {group: "nodes", data: {id: id}, classes: "network"});
        }

        addService(service:Service):void {
            this.addNetwork(service.network);

            // Typescript doesn't support parameter type overloading :-(
            if(service instanceof LogicalService) {
                Graph.addNode(this.cy, service.id, service.network, "logicalService", false);
                _.map(service.instances, (instance) => {
                    Graph.addNode(this.cy, instance.id, service.id, "serviceInstance", true)
                });
            }
            else if(service instanceof ServiceInstance) {
                var parent = service.logicalService ? service.logicalService.id : service.network;
                Graph.addNode(this.cy, service.id, parent, "serviceInstance", true);
            }
            else if(service instanceof RemoteInstance) {
                var added = Graph.addNode(this.cy, service.id, service.network, "remoteInstance", true);

                // Only redraw after remote instances to minimise refreshes
                // TODO: This is a dangerous hack relying on HTTP responses with remote instances coming in after
                // the manifest has been added. Find a way of doing incremental and therefore cheaper redraws
                if(added) this.redraw()
            }
        }

        addConnection(conn:Connection):void {
            Graph.addIfNotExists(this.cy, conn.id(), {group: "edges", data: { id: conn.id(), source: conn.source.id, target: conn.target.id }});
        }

        changeServiceStatus(id:ConnectionId, status:Status):void {
            function determineCss(): Cy.Css.NodeCss {
                function colours(border:string, background:string): Cy.Css.NodeCss {
                    return {"border-color": border, "background-color": background};
                }

                switch (status) {
                    case Status.Unknown: return colours("white", "white");
                    case Status.Checking: return {"border-color": "gray"};
                    case Status.Ok: return colours("green", "green");
                    case Status.Err: return colours("green", "red");
                    case Status.CannotConnect: return colours("red", "red");
                    default:
                        console.error(`Cannot parse status: ${status}`);
                        return colours("white", "white");
                }
            }

            var css = determineCss();
            this.cy.$(`#${id}`).css(css);
        }

        changeConnectionStatus(id:string, status:Status):void {
            function colours(colour:string) {
                return { "line-color": colour, "target-arrow-color": colour, "source-arrow-color": colour };
            }

            function determineCss() {
                switch (status) {
                    case Status.Unknown: return colours("lightgray");
                    case Status.Checking: return colours("gray");
                    case Status.Ok: return colours("green");
                    case Status.Err: return colours("red");
                    default:
                        console.error(`Cannot parse status: ${status}`);
                        return colours("lightgray");
                }
            }

            this.cy.$(`#${id}`).css(determineCss());
        }

        redraw() {
            this.cy.layout(this.layout());
        }
    }
}