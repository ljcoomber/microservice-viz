///<reference path="../lib/jasmine.d.ts" />
///<reference path="../../main/lib/jquery.d.ts" />
///<reference path="../../main/lib/lodash.d.ts" />
///<reference path="../../main/typescript/app.ts" />

describe("Microservice Viz End to End test", () => {

    var booted;

    beforeAll((done) => {
        $(document.body).append($('<div id="cy" />'));
        booted = boot(new Url('src/test/resources/manifest.json'));

        waitUntil(() => { return booted.layoutStopped; },
            () => {
                throw "Timeout out waiting for diagram to settle"
            },
            () => { done() })
    });

    it("should draw the correct number of nodes", () => {
        expect(booted.cy.nodes().length).toBe(5)
    });

    it("should correctly colour good and bad nodes", () => {
        var colours = _.groupBy(booted.cy.nodes(), (n: any) => n.css('background-color'))
        expect(colours['red'].length).toBe(2);
        expect(colours['green'].length).toBe(3);
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
