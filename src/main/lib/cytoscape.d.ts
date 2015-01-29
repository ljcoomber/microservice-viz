// TODO:  This is only a partial implementation
declare var cytoscape: Cy.CytoscapeInit

declare module Cy {

    interface CytoscapeInit {
        (init: CytoscapeParams): InitialisedCytoscape;
    }

    interface CytoscapeParams {
        container: HTMLElement
        style: Stylesheet[]
        layout: Layout
        ready: () => void
    }

    interface InitialisedCytoscape {
        $(sel: Selector): Elements
        elements: Elements
        layout(layout: Layout): void
        add(ele: ElementObj): ElementObj
        one(events:string, handler:(evt: any) => void): void
    }

    type Selector = string;

    interface Stylesheet {
        selector: string
        css: Css.ElementCss
    }

    interface Layout {
        name: string
        numIter?: number
        nodeOverlap?: number
        edgeElasticity?: number
        gravity?: number
    }

    interface Elements {
        css(css: Css.ElementCss): void
        length: number
    }

    interface ElementObj {
        group: string  //  'nodes' or 'edges'
        data: {
            id: string
            parent?: string
        }
        position?: {
            x: number
            y: number
        }
        selected?: boolean
        selectable?: boolean
        locked?: boolean
        grabbable?: boolean
        classes?: string
        css?: Css.ElementCss
    }

    export module Css {

        type Colour = string;

        // TODO: How to constrain to a value?
        type Shape = string; // 'rectangle', 'roundrectangle', 'ellipse', 'triangle', pentagon, hexagon, heptagon, octagon, star

        // TODO: How to constrain to a value?
        type Style = string; // solid, dotted, dashed, or double

        export interface NodeCss {
            width?: number
            height?: number
            shape?: Shape
            "background-color"?: Colour
            "background-blacken"?: number
            "background-opacity"?: number
            "border-width"?: number
            "border-style"?: Style
            "border-color"?: Colour
            "border-opacity"?: number
        }

        export interface CompoundNodeCss extends NodeCss {
            "padding-left"?: string
            "padding-right"?: string
            "padding-top"?: string
            "padding-bottom"?: string
        }

        export interface ElementCss extends NodeCss, CompoundNodeCss {}
    }
}