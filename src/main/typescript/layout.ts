///<reference path="../lib/cytoscape.d.ts" />

module Layout {

    export enum Status {
        Unknown,
        Checking,
        Err,
        Ok
    }

    var STYLE = [
        {
            selector: 'node',
            css: {
                'content': 'data(id)',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-family': 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif',
                'font-size': '8px',
                'border-width': 2,
                'border-color': 'gray',
                'background-color': 'white',
                'shape': 'roundrectangle'
            }
        }];

    export interface MutableLayout {
        cy;

        addService(id:string, redraw?: boolean): void;
        redraw(): void;
    }

    export function cose(readyThunk: () => void): MutableLayout {
        return new Cose.CoseLayout(readyThunk);
    }

    module Cose {

        function layout() {
            return {
                name: 'cose'
            }
        }

        export class CoseLayout implements MutableLayout {
            cy;

            constructor(readyThunk:() => void) {
                this.cy = cytoscape({
                    container: document.getElementById('cy'),
                    ready: () => {
                        console.log("Cytoscape initialised");
                        readyThunk();
                    },
                    style: //noinspection BadExpressionStatementJS
                        STYLE,
                    layout: layout()
                });
            }

            addService(id:string, redraw:boolean = true):void {
                var exists = this.cy.$('#' + id).length > 0;
                if (!exists) {
                    var width = id.length * 9   // Very crude width calculation
                    this.cy.add({
                        group: "nodes",
                        css: {width: width},
                        data: {id: id},
                        position: {x: 100, y: 100}
                    });

                    if(redraw) this.cy.layout(layout());
                }
            }

            redraw() {
                this.cy.layout(layout());
            }
        }
    }
}