/**
 * Angular controller to set and update the form to enter the actual power 
 * meter reading.
 *
 * Copyright (c) 2013-2014 Thomas Malt
 *
 * @author Thomas Malt <thomas@malt.no>
 * @copyright Thomas Malt <thomas@malt.no>
 */

var apihost = "https://api.malt.no";
var powerApp = angular.module('powerApp', ['ngTouch', 'ui.bootstrap']);

powerApp.controller('PowerCtrl', function ($scope, $http, $interval) {
    $scope.meterTotal          = 0;
    $scope.meterTotalWithDelta = 0.0;
    $scope.meterTotalTimestamp = 0;
    $scope.kwhYesterday        = 0;
    $scope.kwhToday            = 0;

    power.initialize();

    $scope.updateGraphs = function (e) {
        console.log("Got event " + e.type, e);

        var usage = angular.element(document.getElementById("usage-chart-now-body"));

        $http.get(apihost + "/power/meter/total").then(function (result) {
            var value = result.data.value;
            var delta = result.data.delta;

            $scope.meterTotal          = value;
            $scope.meterTotalWithDelta = (value + parseFloat(delta)).toFixed(2);
            $scope.meterTotalTimestamp = result.data.timestamp;
        });

        $http.get(apihost + "/power/kwh/day/1").then(function (res) {
            $scope.kwhYesterday = res.data.items[0].kwh.toFixed(2);
        });

        $http.get(apihost + "/power/kwh/today").then(function (res) {
            $scope.kwhToday = res.data.kwh.toFixed(2);
        });

        $http.get(apihost + "/power/kwh/hour/73").then(power.kwh.day.hour.draw);
        $http.get(apihost + "/power/watts/10").then(power.watt.now.draw);
        $http.get(apihost + "/power/watts/hour").then(power.watt.hour.draw);
        $http.get(apihost + "/power/kwh/day/62").then(power.kwh.month.day.draw);
    };

    var $w = angular.element(window);
    $w.on("pageshow",          $scope.updateGraphs);
    $w.on("orientationchange", $scope.updateGraphs);
    
    var stopWattNow = $interval(function () {
        $http.get(apihost + "/power/watts/10").then(power.watt.now.draw);
    }, 1000);

    var stopKwhDayHour = $interval(function () {
        $http.get(apihost + "/power/kwh/hour/73").then(power.kwh.day.hour.draw);
    }, 5*60*1000);

    var stopWattHour = $interval(function () {
        $http.get(apihost + "/power/watts/hour").then(power.watt.hour.draw);
    }, 6000);

    /**
     * Updates the metertotal with delta field every ten seconds
     */
    var stopMeter = $interval(function () {
        // console.log("Told to fetch meter/total as part of interval");
        $http.get(apihost + "/power/meter/total").then(function (res) {
            var value = res.data.value;
            var delta = res.data.delta;
            var time  = res.data.timestamp;

            var deltaInt = parseInt(parseFloat(delta).toFixed(2));
            var deltaDec = parseFloat((delta-deltaInt));
            var totDelta = value + deltaInt;

            console.log("got meter total: ", res, deltaInt, totDelta, 
                deltaDec.toFixed(2)
            );

            $scope.meterTotalWithDelta = (value + parseFloat(delta)).toFixed(2);
            $scope.meterTotalTimestamp = time;
        });
    }, 1000);

    var stopKwhToday = $interval(function () {
        $http.get(apihost + "/power/kwh/today").then(function (res) {
            $scope.kwhToday = res.data.kwh.toFixed(2);
        });
    }, 60000);

    /**
     * Form handler for the meter input field
     */
    $scope.setMeter = function ($event) {
        var data  = {"value": $scope.meterTotal};
        console.log("got told to set meter: ", data, $event);
        $http.put(apihost + "/power/meter/total", data).then(function(res) {
            $scope.meterTotal          = res.data.value;
            $scope.meterTotalWithDelta = parseFloat(res.data.value).toFixed(2);
            $scope.meterTotalTimestamp = res.data.timestamp;
        });


        var formEl  = document.getElementById("set-meter-container");
        var meterEl = document.getElementById("meter-total-container");
        var rowEl   = document.getElementById("totals-summary-row");

        var form  = angular.element(formEl);
        var meter = angular.element(meterEl);
        var row   = angular.element(rowEl);

        form.addClass("hidden");
        meter.removeClass("hidden");
        row.removeClass("hidden");

    };

    $scope.handleTotalClick = function (e) {
        var formEl  = document.getElementById("set-meter-container");
        var meterEl = document.getElementById("meter-total-container");
        var inputEl = document.getElementById("meter-value");
        var rowEl   = document.getElementById("totals-summary-row");

        var form  = angular.element(formEl);
        var meter = angular.element(meterEl);
        var input = angular.element(inputEl);
        var row   = angular.element(rowEl);

        input.attr("value", $scope.meterTotalWithDelta);
        form.removeClass("hidden");
        meter.addClass("hidden");
        row.addClass("hidden");
    };

    $scope.handleTotalCancel = function (e) {
        var formEl  = document.getElementById("set-meter-container");
        var meterEl = document.getElementById("meter-total-container");
        var rowEl   = document.getElementById("totals-summary-row");

        var form  = angular.element(formEl);
        var meter = angular.element(meterEl);
        var row   = angular.element(rowEl);

        form.addClass("hidden");
        meter.removeClass("hidden");
        row.removeClass("hidden");
    };
});


powerApp.controller('NavbarCtrl', function ($scope, $http, $interval) {
    $scope.handleSignIn = function (r) {
        console.log("got handle sign in: ", r);
        button = angular.element(r.button);
        button.css("display", "none");
        var uri    = "https://www.googleapis.com/plus/v1/people/me";
        var access = "?access_token=" + r.result.access_token;
        
        $http.get(uri + access).then(function (res) { 
            console.log("got result from googleapi: ", res);

            var person = angular.element(document.createElement("div"));
            // person.text(res.data.displayName);
            var img = angular.element(document.createElement("img"));
            img.attr("src", res.data.image.url); 
            img.css({
                "height": "32px",
                "width": "32px",
                "box-shadow": "0 1px 0px rgba(0, 0, 0, 0.75)",
                "margin-left": "6px"
            });

            person.append(
                '<ul style="display: inline-block; list-style: none; padding-left: 6px"><li>' + 
                res.data.displayName +
                "</li>" +
                "<li>Sign out</li>"
            );

            person.append(img);
            var p = document.getElementById("google-signin");
            p = angular.element(p);
            p.append(person);
        });
    };
});

var googleHelper = {
 // https://www.googleapis.com/plus/v1/people/me?key={YOUR_API_KEY}

};

function signinCallback (result) {
    if (result.status.signed_in == true) {
        var button = document.getElementById("signinButton");
        var scope  = angular.element(button).scope();
        
        console.log("have i got scope: ", scope);
        scope.handleSignIn({'button': button, 'result': result});

        // button.setAttribute('style', 'display: none');
    }
    else {
        console.log("Got error: ", result.error);
    }
}

