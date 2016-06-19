/*
    DUMMY DATA TO BE USED FOR THE CHARTS
*/

/*
    SET UP HISTORY DATA
*/
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],            
    historyData = (function () {
        var historyData = {
                start : new Date(Date.parse('12 Nov 2013')),
                current : [], // set of dummy series ( year | month | year )
                months : [],
                years : [],
                dataMatrix : {},
                data : []
            };
        // populate historyData.data
        for (var i = Date.parse(historyData.start); i <= Date.now(); i += 3600000) {
            var timestamp = new Date(i),
                obj = {
                    unix : i,
                    timestamp : timestamp,
                    year : timestamp.getFullYear(),
                    month : timestamp.getMonth(),
                    day : timestamp.getDate(),
                    hour : timestamp.getHours()                
                };
            obj.consumption = obj.hour < 5 || obj.hour > 20 ? Math.random()*(5/24) : Math.random()*(8/24)+(5/24)
            


            if ( !historyData.dataMatrix[obj.year] )
            {
                historyData.dataMatrix[obj.year] = {}
            }
            if ( !historyData.dataMatrix[obj.year][obj.month] )
            {
                historyData.dataMatrix[obj.year][obj.month] = {}
            }
            if ( !historyData.dataMatrix[obj.year][obj.month][obj.day] )
            {
                historyData.dataMatrix[obj.year][obj.month][obj.day] = {}
            }
            if ( !historyData.dataMatrix[obj.year][obj.month][obj.day][obj.hour] )
            {
                historyData.dataMatrix[obj.year][obj.month][obj.day][obj.hour] = {dataIndex:historyData.data.length}
            }
            historyData.data.push(obj);
        };               
        // add methods
        historyData.getByYear = function (year) {        
            var data = (function () {
                        var arr = [];

                        for (var i = 0; i < 12; i++) {
                            arr[i] = [
                                months[i],
                                0
                            ];
                        };

                        return arr;
                    })();

            if ( !historyData.dataMatrix[year] )
            {
                return null
            }

            for ( month in historyData.dataMatrix[year] )
            {
                data[month][1] = (function () {
                    var consumption = 0;
                    for ( day in historyData.dataMatrix[year][month] )
                    {
                        for ( hour in historyData.dataMatrix[year][month][day] )
                        {
                            consumption += historyData.data[historyData.dataMatrix[year][month][day][hour].dataIndex].consumption;
                        }
                    }
                    return consumption;
                })();
            }

            return data.length > 0 ? {
                year : year,
                data : data,
                average : 150,
                pointFormatter : function (point) {
                    return '<b><h3>'+point.y.toFixed(2)+' kWh</h3></b> <br>consumed on <br>'+point.name+' '+year;
                },
                chartTitle : 'Your Energy Consumption for '+year
            } : null;
        };
        historyData.getByMonth = function (month,year) {        
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], 
                lastDay = new Date(year,month,0).getDate(),
                data = (function () {
                    var arr = [];
                    for (var i = 0; i < lastDay; i++) {
                        arr.push([i+1,0])
                    };
                    return arr;
                })();
            month--;

            if ( !historyData.dataMatrix[year] || !historyData.dataMatrix[year][month] )
            {
                return null
            }

            for ( day in historyData.dataMatrix[year][month] )
            {
                data[day-1][1] = (function () {
                    var consumption = 0;
                    for ( hour in historyData.dataMatrix[year][month][day] )
                    {
                        consumption += historyData.data[historyData.dataMatrix[year][month][day][hour].dataIndex].consumption;
                    }
                    return consumption;
                })();
            }

            return data.length > 0 ? {
                year : year,
                month : months[month],
                data : data,
                average : 5,
                pointFormatter : function (point) {
                    return '<b><h3>'+point.y.toFixed(2)+' kWh</h3></b> <br>consumed on <br>'+months[month]+' '+point.category;
                },
                chartTitle : 'Your Energy Consumption for '+months[month]+', '+year
            } : null;
        };
        historyData.getByDate = function (day,month,year) {        
            var data = (function () {
                var arr =[];

                for (var i = 0; i < 24; i++) {
                    var hour = i,
                        time = (hour === 12 || hour === 0 ? 12 : ( hour < 12 ? hour : hour-12 )),
                        suffix = hour < 12 ? ' am' :  ' pm',
                        xVal = time + suffix;                    
                    arr.push([xVal,0]);
                };

                return arr;
            })();

            month--;

            if ( !historyData.dataMatrix[year] || !historyData.dataMatrix[year][month] || !historyData.dataMatrix[year][month][day] )
            {
                return null
            }

            for ( hour in historyData.dataMatrix[year][month][day] )
            {
                // process hour
                data[hour][1] = historyData.data[historyData.dataMatrix[year][month][day][hour].dataIndex].consumption;
            }
            return data.length > 0 ? {
                year : year,
                month : months[month],
                day : day,
                data : data,
                average : 0.25,
                pointFormatter : function (point) {
                    return '<b><h3>'+point.y.toFixed(2)+' kWh</h3></b> <br>consumed on <br>'+point.name;
                },
                chartTitle : 'Your Energy Consumption for '+months[month]+' '+day+', '+year
            } : null;
        }

        return historyData;
    })();




// console.log(historyData.getByYear(2013).data);
// console.log(historyData.getByMonth(3,2015));
// console.log(historyData.getByDate(30,3,2014));
// console.log(historyData.dataMatrix);

/*
    SETUP DATA FOR CURRENT 
    encapsulated within IIFE to prevent global conflict and mess
*/
;(function () {
    var today = new Date(Date.now()),
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    seriesData = historyData.current;    

    // setup data for today
    seriesData.push({                
        data : historyData.getByDate(today.getDate(),today.getMonth()+1,today.getFullYear()).data.map(function (data,i) {
            var time = i === 12 || i === 0 ? 12 : ( i < 12 ? i : i-12 ),
                suffix = i < 12 ? ' am' :  'pm',
                xVal = time + suffix;            
            return [
                    xVal,
                    data[1]
                ]
        }),
        average : 0.3,
        pointFormatter : function (point) {
            return '<b><h3>'+point.y.toFixed(2)+' kWh</h3></b> <br>consumed on <br>'+point.name;
        },
        chartTitle : 'Your Energy Consumption for Today'
    });

    // setup data for this month
    seriesData.push({
       // data for this month
       data : (function () {
           var arr = [];
            historyData.getByMonth(today.getMonth()+1,today.getFullYear()).data.forEach(function (data,i) {
                arr.push([
                        (i+1).toString(),
                        data[1]
                    ]) ;
            });
            return arr;
       })(),
       average : 5,
        pointFormatter : function (point) {
            return '<b><h3>'+point.y.toFixed(2)+' kWh</h3></b> <br>consumed on <br>'+months[new Date().getMonth()]+' '+point.name;
        },
        chartTitle : 'Your Energy Consumption for this Month'
    });

    // setup data for this year
    seriesData.push({
        // data for this year
        data : (function () {
            var arr = [];
            historyData.getByYear(today.getFullYear()).data.forEach(function (data,i) {
                arr.push([
                        months[i],
                        data[1]
                    ]) ;
            });
            return arr;
        })(),
        average : 125,
        pointFormatter : function (point) {
            return '<b><h3>'+point.y.toFixed(2)+' kWh</h3></b> <br>consumed on <br>'+point.name+' '+new Date().getFullYear();
        },
        chartTitle : 'Your Energy Consumption for this Year'
    });

})();
