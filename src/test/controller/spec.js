// Controller specs
// (gets/sets application state, and delegates work to a layout manager object,
// used within route handlers)

//   - should get data from application state manager object
//   - should initialize views/models with relevant data received from application state manager
//   - should call layout manager with arguments including relevant views/data
//   - should receive data from view objects which publish change in view state
//   - should send data to application states collection when layout state changes

// Reference:
// https://github.com/velesin/jasmine-jquery
// https://github.com/pivotal/jasmine/wiki
// http://sinonjs.org/ | http://sinonjs.org/docs/


require.config({
    baseUrl: './',
    locale: 'en-us',
    paths: {

        // Libraries

        'json2'        : '/vendor/json2',
        'modernizr'    : '/vendor/modernizr',
        'requirejquery': '/vendor/require-jquery',
        'jquery'       : '/vendor/jquery-1.7.2.min',
        'zepto'        : '/vendor/zepto',
        'underscore'   : '/vendor/underscore',
        'mustache'     : '/vendor/mustache',
        'backbone'     : '/vendor/backbone',

        // Plugins

        // RequireJS
        'domready'     : '/vendor/domReady',
        'order'        : '/vendor/order',
        'text'         : '/vendor/text',

        // Touch events
        'touch'        : '/vendor/plugins/touch',

        // Vendor libs, packaged group of common dependencies
        'vendor'       : '/vendor',

        // Facade references to vendor / lirabry methods
        'facade'       : '/facade',

        // Utilities and libraries
        'utils'        : '/utils',
        
        // Backbone syncs depend on both vendor and utils
        'syncs'        : '/syncs',

        // Should be used as required dependencies with use of `define`, 
        'models'       : '/models',
        'views'        : '/views',
        'collections'  : '/collections',
        'controller'   : '/controller',

        // Packages

        'packages'     : '/packages',
        'chrome'       : '/packages/chrome',
        'products'     : '/packages/products',
        'hello'        : '/packages/hello',

        // Application - bootstrap for frontend app 
        'application'  : '/application'

    },
    priority: ['text', 'modernizr', 'json2', 'vendor', 'utils'],
    jquery: '1.7.2',
    waitSeconds: 10
});

require(['vendor', 'facade', 'models', 'collections', 'controller', 'views', 'utils'], 
function (vendor,   facade,   models,   collections,   Controller,   views,   utils) {

    var $ = vendor.$,
        _ = vendor._,
        docCookies = utils.docCookies,
        Backbone = vendor.Backbone,
        ApplicationStateModel = models.ApplicationStateModel,
        ApplicationStates = collections.ApplicationStates,
        BaseModel = models.BaseModel,
        EventModel = models.EventModel,
        BaseView = views.BaseView,
        SectionView = views.SectionView,
        LayoutView = views.LayoutView,
        events = collections.events,
        lib = utils.lib,
        Channel = lib.Channel,
        debug = utils.debug;

    describe("Dependencies", function() {

        it("should load jQuery, _ and Backbone from within vendor object using require", function () {
            expect($).toBeDefined();
            expect($).not.toBe(null);
            expect(_).toBeDefined();
            expect(_).not.toBe(null);
            expect(Backbone).toBeDefined();
            expect(Backbone).not.toBe(null);
        });

        it("should load vendor, models and utils reference objects with require", function () {
            expect(vendor).toBeDefined();
            expect(vendor).not.toBe(null);
            expect(models).toBeDefined();
            expect(models).not.toBe(null);
            expect(collections).toBeDefined();
            expect(collections).not.toBe(null);
            expect(utils).toBeDefined();
            expect(utils).not.toBe(null);
        });

        it('should load objects: ApplicationStateModel and ApplicationStates collection with require', function () {
            expect(ApplicationStateModel).toBeDefined();
            expect(ApplicationStateModel).not.toBeNull();
            expect(ApplicationStates).toBeDefined();
            expect(ApplicationStates).not.toBeNull();
        });

        it('should load objects: BaseModel, EventModel, BaseView, SectionView and LayoutView with require', function () {
            expect(BaseModel).toBeDefined();
            expect(BaseModel).not.toBeNull();
            expect(EventModel).toBeDefined();
            expect(EventModel).not.toBeNull();
            expect(BaseView).toBeDefined();
            expect(BaseView).not.toBeNull();
            expect(SectionView).toBeDefined();
            expect(SectionView).not.toBeNull();
            expect(LayoutView).toBeDefined();
            expect(LayoutView).not.toBeNull();
        });

    });

    describe("Controller", function () {

        beforeEach(function () {
            var appStates = new ApplicationStates();

            this.appStates = appStates;
            Controller.prototype.appStates = appStates;
        });

        afterEach(function () {
            delete this.appStates;
            delete Controller.prototype.appStates;
        });

        it("should get data from application state manager object", function () {
            // arrange
            var controller;

            this.appStates.add([
                // sessionStorage
                {
                    name: "/events", 
                    data: {
                        "header": { "state": "displayed", "meta": { "tab" : "Women" } }, 
                        "footer": { "state": "displayed", "meta": { "tab" : "Women" } },
                        "events": { "state": "displayed", "meta": { "tab" : "Women" } },
                        "upcoming": { "state": "displayed", "meta": { "tab" : "Women" } },
                        "route" : "/events"
                    }, 
                    storage: 'sessionStorage'
                }
            ]);

            // act
            controller = new Controller({
                route: "/events"
            });

            // assert
            expect(controller.data).not.toBeUndefined();
            expect(controller.data).not.toBeNull();
            expect(controller.data.route).toBe("/events");
            expect(controller.data.route).toBe(controller.route);
            expect(controller.data.header.state).toBe("displayed");
            expect(controller.data.footer.state).toBe("displayed");
            expect(controller.data.events.state).toBe("displayed");
            expect(controller.data.upcoming.state).toBe("displayed");
        });


        xit("should initialize views/models with relevant data received from application state manager", function () {
            // arrange
            var controller, eventsControllerCtor;

            this.appStates.add([
                // sessionStorage
                {
                    name: "/", 
                    data: {
                        "tab" : "home",
                        "route" : "/"
                    }, 
                    storage: 'sessionStorage'
                }
            ]);
            $('#wrapper').append('<div id="events"><div class="main"></div></div>');

            require(['events'], function(eventsController){
                eventsControllerCtor = eventsController;
            });

            waitsFor(function () {
                return eventsControllerCtor !== undefined;
            });

            runs(function () {
                // act
                controller = new eventsControllerCtor({
                    route: "/",
                    memeber: {member_id: 123456}
                });

                // assert
                expect(controller.data.route).toBe(controller.route);
                expect(controller.data.tab).toBe("home");
                expect($('#events header a.active')).toHaveClass("home");
            });

        });

        it("should call layout manager with arguments including relevant views/data", function () {
            // arrange
            var layout, controller, topModel, topView, bottomModel, bottomView,
                markup = $('#layoutScheme').html(), top, bottom;

            topModel = new BaseModel({desc: 'top view'});

            topView = new SectionView({
                name: "Top",
                destination: "#top",
                model: topModel,
                template: "<h1>{{desc}}</h1>",
                tagName: "section",
                className: "topView"
            });

            bottomModel = new BaseModel({desc: 'bottom view'});

            bottomView = new SectionView({
                name: "Bottom",
                destination: "#bottom",
                model: bottomModel,
                template: "<h2>{{desc}}</h2>",
                tagName: "section",
                className: "bottomView"
            });

            this.appStates.add([
                {
                    name: "/test/controller/", 
                    data: {
                        "Top" : { "state": "displayed" },
                        "Bottom" : { "state": "not-displayed" },
                        "route" : "/test/controller/"
                    }, 
                    storage: 'sessionStorage'
                }
            ]);

            // act
            controller = new Controller({
                route: "/test/controller/"
            });

            layout = new LayoutView({
                scheme: [topView, bottomView],
                destination: "#content",
                template: markup,
                displayWhen: "ready"
            }, controller);

            layout.render();

            top = layout.section('Top');
            bottom = layout.section('Bottom');

            // assert
            expect(top.isDisplayed()).toBeTruthy();
            expect(top.deferred.isResolved()).toBeTruthy();
            expect(bottom.isNotDisplayed()).toBeTruthy();
            expect(bottom.deferred.isResolved()).toBeTruthy();
        });

        it("should receive data from view objects which publish change in view state", function () {
            // arrange
            var layout, section, controller, sectionPubData = {};

            $('#wrapper').append('<section id="section">');

            // to test publishing of state changes in Section view
            Channel("Section:stateChanged").subscribe(function (lastState, state) {
                sectionPubData.lastState = lastState;
                sectionPubData.state = state;
            });

            section = new SectionView({
                name: "Section",
                destination: "#section-test",
                model: new BaseModel({ text : 'section heading here'}),
                template: "<h1>{{text}}</h1>",
                tagName: "section",
                className: "sectionView"
            });

            controller = new Controller({
                route: "/sectiontest"
            });

            layout = new LayoutView({
                scheme: [section],
                destination: "#section",
                template: '<div id="section-test"></div>',
                displayWhen: "resolved"
            }, controller);
            section.render();

            // act
            section.display(true);

            // assert
            expect($('#section').length).toBeTruthy();
            expect($('#section-test').length).toBeTruthy();
            expect($('#section-test .sectionView').length).toBeTruthy();

            // act
            section.display(false);

            // assert
            expect($('#section-test').length).toBeTruthy();
            expect($('#section-test .sectionView').length).toBeFalsy();
            expect(sectionPubData.lastState).toBeDefined();
            expect(sectionPubData.state).toBeDefined();
        });

        it("should send data to application states collection when layout state changes", function () {
            // arrange
            var layout, section, controller, stateData;

            $('#wrapper').append('<section id="storeViewState">');

            section = new SectionView({
                name: "StoreDataTest",
                destination: "#storeDataTest",
                model: new BaseModel({ text : 'store data test'}),
                template: "<h1>{{text}}</h1>",
                tagName: "section"
            });

            controller = new Controller({
                route: "/storeViewState"
            });

            layout = new LayoutView({
                scheme: [section],
                destination: "#storeViewState",
                template: '<div id="storeDataTest"></div>',
                displayWhen: "ready"
            }, controller);
            layout.render();

            // act
            stateData = controller.appStates.findByName("/storeViewState");
            debug.log(stateData);

            // assert
            expect(stateData).toBeTruthy();
            expect(stateData.get('data')['StoreDataTest'].state).toBe('displayed');
            expect(controller.getStoredState()['StoreDataTest'].state).toBe('displayed');
        });

    }); // describe

}); // require
