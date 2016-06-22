/*
	These are dummy data only.
	Dynamically rendered elements should be done in php.
*/

// structure the appliances object using revealing module design
var appliances = (function () {

	var obj = {}; // return object

	obj.pricePerKwh = 10.51;

	obj.items = [
			{
				name : "Aircon",
				location : "Main",			
				multiplier : 0.2,
				consumption : Math.random()*300+200,
				info : "Some info here",
				image : "img/appliances/aircon.jpg"
			},
			{
				name : "Aircon",
				location : "Men\'s Room",			
				multiplier : 0.2,
				consumption : Math.random()*280+200,
				info : "Some info here",
				image : "img/appliances/aircon.jpg"
			},
			{
				name : "Aircon",
				location : "Ladies\' Room",			
				multiplier : 0.2,
				consumption : Math.random()*270+200,
				info : "Some info here",
				image : "img/appliances/aircon.jpg"
			},
			{
				name : "Television",
				location : "Living Room",			
				multiplier : 0.1,
				consumption : Math.random()*100+80,
				info : "Some info here",
				image : "img/appliances/tv.jpg"
			},
			{
				name : "Refrigerator",
				location : "Main",			
				multiplier : 0.3,
				consumption : Math.random()*400+280,
				info : "Some info here",
				image : "img/appliances/ref.jpg"
			},
			{
				name : "Heater",		
				multiplier : 0.02,	
				consumption : Math.random()*50+20,
				info : "Some info here",
				image : "img/appliances/heater.jpg"
			},
			{
				name : "Water Heater",
				location : "Main",			
				multiplier : 0.03,
				consumption : Math.random()*50+20,
				info : "Some info here",
				image : "img/appliances/water-heater.jpg"
			},
			{
				name : "CO (Convenience Outlet)",
				location : "Main",			
				multiplier : 0.12,
				consumption : Math.random()*75+50,
				info : "Some info here",
				image : "img/appliances/outlet.jpg"
			}
		];

	return obj;
})();


$(function () {

	var items = appliances.items;

	// compute for the cost of each appliance
	items.forEach(function (item,i) {

		var cost = (item.consumption * appliances.pricePerKwh).toString(),
			costBase = cost.replace(/[.].*$/g,'');

		var costFormatted = costBase.toString().split('').reverse().map(function (x,i) {
			return (i+1)%4 === 0 ? x+',' : x;
		}).reverse().join('');

		items[i].cost = costFormatted + '.' + cost.replace(/^.*[.]/g,'').substring(0,2);

	})

	// sort appliances according to consumption
	itemsSorted = items.sort(function (a,b) {
		return b.consumption - a.consumption
	});

	// console.log(itemsSorted);

	var tbl = $('#appliances').addClass('list-group'),
		rankList = $('.rank-list').addClass('clearfix'),
			rankRow = $('<div>',{class:'row'}).appendTo(rankList);

	itemsSorted.forEach(function (item,i) {

		// list all appliances to the Advanced Select modal
		$('#applianceSelected').append('<option value="'+item.name+'">'+item.name+'</option>');

		// list all items to sidebar list
		var row = $('<tr style="cursor:pointer" data-parent="#'+tbl.attr('id')+'" data-toggle="collapse" data-target="#listItem_'+i+'">');
		row
			.append('<td><div><strong>'+item.name+'</strong><small class="inline-block"><em>'+(item.location?'&nbsp;- '+item.location:'')+'</em></small></div></td>')
			.append('<td><div>'+item.cost+'</div></td>')
		tbl
			.append(row)
			.append('<tr><td colspan="2" ><div class="collapse panel-collapse" id="listItem_'+i+'"><div>Total Energy Used: <span class="inline-block">'+item.consumption.toFixed(2)+' kWh</span></div></div></td></tr>');
		
		// list the top 3
		if ( i < 3 )
		{
			var subInfoId = 'itemSubInfo_'+i,
				rowInner = $('<div>',{class:'col-sm-4'}).appendTo(rankRow)	,			
				itemPanel = $('<div>',{class:'panel panel-primary no-shadow clearfix rank-item'}).appendTo(rowInner)
							.append($('<div class="col-xs-4 col-sm-12 rank-heading"><p class="text-primary">TOP</p><h2 class="bg-primary rank-top">'+(i+1)+'</h2></div>')),		
					itemImgContainer = $('<div>',{class:'hidden-xs col-sm-12 rank-item-imgContainer'}).appendTo(itemPanel),
						itemImg = $('<img>',{src:(item.image ? item.image : 'img/thumbnail-default.jpg')}).appendTo(itemImgContainer),
					itemMainInfoContainer = $('<div>',{class:'col-xs-8 col-sm-12'}).appendTo(itemPanel),
						itemMainInfo = $('<div>',{class:'rank-item-info'}).appendTo(itemMainInfoContainer)
							.append('<h3>'+item.name+'</h3>')
							.append('<em>'+item.location+'</em>')
							.append(
								$('<blockquote>',{class:'panel panel-primary no-shadow rank-item-subinfo'})									
									.append('<p><strong>Total Energy Used:</strong> <span class="inline-block">'+item.consumption.toFixed(2)+' kWh</span></p>')
									.append('<p><strong>Total Cost:</strong> <span class="inline-block">Php '+item.cost+'</span></p>')
								);
					
		}


	});


});


