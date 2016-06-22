$(function() {
  $(document).ready(function() {

    // set an array to be used as initial x axis values
    var xAxisValues = (function () {
      var data = [], i=0;

      var interval = setInterval(function () {
        if ( i < 5 )
        {
          data.push(new Date());
        }
        else
        {
          clearInterval(interval);
        }
      },1000);

      return data;

    })();

    // disable UTC
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    var dataSeries = (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -39; i <= 0; i += 10) {
                        var y = (i != 0 ? null : Math.random());
                        data.push({
                            x: time + i * 1000,
                            y: y
                        });                        
                    }
                    return data;
                }());

    var realtimeChart = new Highcharts.Chart({
            chart: {
                type: 'line',
                zoomType: 'x',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                renderTo : $('#realtime-chart')[0],
                ignoreHiddenSeries : false,
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var chart = this,
                            series = this.series,
                            xAxis = this.xAxis,
                            count = 1;

                        function addPoint(){
                            series.forEach(function (s,i) {
                              var x = (new Date()).getTime(), // current time
                                y = s.data[s.data.length-1].y + (Math.random()*((8/24/60/6)*appliances.items.length*appliances.items[i].multiplier));
                                s.addPoint([x,y],true);
                            });
                            chart.redraw();
                        };
                        
                        addPoint();

                        setInterval(function () {                            
                            addPoint();
                            count++;
                        }, 10000);
                    }
                }
            },
            title : { text : '' },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    second: '%I:%M:%S %p',
                    minute: '%I:%M %p',
                    hour: '%I:%M %p'
                },
                tickPixelInterval: 150                
            },
            yAxis: {
                title: {
                    text: 'Power (kW)'
                },
                min: 0,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#dddddd'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%I:%M:%S %p <br/>%b %d, %Y ', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y,10) + ' kW';
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: (function () {
                var series = [];

                appliances.items.forEach(function (item,i) {                    
                    series.push({
                        name : item.name,
                        data: dataSeries
                    });
                });
                return series;
            })()
    },function(){
        var chart = this;

        // create buttons container for appliances
        var btnContainer = $('<div class="panel">')
                            .insertAfter($('#realtime-chart'))
                            .append('<div><em>Click to add or remove appliances</em></div>');

        chart.series.forEach(function (s,i) {           
          // checkbox change handler
          var sId = 'series_'+i,
              checkbox = $('<input class="hide" type="checkbox" checked id="'+ sId +'">'),
              button = $('<div>',{class:"btn realtime-btn"}).html(s.name+(appliances.items[i].location?'<span class="inline-block">&nbsp;- '+appliances.items[i].location+'</span>':'')).css('background-color',(checkbox.is(':checked') ? s.color : '#fff')),
              label = $('<label>',{for:sId})
                        .append(checkbox)
                        .append(button)
                        .appendTo(btnContainer);

          checkbox.on('change',function () {                                
            s.setVisible(this.checked);
            
            button.css('background-color',(this.checked ? s.color : '#fff'));
            
          });
        });

    });
    
    




  });  // document ready
});