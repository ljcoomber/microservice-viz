///<reference path="../lib/jasmine.d.ts" />
///<reference path="../../main/lib/jquery.d.ts" />
///<reference path="../../main/lib/lodash.d.ts" />
///<reference path="../../main/typescript/app.ts" />

describe("Microservice Viz End to End test", () => {

    var booted;

    beforeAll((done) => {
        $.ajaxSetup({
            'timeout': 100
        });

        $(document.body).append($('<div id="cy" />'));
        booted = boot(new Url('src/test/resources/manifest.json'));

        waitUntil(() => { return booted.layoutStopped; },
            () => {
                throw "Timeout out waiting for diagram to settle"
            },
            () => { done() })
    });

    it("should display services loaded from the manifest", () => {
        expect(booted.cy.nodes('#a,#b,#c,#d,#e,#f').length).toBe(6)
    });

    it("should indicate healthy services", () => {
        booted.cy.nodes('#a,#b').forEach( n => {
            expect(n.css().backgroundColor).toBe('green')
            expect(n.css().borderColor).toBe('green')
        })
    });

    it("should indicate services which respond but are unhealthy", () => {
        booted.cy.nodes('#c,#d').forEach( n => {
            expect(n.css().backgroundColor).toBe('red')
            expect(n.css().borderColor).toBe('green')
        })
    });

    it("should indicate services which cannot be reached", () => {
        booted.cy.nodes('#e,#f').forEach( n => {
            expect(n.css().backgroundColor).toBe('red')
            expect(n.css().borderColor).toBe('red')
        })
    });

    it("should display services loaded from other service responses", () => {
        expect(booted.cy.nodes('#a1,#c1,#c2').length).toBe(3)
    })

    it("should indicate services loaded from other service responses are not checked", () => {
        booted.cy.nodes('#a1,#c1,#c2').forEach( n => {
            expect(n.css().backgroundColor).toBe('white')
            expect(n.css().borderColor).toBe('gray')
        })
    });

    it("should indicate transitive dependencies that are healthy", () => {
        booted.cy.edges('#a-b,#a-c,#a-a1,#c-c1').forEach( e => {
            expect(e.css().lineColor).toBe('green')
        })
    });

    it("should indicate transitive dependencies that are unhealthy", () => {
        booted.cy.edges('#c-c2').forEach( e => {
            expect(e.css().lineColor).toBe('red')
        })
    });
})

function waitUntil(testFunc: () => boolean, failureThunk: () => void, successCallback = () => {},
                   intervalMillis = 500, numberOfIntervals = 200): void {
    if(numberOfIntervals <= 0) {
        failureThunk();
    } else {
        if(!testFunc()) {
            _.delay(waitUntil, intervalMillis, testFunc, failureThunk, successCallback, intervalMillis, numberOfIntervals - 1);
        } else {
            successCallback();
        }
    }
}
