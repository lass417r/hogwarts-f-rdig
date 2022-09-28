`use strict`;

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("keydown", getHackPassword);

// Variables - Array allstudents, expelled students and bloodhistory
let allStudents = [];
let expelledList = [];
let bloodHistory = [];

// is the system hacked
let isHacked = false;

const settings = {
  filterBy: "all",
  filterType: "all",
  sortBy: "studentId",
  sortDir: "asc",
  search: "",
};

let keySaved = "";

//  init
async function init() {
  const urlList = "https://petlatkea.dk/2021/hogwarts/students.json";
  const urlBlood = "https://petlatkea.dk/2021/hogwarts/families.json";

  const studentList = await getData(urlList);
  const bloodList = await getData(urlBlood);

  allStudents = studentList.map(cleanUpData);
  addBlood(bloodList);
  buildList();
  regBtn();
}

//  making search, filter and sort eventListeners
function regBtn() {
  document.querySelector("#searchbar").addEventListener("input", searchFieldInput);
  document.querySelectorAll("#filter").forEach((btn) => btn.addEventListener("change", selectFilter));
  document.querySelectorAll("[data-action=sort]").forEach((btn) => btn.addEventListener("click", selectSort));
}

//  Check hacker password
function getHackPassword(event) {
  const password = "hack";
  const key = event.key;
  const currentIndex = keySaved.length;
  const keyToMatch = password.charAt(currentIndex);

  if (key === keyToMatch) {
    keySaved += key;
  } else {
    keySaved = "";
  }
  if (keySaved === password) {
    hackTheSystem();
  }
}

//  getData
async function getData(url) {
  const response = await fetch(url);
  const jsonData = await response.json();
  return jsonData;
}

function cleanUpData(studentsList, i) {
  // Student object
  Student = {
    studentId: null,
    firstName: "",
    lastName: "",
    middleName: "",
    nickName: "",
    gender: "",
    imgSrc: "",
    house: "",
    blood: "",
    prefect: false,
    expelled: false,
    inqSquad: false,
    hacker: null,
  };

  const student = Object.create(Student);

  // Variable holding data + trim spaces
  let house = studentsList.house.trim();
  let gender = studentsList.gender.trim();
  let originalName = studentsList.fullname.trim();

  // make student id desc
  student.studentId = i + 1;

  // Firstname, first char toUpperCase, rest toLowerCase
  if (originalName.includes(" ")) {
    student.firstName = originalName.substring(0, 1).toUpperCase() + originalName.substring(1, originalName.indexOf(" ")).toLowerCase();
  } else {
    student.firstName = originalName.substring(0, 1).toUpperCase() + originalName.substring(1).toLowerCase();
  }

  // Lastname, first char toUpperCase, rest toLowerCase
  if (originalName.includes(" ")) {
    student.lastName =
      originalName.substring(originalName.lastIndexOf(" ") + 1, originalName.lastIndexOf(" ") + 2).toUpperCase() + originalName.substring(originalName.lastIndexOf(" ") + 2).toLowerCase();
  }

  // Middlename, first char toUpperCase, rest toLowerCase
  student.middleName = originalName.substring(originalName.indexOf(" ") + 1, originalName.lastIndexOf(" "));
  student.middleName = student.middleName.substring(0, 1).toUpperCase() + student.middleName.substring(1).toLowerCase();

  // find nickname with ""
  if (originalName.includes(`"`)) {
    student.middleName = "";
    student.nickName = originalName.substring(originalName.indexOf(`"`), originalName.lastIndexOf(`"`) + 1);
  }

  // Gender, first char toUpperCase, rest toLowerCase
  student.gender = gender.charAt(0).toUpperCase() + gender.substring(1).toLowerCase();

  // find img destination and lowercase all
  let imgSrcHolder;
  if (originalName.includes("-")) {
    imgSrcHolder = `./assets/images/students_img/${originalName.substring(originalName.lastIndexOf("-") + 1).toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
  } else if (!originalName.includes(" ")) {
    imgSrcHolder = `./assets/images/students_img/no_picture.png`;
  } else if (originalName.toLowerCase().includes("patil")) {
    if (originalName.toLowerCase().includes("padma")) {
      imgSrcHolder = "./assets/images/students_img/patil_padma.png";
    } else if (originalName.toLowerCase().includes("parvati")) imgSrcHolder = "./assets/images/students_img/patil_parvati.png";
  } else {
    imgSrcHolder = `./assets/images/students_img/${originalName.substring(originalName.lastIndexOf(" ") + 1).toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
  }
  student.imgSrc = imgSrcHolder;

  student.house = house.charAt(0).toUpperCase() + house.substring(1).toLowerCase();

  student.gender = gender.charAt(0).toUpperCase() + gender.substring(1).toLowerCase();

  return student;
}

function addBlood(bloodStatus) {
  const pure = bloodStatus.pure;
  const half = bloodStatus.half;

  allStudents.forEach((student) => {
    if (half.includes(student.lastName)) {
      student.blood = "half";
    } else if (pure.includes(student.lastName)) {
      student.blood = "pure";
    } else {
      student.blood = "muggle";
    }
  });
}

function displayList(students) {
  // clear the list
  document.querySelector("#student_list").innerHTML = "";

  // count students
  const studentCounted = studentCounter(students);
  displayCount(studentCounted);

  // build new list
  students.forEach(displayStudent);
}

// Counting all the students, their houses, displayed and expelled
function studentCounter(students) {
  const countStudents = {
    total: 0,
    Gryffindor: 0,
    Hufflepuff: 0,
    Ravenclaw: 0,
    Slytherin: 0,
    displaying: 0,
    expelled: 0,
  };

  allStudents.forEach((student) => {
    countStudents[student.house]++;
  });

  countStudents.displaying = students.length;
  countStudents.expelled = expelledList.length;
  countStudents.total = allStudents.length;

  return countStudents;
}

function displayCount(studentCounted) {
  document.querySelector("#counter_bar #total_count").textContent = studentCounted.total;
  document.querySelector("#counter_bar #gryffindor_count").textContent = studentCounted.Gryffindor;
  document.querySelector("#counter_bar #hufflepuff_count").textContent = studentCounted.Hufflepuff;
  document.querySelector("#counter_bar #ravenclaw_count").textContent = studentCounted.Ravenclaw;
  document.querySelector("#counter_bar #slytherin_count").textContent = studentCounted.Slytherin;
  document.querySelector("#counter_bar #expelled_count").textContent = studentCounted.expelled;
  document.querySelector("#counter_bar #displaying_count").textContent = studentCounted.displaying;
}

function displayStudent(student) {
  const clone = document.querySelector("template#student").content.cloneNode(true);

  clone.querySelector("[data-field=fullname]").textContent = `${student.firstName} ${student.nickName} ${student.middleName} ${student.lastName}`;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=student_img]").src = student.imgSrc;
  clone.querySelector("[data-field=student_img]").alt = `Picture of ${student.firstName} ${student.lastName}`;
  clone.querySelector(".student_id").textContent = `Id: ${student.studentId}`;

  //  House color and crests
  const studCont = clone.querySelector(".student_container");
  const badgesCrest = clone.querySelector(`[data-field=crest]`);
  if (student.house === "Gryffindor") {
    studCont.style.borderColor = "#9c1203";
    badgesCrest.src = "assets/crests/gryffindor.png";
  } else if (student.house === "Slytherin") {
    studCont.style.borderColor = "#033807";
    badgesCrest.src = "assets/crests/slytherin.png";
  } else if (student.house === "Hufflepuff") {
    studCont.style.borderColor = "#e3a000";
    badgesCrest.src = "assets/crests/hufflepuff.png";
  } else if (student.house === "Ravenclaw") {
    studCont.style.borderColor = "#00165e";
    badgesCrest.src = "assets/crests/ravenclaw.png";
  }

  //  Prefects
  clone.querySelector("[data-field=prefect]").addEventListener("click", selectPrefect);
  clone.querySelector("[data-field=inq-squad]").addEventListener("click", selectInqSquad);

  //  Make prefect
  function selectPrefect() {
    document.querySelector(".student_container [data-field=prefect]").removeEventListener("click", selectPrefect);
    console.log("Try make prefect", student.firstName);

    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeStudentPrefect(student);
    }
    console.log(student.firstName, "is now", student.prefect, "in prefect");
    buildList();
  }

  //  Make inq squad
  function selectInqSquad() {
    document.querySelector(".student_container [data-field=inq-squad]").removeEventListener("click", selectInqSquad);

    if (isHacked) {
      student.inqSquad = true;
      buildList();

      setTimeout(removeInqSquad, 3000);
    } else {
      if (student.blood === "pure" || student.house === "Slytherin") {
        if (student.inqSquad) {
          student.inqSquad = false;
        } else {
          student.inqSquad = true;
        }
        buildList();
      } else {
        alert(`${student.firstName} can't join the Inq. squad!`);
      }
    }

    function removeInqSquad() {
      student.inqSquad = false;
      buildList();
    }
  }

  clone.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;
  clone.querySelector("[data-field=inq-squad]").dataset.inqSquad = student.inqSquad;

  if (student.expelled) {
    clone.querySelector(".student_container").classList.add("expelled");
  }
  // popup
  clone.querySelector("[data-field=show_more]").addEventListener("click", () => showDetails(student));
  //append
  document.querySelector("#student_list").appendChild(clone);
}

//  popup
function showDetails(student) {
  console.log("showDetails");

  document.querySelector(".student_container [data-field=inq-squad]").removeEventListener("click", () => showDetails(student));
  document.querySelector(".student_container [data-field=prefect]").removeEventListener("click", () => showDetails(student));
  document.querySelector(".student_container [data-field=show_more]").removeEventListener("click", () => showDetails(student));

  const htmlPage = document.querySelector("main");
  const popUp = document.querySelector("#pop_up");
  popUp.classList.add("show");
  htmlPage.classList.add("blur");

  if (student.expelled) {
    popUp.querySelector("#pop_up .content").classList.add("expelled");
  }

  //  student info
  popUp.querySelector(".student_img").src = student.imgSrc;
  popUp.querySelector("#fullname").textContent = `${student.firstName} ${student.nickName} ${student.middleName} ${student.lastName} - Nr. ${student.studentId}`;
  popUp.querySelector("#house").textContent = student.house;
  popUp.querySelector("#firstname").textContent = student.firstName;
  popUp.querySelector("#nickname").textContent = student.nickName;
  popUp.querySelector("#middlename").textContent = student.middleName;
  popUp.querySelector("#lastname").textContent = student.lastName;
  popUp.querySelector("#pop_up .blood").textContent = student.blood;

  const crestImg = document.querySelector("#pop_up .crest_img");
  const crestColor = document.querySelector("#pop_up .content");

  if (student.house === "Gryffindor") {
    crestImg.src = "assets/crests/gryffindor.png";
    crestColor.style.borderColor = "#9c1203";
  } else if (student.house === "Slytherin") {
    crestImg.src = "assets/crests/slytherin.png";
    crestColor.style.borderColor = "#033807";
  } else if (student.house === "Hufflepuff") {
    crestImg.src = "assets/crests/hufflepuff.png";
    crestColor.style.borderColor = "#e3a000";
  } else if (student.house === "Ravenclaw") {
    crestImg.src = "assets/crests/ravenclaw.png";
    crestColor.style.borderColor = "#00165e";
  }

  //  Prefects
  popUp.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;
  popUp.querySelector("[data-field=inq-squad]").dataset.inqSquad = student.inqSquad;

  // eventListener - prefect and inq squad clickable
  if (student.expelled === false || student.hacker === true) {
    popUp.querySelector("[data-field=prefect]").addEventListener("click", selectPrefect);
    popUp.querySelector("[data-field=inq-squad]").addEventListener("click", selectInqSquad);
    popUp.querySelector("#prefect_btn").addEventListener("click", selectPrefect);
    popUp.querySelector("#squad_btn").addEventListener("click", selectInqSquad);
    // expel
    document.querySelector("#expel_btn").addEventListener("click", expellStudent);
  }

  // closing
  document.querySelector(".close").addEventListener("click", closePopUp);

  // makes is possible to close popup by clicking on blured main
  document.addEventListener("mouseup", function (elm) {
    const popUpContainer = document.querySelector("#pop_up .content");
    if (!popUpContainer.contains(elm.target)) {
      closePopUp();
    }
  });

  //  make prefect
  function selectPrefect() {
    removeAllEvtListener();

    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeStudentPrefect(student);
      // student.prefect = true;
    }
    closePopUp();
    buildList();
  }

  //  make inq squad
  function selectInqSquad() {
    removeAllEvtListener();

    if (isHacked) {
      student.inqSquad = true;
      closePopUp();
      buildList();

      setTimeout(removeInqSquad, 3000);
    } else {
      if (student.blood === "pure" || student.house === "Slytherin") {
        if (student.inqSquad) {
          student.inqSquad = false;
        } else {
          student.inqSquad = true;
        }
        closePopUp();
        buildList();
      } else {
        alert(`${student.firstName} can't join the Inq. squad!`);
      }
    }

    function removeInqSquad() {
      student.inqSquad = false;
      closePopUp();
      buildList();
    }
  }

  if (student.prefect) {
    popUp.querySelector(".badges_btn #prefect_btn").textContent = "Remove Perfect";
  } else {
    popUp.querySelector(".badges_btn #prefect_btn").textContent = "Make Perfect";
  }

  if (student.inqSquad) {
    popUp.querySelector(".badges_btn #squad_btn").textContent = "Remove from Inq. squad";
  } else {
    popUp.querySelector(".badges_btn #squad_btn").textContent = "Add to Inq. squad";
  }

  //  expelled
  function expellStudent() {
    console.log("ExpellStudent");
    document.querySelector("#expel_btn").removeEventListener("click", expellStudent);

    if (student.firstName != "Lasse" && student.lastName != "Andersen") {
      allStudents.splice(allStudents.indexOf(student), 1);
      student.expelled = true;
      expelledList.push(student);
      buildList();
      console.log(expelledList);
      // console.log(expStudent);
    } else {
      alert("Can't be expelled!");
    }
    closePopUp();
  }

  function removeAllEvtListener() {
    document.querySelector("#pop_up [data-field=prefect]").removeEventListener("click", selectPrefect);
    document.querySelector("#pop_up #prefect_btn").removeEventListener("click", selectPrefect);

    document.querySelector("#pop_up [data-field=inq-squad]").removeEventListener("click", selectInqSquad);
    document.querySelector("#pop_up #squad_btn").removeEventListener("click", selectInqSquad);

    document.querySelector("#expel_btn").removeEventListener("click", expellStudent);
    document.querySelector(".close").removeEventListener("click", closePopUp);
  }

  function closePopUp() {
    document.querySelector("#pop_up .content").classList.remove("expelled");
    document.querySelector(".close").removeEventListener("click", closePopUp);
    document.querySelector("#pop_up").classList.remove("show");
    document.querySelector("main").classList.remove("blur");
  }
}

//  prefect
function tryToMakeStudentPrefect(selectedStudent) {
  const prefects = allStudents.filter((student) => student.prefect && student.house === selectedStudent.house);

  const numberOfPrefects = prefects.length;

  if (numberOfPrefects >= 2) {
    console.log("There can only be two prefects!");
    removeAorB(prefects[0], prefects[1]);
  } else {
    makePrefect(selectedStudent);
  }

  function removeAorB(prefectA, prefectB) {
    // ask user to ignnore, or remove A or B
    document.querySelector("#remove_aorb").classList.add("show");
    document.querySelector("#remove_aorb .close_dialog").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb [data-action=remove1]").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb [data-action=remove2]").addEventListener("click", clickRemoveB);

    // names on options
    document.querySelector("#remove_aorb .student1").textContent = prefectA.firstName;
    document.querySelector("#remove_aorb .student2").textContent = prefectB.firstName;

    function closeDialog() {
      document.querySelector("#remove_aorb").classList.remove("show");
      document.querySelector("#remove_aorb .close_dialog").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb [data-action=remove1]").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb [data-action=remove2]").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }

    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(studentPrefect) {
    studentPrefect.prefect = false;
  }

  function makePrefect(studentPrefect) {
    studentPrefect.prefect = true;
  }
}

//  searchbar
function searchFieldInput(evt) {
  settings.search = evt.target.value;
  buildList();
}

function searchList(list) {
  return list.filter((student) => {
    return (
      student.firstName.toUpperCase().includes(settings.search.toUpperCase()) ||
      student.lastName.toUpperCase().includes(settings.search.toUpperCase()) ||
      student.house.toUpperCase().includes(settings.search.toUpperCase())
    );
  });
}

//  filter
function selectFilter(event) {
  // console.log("selectFilter");
  // console.log(event);
  const filterBy = event.target.value;

  //find selected options element
  const oldElement = document.querySelector(`[value="${filterBy}"]`);
  // console.log(oldElement);
  const filterType = oldElement.dataset.filter_type;
  // console.log(filterType);
  const isTrue = oldElement.dataset.filter;

  setFilter(filterBy, filterType, isTrue);
}

function setFilter(filterBy, filterType, isTrue) {
  // console.log(filterBy, filterType);
  if (isTrue === "true") {
    settings.filterBy = true;
  } else {
    settings.filterBy = filterBy;
  }
  settings.filterType = filterType;
  buildList();
}

function filterList(student) {
  // console.log("type", settings.filterType, "by", settings.filterBy);
  // console.log(student.prefect);
  // console.log(student[settings.filterType]);
  if (student[settings.filterType] === settings.filterBy || settings.filterBy === "all") {
    return true;
  } else {
    return false;
  }
}

//  sorting
function selectSort(event) {
  // console.log("selectSort:", this);
  // console.log(event);
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //Sort direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`user selected: ${sortBy} and ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  // console.log(settings.sortBy);
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);
  function sortByProperty(a, b) {
    // console.log(a[settings.sortBy] < b[settings.sortBy]);
    if (a[settings.sortBy] < b[settings.sortBy]) {
      return -1 * direction;
    } else {
      return direction;
    }
  }
  return sortedList;
}

function getSelectedList() {
  if (settings.filterType === "expelled") {
    return expelledList;
  } else {
    return allStudents;
  }
}

function buildList() {
  if (settings.filterType === "expelled") {
    displayList(expelledList);
  } else {
    const selectedList = getSelectedList();
    const filteredList = selectedList.filter(filterList);
    const sortedList = sortList(filteredList);
    const searchedList = searchList(sortedList);
    displayList(searchedList);
  }
}

function hackTheSystem() {
  console.log("hackTheSystem");
  if (isHacked) {
    console.log("The system is hacked");
  } else {
    document.querySelector("#screen").classList.add("hidden");
    setTimeout(destroyWebsite, 2500);
    function destroyWebsite() {
      document.querySelector("h1").textContent = "Hogwarts god pwned!";
      document.querySelector("body").style.backgroundColor = "green";
      document.querySelector("#screen").style.backgroundColor = "rgb(0, 255, 0)";
      document.querySelector("#content").style.backgroundColor = "rgb(0, 255, 0)";
      document.querySelector(".background_color").style.backgroundColor = "rgb(0, 255, 0)";
      document.querySelector("#bezel").style.backgroundImage = "url(assets/images/bezel2hacked.png)";
      document.querySelector("#screen").classList.remove("hidden");
    }
    hackBlood();
    const hacker = createHacker();
    allStudents.push(hacker);
    buildList();
  }
}

function createHacker() {
  const hacker = Object.create(allStudents);
  hacker.firstName = "Lasse";
  hacker.lastName = "Andersen";
  hacker.middleName = "Godtkjær";
  hacker.nickName = `"Hacker"`;
  hacker.gender = "boy";
  hacker.imgSrc = "assets/images/students_img/andersen_l.png";
  hacker.house = "Owner of Hogwarts";
  hacker.blood = "Pure";
  hacker.hacker = true;
  hacker.studentId = "69";
  // console.log(mySelf);

  return hacker;
}

function hackBlood() {
  allStudents.forEach((student) => {
    const randomNumber = Math.floor(Math.random() * 3);
    const randomBloodArr = ["muggle", "half", "pure"];

    if (student.blood === "half" || student.blood === "muggle") {
      student.blood = "pure";
    } else if (student.blood === "pure") {
      student.blood = randomBloodArr[randomNumber];
    }
  });
}
