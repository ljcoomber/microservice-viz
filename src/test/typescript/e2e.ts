///<reference path="../lib/jasmine.d.ts" />
//////<reference path="../lib/jquery.d.ts" />
///<reference path="../../main/typescript/app.ts" />

declare var $
declare var jQuery

describe("Microservice Viz End to End test", () => {

    var booted;

    beforeEach(() => {
        $(document.body).append($('<div id="content" />'));
        booted = boot();
    });

    it("should capture the return value of boot", () => {
        expect(booted).toContain("Hello World")
    });

})