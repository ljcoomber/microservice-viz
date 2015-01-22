///<reference path="../lib/cytoscape.d.ts" />

module Layout {

    export enum Status {
        Unknown,
        Checking,
        CannotConnect,
        Err,
        Ok
    }

    var STYLE = [
        {
            selector: "node",
            css: {
                "content": "data(id)",
                "text-valign": "center",
                "text-halign": "center",
                "font-family": "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
                "font-size": "8px",
                "border-width": 2,
                "border-color": "gray",
                "background-color": "white",
                "shape": "roundrectangle"
            }
        },
        {
            selector: "$node > node",
            css: {
                "padding-top": "10px",
                "padding-left": "10px",
                "padding-bottom": "10px",
                "padding-right": "10px",
                "text-valign": "top",
                "text-halign": "center",
                "border-color": "gray",
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
        addService(id:string, network?:string, redraw?: boolean): void;
        changeServiceStatus(id:string, status:Status): void;
        addConnection(id:string, source:string, target:string): void;
        changeConnectionStatus(id:string, status:Status): void;
        redraw(): void;
    }

    export function cose(ready: Thunk): MutableLayout {
        return new Cose.CoseLayout(ready);
    }

    module Cose {

        function layout() {
            return {
                name: "cose",
                numIter: 10000,
                nodeOverlap: 20,
                edgeElasticity: 10000,
                gravity: 500
            }
        }

        export class CoseLayout implements MutableLayout {
            cy;

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
                    style: //noinspection BadExpressionStatementJS
                        STYLE,
                    layout: layout()
                });
            }

            addIfNotExists(id:string, data, render:boolean): boolean {
                var exists = this.cy.$(`#${id}`).length > 0;
                if(!exists) {
                    this.cy.add(data)
                    if(render) this.cy.elements().layout(layout());
                }

                return exists
            }

            addNetwork(id:string):void {
                this.addIfNotExists(id, {group: "nodes", data: {id: id}}, false);
            }

            addService(id:string, network:string = "external", redraw:boolean = true):void {
                var exists = this.cy.$(`#${id}`).length > 0;
                if (!exists) {
                    this.addNetwork(network);

                    var width = id.length * 9   // Very crude width calculation
                    this.cy.add({
                        group: "nodes",
                        css: {width: width},
                        data: {id: id, parent: network},
                        position: {x: 100, y: 100}
                    });

                    if(redraw) this.cy.layout(layout());
                }
            }

            addConnection(id:string, source:string, target:string):void {
                this.addIfNotExists(id, {group: "edges", data: {id: id, source: source, target: target}}, true);
            }

            changeServiceStatus(id:string, status:Status):void {
                function determineCss() {
                    switch (status) {
                        case Layout.Status.Unknown:
                            return {"border-color": "white", "background-color": "white"};
                            break;
                        case Layout.Status.Checking:
                            return {"border-color": "gray"};
                            break;
                        case Layout.Status.Ok:
                            return {"border-color": "green", "background-color": "green"};
                            break;
                        case Layout.Status.Err:
                            return {"border-color": "green", "background-color": "red"};
                            break
                        case Layout.Status.CannotConnect:
                            return {"border-color": "red", "background-color": "red"};
                            break
                        default:
                            console.error(`Cannot parse status: ${status}`);
                            return {"border-color": "white", "background-color": "white"};
                    }
                }

                var css = determineCss();
                this.cy.$(`#${id}`).css(css);
            }

            changeConnectionStatus(id:string, status:Status):void {
                function determineCss() {
                    switch (status) {
                        case Layout.Status.Unknown:
                            return { "line-color": "lightgray", "target-arrow-color": "lightgray", "source-arrow-color": "lightgray" };
                            break;
                        case Layout.Status.Checking:
                            return { "line-color": "gray", "target-arrow-color": "gray", "source-arrow-color": "gray" };
                            break;
                        case Layout.Status.Ok:
                            return { "line-color": "green", "target-arrow-color": "green", "source-arrow-color": "green" };
                            break;
                        case Layout.Status.Err:
                            return { "line-color": "red", "target-arrow-color": "red", "source-arrow-color": "red" };
                            break
                        default:
                            console.error(`Cannot parse status: ${status}`);
                            return { "line-color": "lightgray", "target-arrow-color": "lightgray", "source-arrow-color": "lightgray" };
                    }
                }

                var css = determineCss();
                this.cy.$(`#${id}`).css(css);
            }

            redraw() {
                this.cy.layout(layout());
            }
        }
    }
}