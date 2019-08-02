$(document).ready(function () {
//starting the time variables early. here I'm using them to append the current selected time in the time span of html
// in order to allow the admin to add a train and understand where the time is relative to Military UTC time.
//the time calculated is the local time relative to the UTC (Military) constant time or the old GMT originally used by trains.
    var startTimeUTC = $("#hour").val() + ":" + $("#minute").val();
    var startLocal = $("<span>").text(moment.utc(startTimeUTC, "HH:mm").local().format("HH:mm ZZ") + " (Local Time with UTC offset)");
    startLocal.attr("id", "startLocal");
    $("#startTime").append(startLocal);

    $("#startTime").on("click", function () {
        startTimeUTC = $("#hour").val() + ":" + $("#minute").val();
        $("#startLocal").text(moment.utc(startTimeUTC, "HH:mm").local().format("HH:mm ZZ") + " (Local Time with UTC offset)");
    });

    //function to update the train arrival time each minute
    function updateTimes() {
        $(".trainEntry").each(function () {
            var dbStartTime = $(this).children(".nextTrainTime").attr("data-start");
            var localfreq = Number($(this).children(".freq").text());
            var minutesSinceFirstRun = moment().diff(moment.utc(dbStartTime, "HH:mm"), "minutes");
            var minutesTilNextTrain = localfreq - minutesSinceFirstRun % localfreq;
            var nextTrain = moment().add(minutesTilNextTrain, "minutes").format("hh:mm a ZZ");
            console.log(dbStartTime, localfreq, minutesSinceFirstRun, minutesTilNextTrain, nextTrain);
            $(this).children(".nextTrainTime").text(nextTrain);
            $(this).children(".minTilNextTrain").text(minutesTilNextTrain);
        });
    };


    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyA4Pry9aQ9h26hE76tjYcDu1uRBkZtg2CQ",
        authDomain: "userdatabaseinclass.firebaseapp.com",
        databaseURL: "https://userdatabaseinclass.firebaseio.com",
        projectId: "userdatabaseinclass",
        storageBucket: "",
        messagingSenderId: "142333756264",
        appId: "1:142333756264:web:407621c057144a81"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    var userDatabase = firebase.database();
    console.log(userDatabase);
//function to add the entries of the current database in firebase and displaying them to the table.
// ever subsequent add will be added to the table.
    userDatabase.ref().on("child_added", function (childSnapshot) {

        // full list of items to the well
//times are converted from UTC (Military) time to local time and listed relative to the UTC constant.
        var newEntry = $("<tr>").attr("class", "trainEntry");
        var dbstartTime = childSnapshot.val().startTimeUTC;
        var minutesSinceFirstRun = moment().diff(moment.utc(dbstartTime, "HH:mm"), "minutes");
        //since the time I'm subtracting is the now time relative to the frequewncy, the time left will be the time used up until the new arrival. 
        // therefore I'm taking the "other part" of the remainder
        var minutesTilNextTrain = Number(childSnapshot.val().frequency) - minutesSinceFirstRun % Number(childSnapshot.val().frequency);
        var nextTrain = moment().add(minutesTilNextTrain, "minutes").format("hh:mm a ZZ");

        newEntry.append("<td>" + childSnapshot.val().train + "</td>", "<td>" + childSnapshot.val().destination + "</td>", "<td class='freq'>" + childSnapshot.val().frequency + "</td>", "<td class='nextTrainTime' data-start='" + dbstartTime + "'>" + nextTrain + "</td>", "<td class='minTilNextTrain'>" + minutesTilNextTrain + "</td>");
        $("#infoTable").append(newEntry);

        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
//setting the interval to update times AFTEr the first run of filling the table
    var updateInterval = setInterval(updateTimes, 60000);

    //functio nto add the information in the form to the database.
    // there is logic to check to see of every part of the form is filled or filled with proper information ie NaN.
    $("#submitButton").on("click", function () {
        event.preventDefault();

        // getting values from the form
        var newTrain = $("#train").val().trim();
        var newDestination = $("#destination").val().trim();
        var newFrequency = $("#frequency").val().trim();
        var newTimeUTC = $("#hour").val() + ":" + $("#minute").val();

        if (newTrain === "" || newDestination === "" || newFrequency === "") {
            $("#errorSpan").text("Please fill in all fields");
        }
        else if (isNaN(Number(newFrequency))) {
            $("#errorSpan").text("Frequency must be numberic (no letters or special characters)");
        }
        else {
            $("#errorSpan").text("");
            $("#train").val("");
            $("#destination").val("");
            $("#frequency").val("");
            userDatabase.ref().push({
                "train": newTrain,
                "destination": newDestination,
                "startTimeUTC": newTimeUTC,
                "frequency": newFrequency,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
        };
    });


});
