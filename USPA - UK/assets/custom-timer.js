
// Function to update the countdown
function updateCountdown(endTime) {
  const now = new Date();
  const timeDifference = endTime - now;

  const millisecondsInADay = 1000 * 60 * 60 * 24;
  const days = Math.floor(timeDifference / millisecondsInADay);
  const hours = Math.floor((timeDifference % millisecondsInADay) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  // Update the countdown elements
  const daysValue = padZero(days);
  document.getElementById('days').textContent = daysValue.firstDigit.toString() + daysValue.secondDigit.toString();

  const hoursValue = padZero(hours);
  document.getElementById('hours').innerHTML = hoursValue.firstDigit.toString() + hoursValue.secondDigit.toString();

  const minutesValue = padZero(minutes);
  document.getElementById('minutes').innerHTML = minutesValue.firstDigit.toString() + minutesValue.secondDigit.toString();

  const secondsValue = padZero(seconds);
  document.getElementById('seconds').innerHTML = secondsValue.firstDigit.toString() + secondsValue.secondDigit.toString();

  // If the countdown is still running, update every second
  if (timeDifference > 0) {
    setTimeout(function () {
      updateCountdown(endTime);
    }, 1000);
  } else {
    document.getElementById('days').innerHTML = "00";
    document.getElementById('hours').innerHTML = "00";
    document.getElementById('minutes').innerHTML = "00";
    document.getElementById('seconds').innerHTML = "00";
  }
}

// Function to pad single-digit numbers with a leading zero
function padZero(number) {
  const value = number < 10 ? { firstDigit: 0, secondDigit: number } : { firstDigit: Math.floor(number / 10), secondDigit: number % 10 };
  return value;
}


// Set the end time for the countdown (replace with your desired end time)
const enteredDate = document.querySelector("#date").dataset.date
const endTime = new Date(`${ enteredDate }`);
console.log(endTime)
console.log(new Date())
console.log(new Date(endTime - new Date()))
// Start the countdown
updateCountdown(endTime);
