"use strict";

// Data
const account1 = {
  owner: "Michael Haslinsky",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account2 = {
  owner: "Valon Rama",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
let theme = document.getElementById("theme");

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
const btnTheme = document.querySelector(".switch");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

let currentAccount, timer, themeFlag;

//force login for testing
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = "1";

// functions

function formatCur(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
}

function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = "";

  //checks if sort flag set to display movements high to low
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    //dates of movements
    let formattedDate = new Date(acc.movementsDates[i]).toLocaleDateString(
      currentAccount.locale
    );

    const movSign = mov > 0 ? `$${mov}` : `-$${Math.abs(mov)}`;

    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${formattedDate}</div>
    <div class="movements__value">${formattedMov}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

function calcPrintBalance(account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${formatCur(
    account.balance,
    account.locale,
    account.currency
  )}`;
}

function createUsernames(accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
}

function calcDisplaySummary(account) {
  const deposits = account.movements
    .filter((move) => move > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(
    deposits,
    account.locale,
    account.currency
  )}`;

  const withdrawals = account.movements
    .filter((move) => move < 0)
    .reduce((acc, mov) => acc - mov, 0);
  labelSumOut.textContent = `${formatCur(
    withdrawals,
    account.locale,
    account.currency
  )}`;

  const interest = account.movements
    .filter((move) => move > 0)
    .map((mov) => mov * (account.interestRate * 0.01))
    .filter((intAmt) => intAmt > 1)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumInterest.textContent = `${formatCur(
    interest,
    account.locale,
    account.currency
  )}`;
}

function updateUI(currentAccount) {
  calcDisplaySummary(currentAccount);
  displayMovements(currentAccount);
  calcPrintBalance(currentAccount);
}

createUsernames(accounts);

function login(e) {
  //prevents page refresh
  e.preventDefault();
  resetTimer();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log("Successful Login");
    updateUI(currentAccount);
    inputLoginPin.value = inputLoginUsername.value = "";
    inputLoginPin.blur();
    inputLoginUsername.blur();
    containerApp.style.opacity = "1";
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.substr(
      0,
      currentAccount.owner.indexOf(` `)
    )}`;
  }
}

function resetTimer() {
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
}

function startLogoutTimer() {
  let time = 600;

  function tick() {
    const min = time / 60;
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${Math.floor(min)}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      currentAccount = "";
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `You've been logged out due to inactivty`;
    }
    time--;
  }
  tick();
  const timer = setInterval(function () {
    tick();
  }, 1000);
  return timer;
}

//EVENT HANDLERS

//change css theme
btnTheme.addEventListener(`change`, function (e) {
  e.preventDefault();
  themeFlag = !themeFlag;
  if (themeFlag) {
    theme.setAttribute("href", `light.css`);
  } else {
    theme.setAttribute("href", `dark.css`);
  }
});

btnLogin.addEventListener(`click`, function (e) {
  login(e);
  const formattedDate = new Date(new Date().toISOString()).toLocaleString(
    currentAccount.locale
  );
  labelDate.textContent = formattedDate;
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  resetTimer();
  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferTo.blur();
  inputTransferAmount.blur();
  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    recieverAcc &&
    recieverAcc.username !== currentAccount.username
  ) {
    //transfer
    currentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);
    //transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    labelWelcome.style.opacity = "0";
  } else {
    labelWelcome.textContent = "Enter Valid Amount and Account";
    labelWelcome.style.opacity = "1";
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  resetTimer();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = "0";
    console.log(accounts);
  } else {
    console.log("no worky");
    console.log(accounts);
  }
  inputClosePin.value = inputCloseUsername.value = "";
  inputClosePin.blur();
  inputCloseUsername.blur();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  resetTimer();
  //returns largest integer below amt
  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    //emulating time for bank to approve loan
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = "";
  inputLoanAmount.blur();
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault;
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
