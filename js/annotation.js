function initAnnotation(){
  var categoryData = [
                { "id": "2",
                    "parentid": "1",
                    "text": "Hot Chocolate",
                    "value": "$2.3"
                }, {
                    "id": "3",
                    "parentid": "1",
                    "text": "Peppermint Hot Chocolate",
                    "value": "$2.3"
                }, {
                    "id": "4",
                    "parentid": "1",
                    "text": "Salted Caramel Hot Chocolate",
                    "value": "$2.3"
                }, {
                    "id": "5",
                    "parentid": "1",
                    "text": "White Hot Chocolate",
                    "value": "$2.3"
                }, {
                    "text": "Chocolate Beverage",
                    "id": "1",
                    "parentid": "-1",
                    "value": "$2.3"
            }, {
                    "id": "6",
                    "text": "Espresso Beverage",
                    "parentid": "-1",
                    "value": "$2.3"
                }, {
                    "id": "7",
                    "parentid": "6",
                    "text": "Caffe Americano",
                    "value": "$2.3"
                    }, {
                    "id": "8",
                    "text": "Caffe Latte",
                    "parentid": "6",
                    "value": "$2.3"
                }, {
                    "id": "9",
                    "text": "Caffe Mocha",
                    "parentid": "6",
                    "value": "$2.3"
                    }, {
                    "id": "10",
                    "text": "Cappuccino",
                    "parentid": "6",
                    "value": "$2.3"
                }, {
                    "id": "11",
                    "text": "Pumpkin Spice Latte",
                    "parentid": "6",
                    "value": "$2.3"
                    }, {
                    "id": "12",
                    "text": "Frappuccino",
                    "parentid": "-1"
                }, {
                    "id": "13",
                    "text": "Caffe Vanilla Frappuccino",
                    "parentid": "12",
                    "value": "$2.3"
                    }, {
                    "id": "15",
                    "text": "450 calories",
                    "parentid": "13",
                    "value": "$2.3"
                }, {
                    "id": "16",
                    "text": "16g fat",
                    "parentid": "13",
                    "value": "$2.3"
                    }, {
                    "id": "17",
                    "text": "13g protein",
                    "parentid": "13",
                    "value": "$2.3"
                }, {
                    "id": "14",
                    "text": "Caffe Vanilla Frappuccino Light",
                    "parentid": "12",
                    "value": "$2.3"
                    }];
  
  // prepare the data
  var categorySource =
  {
      datatype: "json",
      datafields: [
          { name: 'id' },
          { name: 'parentid' },
          { name: 'text' },
          { name: 'value' }
      ],
      id: 'id',
      localdata: categoryData
  };
  var categoryDataAdapter = new $.jqx.dataAdapter(categorySource);
  categoryDataAdapter.dataBind();
  var records = categoryDataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{ name: 'text', map: 'label'}]);                








  //End of setup for category browser

  //Main Starts here

  var svgContainer = d3.select("#svg-container");

  var timeScale = d3.scale.linear()
                  .domain([0,4])
                  .range([25, 475])
                  .clamp(true);

  var trackCounter = 0;

  var trackHeight = 50;

  var sliderHeight = 50;

  initPlayer();

  addPlayerScrubber();

  d3.select("body")
  .on("keyup", function(){
    if(d3.event.keyCode == 68){
      for(i in brushes){
        brushes[i].removeSelected();
      }
    }else if(d3.event.keyCode == 65){
      showAnnotationSelectionUI();
    }
  });


  $(document).on("contextmenu", ".extent", function(event){
    console.log(this);
    d3.select(this).remove();
    return false;
  })

  function showAnnotationSelectionUI(){
    $("#annotation-graph-dialog").dialog({
      modal: true,
      width: "425px",
      buttons: {
        Select: function(){

        }
      }

    });
  }

  function addPlayerScrubber(){
    var slider = d3.svg.brush()
                  .x(timeScale).clamp(true);

    var gSlider = svgContainer.append("g")
        .attr("class", "slider")
        .call(slider);

    gSlider.selectAll("rect")
    .attr({
      "height": sliderHeight,
      "y": 0,
      "visibility": "hidden"
    })
    scrubHandle = gSlider.append("circle")
        .attr("class", "handle")
        .attr("cx", timeScale(0))
        .attr("cy", sliderHeight/2)
        .attr("r", 9);

    slider.on("brush", function() {
      var value = slider.extent()[0];
      
      if (d3.event.sourceEvent) { // not a programmatic event
        value = timeScale.invert(d3.mouse(this)[0]);
        slider.extent([value, value]);
        player.currentTime(value);
      }

      scrubHandle.attr("cx", timeScale(value));
      scrubLine.attr("x1", timeScale(value));
      scrubLine.attr("x2", timeScale(value));
    })

    scrubLine = svgContainer.append("line")
      .attr({
        "x1": timeScale(0),
        "y1": sliderHeight/2,
        "x2": timeScale(0),
        "y2": 500,
        "stroke": "#ccc"
      })
  }

  function initPlayer(){
    player = videojs('really-cool-video',
      { /* Options */ },
      function() {
        this.on("ended", videoEnded);
      }
    );
  }

  /**
   * This function is called when the video ends
   */
  function videoEnded(){
    clearInterval(intervalId)
  }


  function registerControls(){
    $("#play-btn").on("click", function(){
      // this lines helps get the duration of the video before playing it
      if(typeof intervalId !== 'undefined'){
        clearInterval(intervalId);
      }

      // player.currentTime(0)
      videoDuration = player.duration();

      //setup the scrubber
      timeScale.domain([0, player.duration()]);

      intervalId = setInterval(syncSliderPosition, 15)

      player.play()
    });

    $("#pause-btn").on("click", function(){
      player.pause();
    })
  }


  function syncSliderPosition(){
    var time = player.currentTime();
    var position = timeScale(time);
    // console.log(time)
    scrubHandle.attr("cx", position);
    scrubLine.attr({
      "x1": position,
      "x2": position
    })
  }

  registerControls();

  $('#jqxTree').jqxTree({ source: records, height: '400px', width: '330px', allowDrag: false, animationShowDuration: 0});
  $('#jqxTree').on('select', function(e){
    var selectedItem = $("#jqxTree").jqxTree('getSelectedItem');

    //collapse previous items
    $("#jqxTree").jqxTree('collapseAll');
    $("#jqxTree").jqxTree('expandItem', selectedItem);
  });
}