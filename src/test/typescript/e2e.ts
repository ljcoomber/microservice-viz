///<reference path="../lib/jasmine.d.ts" />
///<reference path="../lib/jquery.d.ts" />
///<reference path="../../main/lib/lodash.d.ts" />
///<reference path="../../main/typescript/app.ts" />

describe("Microservice Viz End to End test", () => {

    var booted;

    beforeEach((done) => {
        $(document.body).append($('<div id="cy" />'));
        booted = boot(new Url('src/test/resources/manifest.json'));

        waitUntil(() => { return booted.cy.elements('node').length == 5; },
            () => { throw "Timeout out waiting for diagram to settle" },
            () => { done() })
    });

    it("should draw the correct number of nodes", () => {
        expect(booted.cy.elements('node').length).toBe(5)
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
