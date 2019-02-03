var app = angular.module('myApp',[]);

app.controller('myCtrl', function($scope) {
    // Set initial variables in angularjs $scope object:
    $scope.myCostOfLiving = 100;
    $scope.myEstimatedYears = 5;
    $scope.annualInflationOptions = ["2.0%", "2.5%", "3.0%"];
    $scope.showHideToggleArray = {
        myCostOfLiving: true,
        myEstimatedYears: true
    };
    $scope.showHiddenChartArray = {
        myCostOfLiving: true
    }
    $scope.buttonValueArray = {
        myCostOfLivingButton: 'Show Chart'
    }


    /* The showHideToggleFunc method toggles input fields between input and display modes.
    It accepts the id of the input field as a parameter and uses it to update
    The input fields corresponding showHideToggleArray value, which in turn informs
    one or the other in the pair of display and input elements being visible through ng-shot and ng-hide. */
    $scope.showHideToggleFunc = function(id) {
        $scope.showHideToggleArray[id] = !$scope.showHideToggleArray[id];
        // Timeout required for this focus to work effectively:
        window.setTimeout(function ()
        {
            document.getElementById(id).focus();
        }, 0);

    }

    /* The checkIfENterKeyWasPressed function accepts the $event object
    and the id of the input field where the key press event occurred.
    If the enter key was hit, it triggers the blur method on that input element.
    (The input element's ng-blur directive then calls the showHideToggleFunc method above.
    This chain is used to avoid a double call on the toggle function if the key press function
    were to directly call the showHideToggleFunc itself, 
    which would inherently involve a blur event for the element on its own accord.) */
    $scope.checkIfEnterKeyWasPressed = function($event, id){
        var keyCode = $event.which || $event.keyCode;
        if (keyCode === 13) {
            /* For whatever reason, using a setTimeout function to wrap this blur method call
            Prevents an AngularJS apply already in progress error that links to here: https://code.angularjs.org/1.3.1/docs/error/$rootScope/inprog?p0=$apply */
            window.setTimeout(function () {
                document.getElementById(id).blur();
            }, 0);
            }
      };

    $scope.createCostOfLivingChartData = function() {
        
        // Create/Empty costOfLivingChartObj to gather new chart data in during loop
        let costOfLivingChartObj = {
            years: [],
            costOfLiving: [],
        };
        // Set initial values to two local variables that loop will update each iteration:
        let currentYear = (new Date()).getFullYear();
        let costOfLiving = $scope.myCostOfLiving;

        // Add them as first data set in costOfLivingChartObj:
        costOfLivingChartObj.years.push(currentYear);
        costOfLivingChartObj.costOfLiving.push(costOfLiving);

        // Define two variables that will define loop length and be used for manipulating cost of living value each iteration:
        let numberOfYears = $scope.myEstimatedYears;
        let interestRate = 1 + (parseFloat($scope.annualInflationSelect)/100);

        // Loop through to model the number of estimate future year's cost of living desired, adding data sets to chart object:
        for (loopYear = 1; loopYear <= numberOfYears; loopYear++) {
            // Increment Year and Cost of Living:
            futureYear = currentYear + loopYear;
            costOfLiving = costOfLiving * interestRate;
            // Add new futureYear and estimate costOfLiving to costOfLivingChartObj:
            costOfLivingChartObj.years.push(futureYear);
            costOfLivingChartObj.costOfLiving.push(costOfLiving.toFixed(2));
        }

        // Call function to create/show cost of living chart passing chart object data prepared above:
        $scope.createCostOfLivingChart(costOfLivingChartObj);

    }

    $scope.createCostOfLivingChart = function(costOfLivingChartObj) {

        // Delete and recreate canvas element so not multiple charts in dom on refresh:
        // The Delete:
        let oldChartCanvas = document.getElementById("myCostOfLivingChart");
        oldChartCanvas.parentNode.removeChild(oldChartCanvas);
        // The Re-create:
        // Create element and add attributes:
        let newChartCanvas = document.createElement("canvas");
        newChartCanvas.setAttribute("id", "myCostOfLivingChart");
        newChartCanvas.setAttribute("width", "400");
        newChartCanvas.setAttribute("height", "400");
        // Append as child to parent container div element:
        document.getElementById("costOfLivingChartContainer").appendChild(newChartCanvas);

        // Create CHART.JS Chart:

        var ctx = document.getElementById("myCostOfLivingChart").getContext('2d');

        // Only need one line color for one data set here:
        let myLineColor1 = 'rgba(255,99,132,1)';

        // Define Chart Object:
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: costOfLivingChartObj.years,
                datasets: [{
                    label: 'COST Inf.',
                    fill: false,
                    data: costOfLivingChartObj.costOfLiving,
                    pointBackgroundColor: myLineColor1,
                    backgroundColor: [
                        myLineColor1
                    ],
                    borderColor: [
                        myLineColor1
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                // This is a solution to add $ and ',' every three digits to value shown in tooltip
                // And found with 81 votes and by Kryth here: https://stackoverflow.com/questions/28568773/javascript-chart-js-custom-data-formatting-to-display-on-tooltip
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return "$" + Number(tooltipItem.yLabel).toFixed(0).replace(/./g, function(c, i, a) {
                                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
                            });
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true,
                            // This is a solution to add "$" to the y-axis labels found here:
                            // https://stackoverflow.com/questions/28523394/charts-js-formatting-y-axis-with-both-currency-and-thousands-separator
                            callback: function(value, index, values) {
                                if(parseInt(value) >= 1000){
                                  return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                } else {
                                  return '$' + value;
                                }
                            }
                        }
                    }]
                }
            },
        });

        // Deactive ng-hide on div containing finished chart:
        $scope.showHiddenChartArray.myCostOfLiving = false;
        $scope.buttonValueArray.myCostOfLivingButton = 'Refresh Chart';
    }


});