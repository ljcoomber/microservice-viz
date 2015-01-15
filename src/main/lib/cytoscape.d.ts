// TODO: Fill in the 'any' types
declare var cytoscape: Cy.CytoscapeInit

declare module Cy {

    interface CytoscapeInit {
        (CytoscapeStatic): CytoscapeStatic;
    }

    interface CytoscapeStatic {
        container: Element
        style: Stylesheet
        layout: Layout
        ready: ReadyFunc
        $: any
    }

    interface Stylesheet {
        selector: string
        css: any
    }

    interface Layout {
        name: string
    }

    interface ReadyFunc {
        (any): void
    }
}