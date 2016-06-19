$(function () {

    var seriesData = historyData.current;

    // function to set colors of each data marker in a series
    // this should be called by .apply() with Chart as the parameter
    function updateColors(average) {        
        var series = this.series[0];
        // update colors
        series.data.forEach(function (data, i) {
            var RG = Math.floor(255*(1-(data.y/series.dataMax))),
                color;     

            // if value is > average, red; else, green
            if ( data.y >= average )
            {
                color = 'rgb('+Math.floor(255+(75*(RG/255)))+','+RG+','+RG+')'; 
            }
            else
            {
                color = 'rgb('+RG+','+Math.floor(180+(75*(RG/255)))+','+RG+')';
            }  

            data.update({
                color : color
            })
        });
    }

    // function to update chart on data fetch
    // Data fetch is initiated either by chart button clicks or by period select (data picker)
    // param chart = the Chart object
    // param s =  the custom series object containing the data
    // return val: true if success
    function updateChart(chart,s) {     

        chart.showLoading();

        // update tooltip format
        chart.series[0].update({
            tooltip : {
                pointFormatter : function () {
                    return s.pointFormatter(this);
                }
            }
        });

        // update plotLine 
        // chart.yAxis[0].update({
        //     plotLines : [
        //         {
        //             label : {
        //                 value : s.average,
        //                 text : '<strong><p>Average : '+s.average+' kWh</p></strong>'
        //             }
        //         }
        //     ]
        // })
        // chart.yAxis[0].plotLinesAndBands[0].options.label.text = '<strong><p>Average : '+s.average+' kWh</p></strong>';
        chart.yAxis[0].plotLinesAndBands[0].options.value = s.average;     
        // set timeout to allow loading text to fade in
        setTimeout(function () {
            var series = chart.series[0];            

            // change data
            series.setData(s.data,true);

            // update colors 
            updateColors.apply(chart,[s.average]);

            // change chart title
            chart.setTitle({
                text : s.chartTitle
            }, {}, true);

            chart.hideLoading();

        },500);

    }



    // initiate chart
    var historyChart = new Highcharts.Chart({
        chart: {
            type : 'column',
            events : {
                load : updateColors
            },
            renderTo : $('#history-chart')[0]
        },            
        title : {
            text : 'Your Energy Consumption for this Month'
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Energy (kWh)'
            },
            plotLines: [{
                dashStyle : 'Dash',
                color: 'gray',
                width: '1',
                zIndex: 99, // To not get stuck below the regular plot lines
                label : {
                    align : 'left',
                    useHTML : true
                },
                events : {
                    // display average value
                    mouseover : function () {
                        var plotLine = this;
                        // some mouseover methods
                    }
                }
            }]
        },
        legend: {
            enabled: false
        },
        tooltip: {
            animation: true,
            shadow: true,
            headerFormat : '',
            backgroundColor : '#000',   
            border : 'none',
            style : {
                color : '#eee',                
                fontSize : '16px'
            }
        },
        loading: {
            labelStyle: {
                color: 'blue'
            },
            style: {
                backgroundColor: 'white'
            },
            showDuration : 500
        },
        series: [{
            name: 'Energy Consumption History',
            colorByPoint: true         
        }]
    },function(){

        /* callback */

        var chart = this,
            today = new Date(Date.now()),
            totalToday = (function () {
                            var total = 0;
                            historyData.getByDate(today.getDate(),today.getMonth()+1,today.getFullYear()).data.forEach(function (d) {
                                total += d[1];
                            });
                            return total.toFixed(2);
                        })(),            
            selectPeriodBtn = $('#selectPeriodBtn'),
            yearSelect = $('#yearSelected'),
            errorModal = $('#periodError');

            $('#totalConsumptionToday').text(totalToday);
            $('#totalCostToday').text((totalToday*10.51).toFixed(2));

            // initialise tooltip
            $('[data-toggle="tooltip"]').tooltip();

            // initialise datepickers
            $('#dateSelected').datepicker({
                format : 'dd/mm/yyyy',
                onRender: function(date) {
                    // console.log(date.valueOf());
                    return date.valueOf() >= Date.now() || date.valueOf() < historyData.start.valueOf() ? 'disabled' : '';
                }
            });
            $('#monthSelected').datepicker({
                format : 'mm/yyyy',
                viewMode:'months',
                minViewMode : 'months'                
            });
            for ( var y = historyData.start.getFullYear(); y <= new Date(Date.now()).getFullYear(); y++  )
            {
                yearSelect.append('<option value="'+y+'">'+y+'</option>')
            }


            // button click handler for changing series
            $('.history-chart-buttons .btn').each(function (i) {
                var params = [
                        {
                            args :[today.getDate(),today.getMonth(),today.getFullYear()],
                            method : 'getByDate'
                        },
                        {                       
                            args : [today.getMonth(),today.getFullYear()],
                            method : 'getByMonth'
                        },
                        {
                            args : [today.getFullYear()],
                            method : 'getByYear'
                        }
                    ];

                $(this).click(function () {
                    selectPeriodBtn.removeClass('btn-dark');
                    
                    // last button (advanced select has a different function)
                    if ( i < params.length )
                    {
                        updateChart(chart,historyData[params[i].method].apply(window,params[i].args));
                    }                    
                })
            });
            // initialize default chart series on load ("This Month")
            $('.history-chart-buttons .btn').eq(1).trigger('click');

            // handle modal interface
            var modal = $('#selectPeriodModal'),
                panels = modal.find('.historyPeriodSelect');

            panels.each(function () {

                var panel = $(this),
                    formGroup = panel.find('.form-group'),
                    btn = panel.find('.periodSelectBtn'),
                    period = panel.attr('data-period'),
                    input = panel.find('.input'),
                    errorMessage = panel.find('.error-message');

                btn.click(function () {
                    var val = input.val();
                    // check if valid input value
                    if ( validVal(period,val) === null )
                    {
                        formGroup.addClass('has-error');
                        errorMessage.collapse('show');
                    }
                    else
                    {
                        modal.find('.has-error').removeClass('has-error');
                        modal.find('.error-message').collapse({toggle:false});                        
                        // process valid value 
                        renderPeriodChart(period,val.split('/').map(function (x) { return Number(x) }))
                    }
                });

            // function to validate input
            function validVal (period,val) {
                switch (period)
                {
                    case 'date':
                        return val.match(/\d\d\/\d\d\/\d\d\d\d/g);
                        break;
                    case 'month':
                        return val.match(/\d\d\/\d\d\d\d/g);
                        break;
                    case 'year':
                        return val.match(/\d\d\d\d/g);
                        break;
                }
            };

            // function to load chart according to period
            function renderPeriodChart (period,valsArr) {
                var seriesData;
                switch (period)
                {
                    case 'date':
                        seriesData = historyData.getByDate.apply(window,valsArr);
                        break;
                    case 'month':
                        seriesData = historyData.getByMonth.apply(window,valsArr);
                        break;
                    case 'year':
                        seriesData = historyData.getByYear.apply(window,valsArr);
                        break;
                }

                if (seriesData)
                {
                    $('.history-chart-buttons').find('input[type="radio"]').prop('checked',false);
                    modal.modal('hide');
                    selectPeriodBtn.addClass('btn-dark');
                    updateChart(historyChart,seriesData);
                }
                else
                {
                    errorModal.modal('show');
                }
            };


        });

    });

});