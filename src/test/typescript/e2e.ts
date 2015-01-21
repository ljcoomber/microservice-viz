///<reference path="../lib/jasmine.d.ts" />
///<reference path="../../main/lib/jquery.d.ts" />
///<reference path="../../main/lib/lodash.d.ts" />
///<reference path="../../main/typescript/app.ts" />

describe("Microservice Viz End to End test", () => {

    var booted;

    beforeAll((done) => {
        $.ajaxSetup({
            "timeout": 100
        });

        $(document.body).append($('<div id="cy" />'));
        booted = boot("src/test/resources/manifest.json");

        waitUntil(() => { return booted.layoutStopped; },
            () => {
                throw "Timeout out waiting for diagram to settle"
            },
            () => { done() })
    });

    it("should display services loaded from the manifest", () => {
        var serviceNodes = booted.cy.filter((i, el) => {
           return el.isNode() && _.contains(el.id(), "service-")
        });

        expect(serviceNodes.length).toBe(7)
    });

    it("should indicate healthy services", () => {
        booted.cy.nodes("#service-a,#service-b").forEach( n => {
            expect(n.css().backgroundColor).toBe("green")
            expect(n.css().borderColor).toBe("green")
        })
    });

    it("should indicate services which respond but are unhealthy", () => {
        booted.cy.nodes("#service-c,#service-d").forEach( n => {
            expect(n.css().backgroundColor).toBe("red")
            expect(n.css().borderColor).toBe("green")
        })
    });

    it("should indicate services which cannot be reached", () => {
        booted.cy.nodes("#service-e").forEach( n => {
            expect(n.css().backgroundColor).toBe("red")
            expect(n.css().borderColor).toBe("red")
        })
    });

    it("should display services loaded from other service responses", () => {
        expect(booted.cy.nodes("#service-f,#service-g").length).toBe(2)
    })

    it("should indicate services loaded from other service responses are not checked", () => {
        booted.cy.nodes("#service-f,#service-g").forEach( n => {
            expect(n.css().backgroundColor).toBe("white")
            expect(n.css().borderColor).toBe("gray")
        })
    });

    it("should indicate transitive dependencies that are healthy", () => {
        booted.cy.edges("#service-a-service-b,#service-a-service-c,#service-a-service-f,#service-c-service-g").forEach( e => {
            expect(e.css().lineColor).toBe("green")
        })
    });

    it("should indicate transitive dependencies that are unhealthy", () => {
        booted.cy.edges("#service-c-service-e").forEach( e => {
            expect(e.css().lineColor).toBe("red")
        })
    });

    it("should place services in the manifest in their defined networks", () => {
        booted.cy.nodes("#service-a,#service-b").forEach(n => {
            expect(n.data("parent")).toBe("vlan-1");
        })

        booted.cy.nodes("#service-c,#service-d,#service-e").forEach(n => {
            expect(n.data("parent")).toBe("vlan-2");
        })
    });

    it("should place services without a defined network in an external network", () => {
        booted.cy.nodes("#service-f,#service-g").forEach( n => {
            expect(n.data("parent")).toBe("external");
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
