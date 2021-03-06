var unproductiveCategories = [
  "Gambling",
  "Games",
  "Internet and Telecom",
  "Social",
  "People and Society",
  "Sports",
  "Shopping",
  "Adult",
  "News and Media",
  "Arts and Entertainment"
];

var productiveCategories = [
  "Books",
  "Business",
  "Beauty and Fitness",
  "Finance",
  "Career and Education",
  "Law and Government",
  "Science",
  "Search",
  "Reference",
  "Computer and Electronics"
];

var maxTime = 0;
var maxTime_website = "";

var maxVisits = 0;
var maxVisits_website = "";

var numberOfWebsitesVisited = 0;
var totalTimeLogged = 0;


function loadData(timeFrameRequested) {
  printProductivityScore(timeFrameRequested);
  printMainStats(timeFrameRequested);
  loadFocusModeInfo();
  printCategoryData(timeFrameRequested);
}

loadData("day");


function printMainStats(timeFrameRequested) {
  maxTime = 0;
  maxTime_website = 0;
  maxVisits = 0;
  maxVisits_website = 0;
  numberOfWebsitesVisited = 0;
  totalTimeLogged = 0;

  var timeFrame = timeFrameRequested;
  if (timeFrameRequested == "all") {
    timeFrame = "total";
  }

  chrome.storage.local.get('websites', function(items) {
    var websites = items['websites'];

    for (key in websites) {  
      var website = websites[key];


      if (website[timeFrame + '_visits'] > 0) {
        numberOfWebsitesVisited++;
        totalTimeLogged += website[timeFrame + '_time'];

        console.log(website[timeFrame + '_time']);
        if (website[timeFrame + '_time'] > maxTime) {
          maxTime = website[timeFrame + '_time'];
          maxTime_website = website['_id'];
        }

        if (website[timeFrame + '_visits'] > maxVisits) {
          maxVisits = website[timeFrame + '_visits'];
          maxVisits_website = website['_id'];
        }
      }

    }
    
    $('.overview-stats .time-logged .description').html(formatTime(totalTimeLogged));
    $('.overview-stats .websites-visited .description em').text(numberOfWebsitesVisited);
    $('.overview-stats .most-visited .description').text(maxVisits_website);
    $('.overview-stats .most-time .description').text(maxTime_website);

  });
}
function formatTime(timeInMilliseconds) {
  var timeInSeconds = Math.floor(timeInMilliseconds / 1000);
  var timeInMinutes = Math.floor(timeInSeconds / 60);

  if (timeInMinutes < 60) {
    if (timeInMinutes == 1) {
      return "<em>" + timeInMinutes + "</em> minute logged";
    }
    else {
      return "<em>" + timeInMinutes + "</em> minutes logged";
    }
  }
  else {
    var timeInHours = Math.floor(timeInMinutes / 60);
    if (timeInHours == 1) {
      return "<em>" + timeInHours + "</em> hour logged";
    }
    else {
      return "<em>" + timeInHours + "</em> hours logged";
    }
  }
}
function printProductivityScore(timeFrameRequested) {
  var timeFrame = "total_time";
  if (timeFrameRequested == "day") {
    timeFrame = "day_time";
  }
  else if (timeFrameRequested == "week") {
    timeFrame = "week_time";
  }
  else if (timeFrameRequested == "month") {
    timeFrame = "month_time";
  }
  else {
    timeFrameRequested = "total_time";
  }

  var productiveTime = 0;
  var unproductiveTime = 0;

  chrome.storage.local.get('categories', function(items) {
    var categories = items['categories'];

    for (key in categories) {
      var category = categories[key];

      if ($.inArray(category['_id'], unproductiveCategories) > -1) {
        unproductiveTime += category[timeFrame];
      }
      else if ($.inArray(category['_id'], productiveCategories) > -1) {
        productiveTime += category[timeFrame];
      }

    }

    var productivityScore = Math.floor((productiveTime / (productiveTime + unproductiveTime))*100);
    console.log("Productive time: " + productiveTime);
    console.log("Unproductive time: " + unproductiveTime);
    console.log("Productivity score: " + productivityScore);

    if (productiveTime == 0 && unproductiveTime == 0) {
      productivityScore = 50;
    }

    var productivityScorePieData = [
      {
        value: productivityScore,
        color: "#9CC671",
        highlight: "#72A43F",
        label: "productive"
      },
      {
        value: (100 - productivityScore),
        color:"#EE8383",
        highlight: "#FF7070",
        label: "unproductive"
      }
    ];

    $(".productivity-score").text(productivityScore);

    $("#productivityScoreChart").replaceWith('<canvas id="productivityScoreChart" width="217" height="217"></canvas>');
    var ctx = document.getElementById("productivityScoreChart").getContext("2d");
    window.myPie = new Chart(ctx).Doughnut(productivityScorePieData, {segmentShowStroke : false, percentageInnerCutout: 85});

  });
}
function loadFocusModeInfo() {
  chrome.storage.local.get('settings', function(items) {
    var settings = items.settings;
    if (settings.focus) {
      $(".button.focus-mode").text("Exit focus mode").removeClass("off").addClass("on");
    }
    else {
      $(".button.focus-mode").text("Enter focus mode").removeClass("on").addClass("off");
    }
  });
}
function printCategoryData(timeFrameRequested) {
  chrome.storage.local.get('categories', function(items) {
    var categories = items['categories'];

    var topSixCategories = [];
    for (var i = 0; i <= 5; i++) {
      topSixCategories[i] = {};
      topSixCategories[i]['_id'] = '-';
      topSixCategories[i][timeFrameRequested + '_time'] = 0;
    }

    for (key in categories) {
      var category = categories[key];
      var categoryTime = category[timeFrameRequested + '_time'];

      if (categoryTime > topSixCategories[5][timeFrameRequested + '_time']) {
        topSixCategories[5] = category;
        
        for (var i=4; i >= 0; i--) {
          if (categoryTime > topSixCategories[i][timeFrameRequested + '_time']) {
            topSixCategories[i+1] = topSixCategories[i];
            topSixCategories[i] = category;
          }
        }
      }

    }

    for (var i = 0; i < 6; i++) {
      console.log("------> " + topSixCategories[i][timeFrameRequested + '_time']);
    }
    console.log(topSixCategories);

    var totalTime = 0;
    var topCategories = [];
    for (var i = 0; i <= 5; i++) {
      totalTime += topSixCategories[i][timeFrameRequested + '_time'];
      topCategories[i] = topSixCategories[i][timeFrameRequested + '_time'];
    }
    for (var i=0; i < 5; i++) {
      topCategories[i] = Math.floor((topCategories[i]/totalTime)*100);
    }
    topCategories[5] = 100 - topCategories[0] - topCategories[1] -
                        topCategories[2] - topCategories[3] - topCategories[4];


    $('.category-bar .first').css('width', topCategories[0].toString() + '%');
    $('.category-bar .second').css('width', topCategories[1].toString() + '%');
    $('.category-bar .third').css('width', topCategories[2].toString() + '%');
    $('.category-bar .fourth').css('width', topCategories[3].toString() + '%');
    $('.category-bar .fifth').css('width', topCategories[4].toString() + '%');
    $('.category-bar .sixth').css('width', topCategories[5].toString() + '%');

    $('.category-stats .row > .first .description').text(topSixCategories[0]['_id']);
    $('.category-stats .row > .second .description').text(topSixCategories[1]['_id']);
    $('.category-stats .row > .third .description').text(topSixCategories[2]['_id']);
    $('.category-stats .row > .fourth .description').text(topSixCategories[3]['_id']);
    $('.category-stats .row > .fifth .description').text(topSixCategories[4]['_id']);
    $('.category-stats .row > .sixth .description').text(topSixCategories[5]['_id']);
  

  });
}


$( document ).ready(function() {
    $(".header .bottom-menu a").click(function () {
      $(".header .bottom-menu a").removeClass("active");
      $(this).addClass("active");

      if ($(this).hasClass("day")) {
        loadData("day");
      }
      else if ($(this).hasClass("week")) {
        loadData("week");
      }
      else if (($(this).hasClass("month"))) {
        loadData("month");
      }
      else if ($(this).hasClass("all")) {
        loadData("total");
      }


      event.preventDefault();
    });

    $(".button.focus-mode").click(function () {
      chrome.storage.local.get('settings', function(items) {
        var settings = items.settings;

        if (settings.focus) {
          // Currently in focus mode
          $(".button.focus-mode").text("Enter focus mode").removeClass("on").addClass("off");
          settings.focus = false;
        }
        else {
          // Not in focused mode
          $(".button.focus-mode").text("Exit focus mode").removeClass("off").addClass("on");
          settings.focus = true;
        }
        items.settings = settings;

        chrome.storage.local.set(items, function() {
          console.log('New data stored for settings');
        });
      });

      event.preventDefault();
    });
});
