$(document).ready(function () {

    var startTimeUTC = $("#hour").val() + ":" + $("#minute").val();
    var startLocal = $("<span>").text(moment.utc(startTimeUTC, "HH:mm").local().format("HH:mm ZZ") + " (Local Time with UTC offset)");
    startLocal.attr("id", "startLocal");
    $("#startTime").append(startLocal);

    $("#startTime").on("click", function () {
        startTimeUTC = $("#hour").val() + ":" + $("#minute").val();
        $("#startLocal").text(moment.utc(startTimeUTC, "HH:mm").local().format("HH:mm ZZ") + " (Local Time with UTC offset)");
    });

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

    userDatabase.ref().on("child_added", function (childSnapshot) {

        // full list of items to the well

        var newEntry = $("<tr>").attr("class", "trainEntry");
        var dbstartTime = childSnapshot.val().startTimeUTC;
        var minutesSinceFirstRun = moment().diff(moment.utc(dbstartTime, "HH:mm"), "minutes");
        var minutesTilNextTrain = Number(childSnapshot.val().frequency) - minutesSinceFirstRun % Number(childSnapshot.val().frequency);
        var nextTrain = moment().add(minutesTilNextTrain, "minutes").format("hh:mm a ZZ");

        newEntry.append("<td>" + childSnapshot.val().train + "</td>", "<td>" + childSnapshot.val().destination + "</td>", "<td class='freq'>" + childSnapshot.val().frequency + "</td>", "<td class='nextTrainTime' data-start='" + dbstartTime + "'>" + nextTrain + "</td>", "<td class='minTilNextTrain'>" + minutesTilNextTrain + "</td>");
        $("#infoTable").append(newEntry);

        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    var updateInterval = setInterval(updateTimes, 60000);

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
