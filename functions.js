

//perse level and term
function parseLevelTerm(str) {
    // Regex to extract level and term
    const match = str.match(/Level (\d+)\s*-\s*Term\s+(\w+)/);
    if (!match) return null; // return null if string doesn't match

    const level = Number(match[1]);

    // Map Roman numerals to numbers
    const romanMap = {
        "I": 1,
        "II": 2,
        "III": 3,
        "IV": 4,
        "V": 5,
        // add more if needed
    };

    const term = romanMap[match[2]] || 0;

    return { level, term };
}

//Grade to point
function letterToGradePoint(letter) {
    // Map of letter grades to grade points
    const gradeMap = {
        "A+": 4.0,
        "A": 3.75,
        "A-": 3.5,
        "B+": 3.25,
        "B": 3.0,
        "B-": 2.75,
        "C+": 2.5,
        "C": 2.25,
        "D": 2.0,
        "F": 0
    };

    // Return grade point or null if not found
    return gradeMap[letter] ?? null;
}

//CGPA Calculator
function calculateCGPA(courses) {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
        if (typeof course.courseCredit === "number" && typeof course.gradePoint === "number") {
            totalPoints += course.courseCredit * course.gradePoint;
            totalCredits += course.courseCredit;
            
        }
    });

    if (totalCredits === 0) return 0;

    return +(totalPoints / totalCredits).toFixed(2); // Round to 2 decimals
}

//insert external html
async function insertExternalHtml() {
    const targetSection = document.getElementsByClassName("wrapper");
    try {
        //inserting external html
        const response = await fetch(chrome.runtime.getURL("insert.html"));
        if(!response) throw new Error("getting html failed");

        const html = await response.text();
        
        const container = document.createElement("div");
        container.innerHTML = html;
        targetSection[0].insertBefore(container, targetSection[0].firstChild);

    } catch (error) {
        console.log(error);
    }
}

//Term Wise Result
function termWiseResult(allData){
    let termWiseResultData = [];
    const allLevels = [...new Set(allData.map((data) => data.level))].sort();
    const terms = [1, 2];

    allLevels.forEach((level) => {
        terms.forEach((term) => {
            const levelTermData = allData.filter((data) => data.level === level && data.term === term );
            termWiseResultData.push({
                level: level,
                term: term,
                cgpa: calculateCGPA(levelTermData)
            });

        });
    });

    return termWiseResultData;

    

}

//Show term wise result
function showTermWiseResult(allData){
    const termWiseResultBox = document.getElementById("termWiseResultBox");
    const termWiseResults = termWiseResult(allData);
    termWiseResults.forEach((result) => {
        const card = document.createElement("div");
        card.className = "termWiseResultCard bg-white rounded-xl p-2 shadow";

        card.innerHTML = `
            <div class="border-b text-xl border-gray-300 py-2 flex justify-center font-semibold">
                L-${result.level} T-${result.term}
            </div>
            <div class="text-2xl flex justify-center items-center py-4">
                ${result.cgpa}
            </div>
        `;
        termWiseResultBox.appendChild(card);

    });
}

//Show Course Summary
function showCourseSummary(allData) {

    //Showing total courses
    const totalCourses = document.getElementById("totalCourses");
    totalCourses.innerText =   allData.length;

    //Showing total credit attended
    let sumCredit = 0;
    const totalCreditAttended = document.getElementById("totalCreditAttended");
    allData.forEach((data) => sumCredit = sumCredit + data.courseCredit);
    totalCreditAttended.innerText = `Total Credit:  ${sumCredit}`;

    //Showing total theory and lab courses
    let sumTheoryCourses= 0;
    let sumLabCourses = 0
    const totalTheoryCourses = document.getElementById("totalTheoryCourses");
    const totalLabCourses = document.getElementById("totalLabCourses");
    allData.forEach((data) => {
        if(data.sessional === "No") {
            sumTheoryCourses = sumTheoryCourses + 1;
        } else {
            sumLabCourses = sumLabCourses + 1;
        }
    });
    totalTheoryCourses.innerText = `Theory Courses: ${sumTheoryCourses}`;
    totalLabCourses.innerText = `Sessional Courses: ${sumLabCourses}`;


    //Showing Cleared and Short Courses
    let sumClearedCourses = 0;
    let sumShortCourses = 0;

    const clearedCourses = document.getElementById("clearedCourses");
    const shortCourses = document.getElementById("shortCourses");

    allData.forEach((data) => {
        if(data.gradePoint === 0) {
            sumShortCourses += 1;
        } else {
            sumClearedCourses += 1;
        }
    })

    clearedCourses.innerText = sumClearedCourses;
    shortCourses.innerText = sumShortCourses;


    
}

//Subjects per grade
function subjectsPerGrade(allData, yesNo) {

    grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];
    const subjectPerGradeCount = grades
    .map(grade => ({
        letterGrade: grade,
        subjectCount: allData.filter(d => d.letterGrade === grade && d.sessional === yesNo).length
    }))
    .filter(item => item.subjectCount > 0);

    return subjectPerGradeCount;
}

//Showing subject per grade
function showSubjectPerGrade(allData){
    const theoryCourseGradeBox = document.getElementById("theoryCourseGradeBox");
    const sessionalCourseGradeBox = document.getElementById("sessionalCourseGradeBox");

    subjectsPerGrade(allData, "No").forEach((value) => {

        const courseGradeBoxCard = document.createElement("div");
        courseGradeBoxCard.className = "bg-white flex rounded-xl shadow p-2 justify-center items-center";
        courseGradeBoxCard.innerHTML = `
            <div class="font-medium text-xl w-1/2 flex justify-center items-center border-r border-gray-200 p-2">${value.letterGrade}</div><div class="w-1/2 flex justify-center items-center p-2 text-xl">${value.subjectCount}</div>
        `;

        theoryCourseGradeBox.appendChild(courseGradeBoxCard);
    });

    subjectsPerGrade(allData, "Yes").forEach((value) => {

        const courseGradeBoxCard = document.createElement("div");
        courseGradeBoxCard.className = "bg-white flex rounded-xl shadow p-2 justify-center items-center";
        courseGradeBoxCard.innerHTML = `
            <div class="font-medium text-xl w-1/2 flex justify-center items-center border-r border-gray-200 p-2">${value.letterGrade}</div><div class=" w-1/2 flex justify-center items-center p-2 text-xl">${value.subjectCount}</div>
        `;

        sessionalCourseGradeBox.appendChild(courseGradeBoxCard);
    });
    
}

//Showing graph
function cgpaVsLT(allData){

    const ctx = document.getElementById('myChart');
    const termResults = termWiseResult(allData);

    new Chart(ctx, {
        type: 'line',
        data: {
        labels: termResults.map(e => `L${e.level} T${e.term}`),//['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: "CGPA",
            data: termResults.map(e => e.cgpa),//[12, 19, 3, 5, 2, 3],
            borderWidth: 1,
            tension: 0.8,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }]
        },
        options: {
            scales: {
                y: {
                beginAtZero: true,
                beginAtZero: false,
                suggestedMin: Math.min(...termResults.map(e => e.cgpa)) - 0.5,
                suggestedMax: Math.max(...termResults.map(e => e.cgpa)) + 0.5
                }
            }

        }
    });

}

//Target Cgpa Calculator
function targetCgpaCalculator(allData, targetCgpa, nextTermCredit){
    const currentCgpa = calculateCGPA(allData);
    const allCgpa = termWiseResult(allData);
    const credit = allData.map(e => e.courseCredit).reduce((a, b) => a + b, 0);

    const avgCredit = credit/allCgpa.length;
    if (nextTermCredit === "") nextTermCredit = avgCredit;


    const requiredCgpa = ((targetCgpa*(credit + nextTermCredit)) - (currentCgpa*credit))/nextTermCredit;

    return requiredCgpa.toFixed(2);
}

//Show target Cgpa
function showTargetCgpa(allData){
    const targetCgpa = document.getElementById("targetCgpa");
    const nextTermCredit = document.getElementById("nextTermCredit");
    const nextTermCgpa = document.getElementById("nextTermCgpa");
    const targetCgpaBtn = document.getElementById("targetCgpaBtn");
    const nextTermCgpaContainer = document.getElementById("nextTermCgpaContainer");

    targetCgpaBtn.addEventListener("click", () => {
        const targetCgpaValue = targetCgpa.value;
        const nextTermCreditValue = nextTermCredit.value === ""? "": Number(nextTermCredit.value);

        console.log(nextTermCredit.value === Number);

        const nextTermCgpaValue = targetCgpaCalculator(allData, targetCgpaValue, nextTermCreditValue);
        nextTermCgpaContainer.classList.remove("hidden");
        nextTermCgpa.innerText = nextTermCgpaValue;

    });
}


//Adding first Field to Whatif Container
function firstFieldToWhatifContainer(allData) {

    const whatifFieldContainer = document.getElementById("whatifFieldContainer");

    const div = document.createElement("div");
    div.className = "grid grid-cols-2 gap-2 h-1/2";


    const select1 = document.createElement("select");
    select1.className = "border border-gray-300 rounded-xl h-full p-4 text-xl"

    const optionFieldSelected = document.createElement("option");
    optionFieldSelected.innerText = "Select a subject ...";
    optionFieldSelected.selected = "true";
    select1.appendChild(optionFieldSelected);

    const select2 = document.createElement("select");
    select2.className = "border border-gray-300 rounded-xl h-full p-4 text-xl"

    const gradeOptionFieldSelected = document.createElement("option");
    gradeOptionFieldSelected.innerText = "What if grade...";
    optionFieldSelected.selected = "true";
    select2.appendChild(gradeOptionFieldSelected);

    const gradePoints = [
        { letterGrade: "A+", gradePoint: 4.00 },
        { letterGrade: "A",  gradePoint: 3.75 },
        { letterGrade: "A-", gradePoint: 3.50 },
        { letterGrade: "B+", gradePoint: 3.25 },
        { letterGrade: "B",  gradePoint: 3.00 },
        { letterGrade: "B-", gradePoint: 2.75 },
        { letterGrade: "C+", gradePoint: 2.50 },
        { letterGrade: "C",  gradePoint: 2.25 },
        { letterGrade: "D",  gradePoint: 2.00 },
        { letterGrade: "F",  gradePoint: 0.00 }
    ];


    allData.forEach((data) => {

        const optionField = document.createElement("option");
        optionField.value = data.courseCode
        optionField.innerText = `${data.courseCode} (${data.letterGrade})`
        
        select1.appendChild(optionField);
        
    })

    gradePoints.forEach((grade) => {
        const optionField = document.createElement("option");
        optionField.value = grade.gradePoint
        optionField.innerText = `${grade.letterGrade} (${grade.gradePoint})`
        
        select2.appendChild(optionField);

    })

    div.appendChild(select1);
    div.appendChild(select2);

    whatifFieldContainer.appendChild(div);

}

//Creating field for whatif container

function creatingFieldForWhatifContainer(allData) {
    const whatifFieldContainer = document.getElementById("whatifFieldContainer");

    const div = document.createElement("div");
    div.className = "flex gap-2 h-1/2 justify-between";


    const removeBtn = document.createElement("button");
    removeBtn.className = "w-2/18 flex justify-center items-center";
    removeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-width="3" d="M5 12h14" />
        </svg>
    `;

    removeBtn.addEventListener("click", () => {
        div.remove();
        const invalidWhatifOverallCgpaContainer = document.getElementById("invalidWhatifOverallCgpaContainer");
        invalidWhatifOverallCgpaContainer.classList.add("hidden");

        const whatifOverallCgpaContainer = document.getElementById("whatifOverallCgpaContainer");
        whatifOverallCgpaContainer.classList.add("hidden");

    })

    const select1 = document.createElement("select");
    select1.className = "border w-8/18 border-gray-300 rounded-xl h-full p-4 text-xl"

    const optionFieldSelected = document.createElement("option");
    optionFieldSelected.innerText = "Select a subject ...";
    optionFieldSelected.selected = "true";
    select1.appendChild(optionFieldSelected);

    const select2 = document.createElement("select");
    select2.className = "border w-8/18 border-gray-300 rounded-xl h-full p-4 text-xl"

    const gradeOptionFieldSelected = document.createElement("option");
    gradeOptionFieldSelected.innerText = "What if grade...";
    optionFieldSelected.selected = "true";
    select2.appendChild(gradeOptionFieldSelected);

    const gradePoints = [
        { letterGrade: "A+", gradePoint: 4.00 },
        { letterGrade: "A",  gradePoint: 3.75 },
        { letterGrade: "A-", gradePoint: 3.50 },
        { letterGrade: "B+", gradePoint: 3.25 },
        { letterGrade: "B",  gradePoint: 3.00 },
        { letterGrade: "B-", gradePoint: 2.75 },
        { letterGrade: "C+", gradePoint: 2.50 },
        { letterGrade: "C",  gradePoint: 2.25 },
        { letterGrade: "D",  gradePoint: 2.00 },
        { letterGrade: "F",  gradePoint: 0.00 }
    ];


    allData.forEach((data) => {

        const optionField = document.createElement("option");
        optionField.value = data.courseCode
        optionField.innerText = `${data.courseCode} (${data.letterGrade})`
        
        select1.appendChild(optionField);
        
    })

    gradePoints.forEach((grade) => {
        const optionField = document.createElement("option");
        optionField.value = grade.gradePoint
        optionField.innerText = `${grade.letterGrade} (${grade.gradePoint})`
        
        select2.appendChild(optionField);

    })

    div.appendChild(select1);
    div.appendChild(select2);
    div.appendChild(removeBtn);

    whatifFieldContainer.appendChild(div);
}


//Adding field to what if container
function addFieldToWhatifContainer(allData){
    const addWhatifField = document.getElementById("addWhatifField");

    addWhatifField.addEventListener("click", () => {
        creatingFieldForWhatifContainer(allData);
    })

}

//What if show result
function whatifShowResult(allData){

    const modifiedCgpa = document.getElementById("modifiedCgpa");
    const whatifOverallCgpaContainer = document.getElementById("whatifOverallCgpaContainer");
    const invalidWhatifOverallCgpaContainer = document.getElementById("invalidWhatifOverallCgpaContainer");

    const userData = [];
    const whatifFieldContainer = document.getElementById("whatifFieldContainer");
    
    const allDivs = whatifFieldContainer.querySelectorAll("div");


    for (let div of allDivs) {
        const selects = div.querySelectorAll("select");

        if (selects[0].value === "Select a subject ..." || isNaN(Number(selects[1].value))) {
            whatifOverallCgpaContainer.classList.add("hidden"); 
            invalidWhatifOverallCgpaContainer.classList.remove("hidden");
            return;
        }

        userData.push({
            courseCode: selects[0].value,
            gradePoint: Number(selects[1].value)
        });
    };



    const modifiedAllData = allData.map(data => {
        const match = userData.find(d => d.courseCode === data.courseCode);
        return {
            ...data,
            gradePoint: match ? match.gradePoint : data.gradePoint
        };
    });

    
    invalidWhatifOverallCgpaContainer.classList.add("hidden");
    whatifOverallCgpaContainer.classList.remove("hidden");
    modifiedCgpa.innerText = calculateCGPA(modifiedAllData);

}


//Last term result
function lastTermResult(allData) {
    const levels = allData.map(d => Number(d.level));
    const lastLevel = Math.max(...levels);


    const terms = allData.filter( e => e.level === lastLevel).map(d => Number(d.term));
    const lastTerm = Math.max(...terms);

    const lastTermDataTheory = allData.filter(d => d.level === lastLevel && d.term === lastTerm && d.sessional === "No");
    const lastTermDataLab = allData.filter(d => d.level === lastLevel && d.term === lastTerm && d.sessional === "Yes");


    const lastTermResultTheory = document.getElementById("lastTermResultTheory");
    const lastTermResultTheoryElems = lastTermResultTheory.querySelectorAll("div");

    lastTermResultTheoryElems[0].innerText = `Theory (${lastTermDataTheory.length})`;

    lastTermDataTheory.forEach((d) => {
        const div = document.createElement("div");
        div.innerText = `${d.courseCode}: ${d.letterGrade}`;
        lastTermResultTheoryElems[1].appendChild(div);
    })



    const lastTermResultLab = document.getElementById("lastTermResultLab");
    const lastTermResultLabElems = lastTermResultLab.querySelectorAll("div");

    lastTermResultLabElems[0].innerText = `Sessional (${lastTermDataLab.length})`;

    lastTermDataLab.forEach((d) => {
        const div = document.createElement("div");
        div.innerText = `${d.courseCode}: ${d.letterGrade}`;
        lastTermResultLabElems[1].appendChild(div);
    })
    
    const lastTermResultHeading = document.getElementById("lastTermResultHeading");
    lastTermResultHeading.innerText =`Last Term (L-${lastLevel} T-${lastTerm}) Result:`

}


//developer page
function developerPage(){
    const developerImgElem = document.getElementById("developerImgElem");
    const img = document.createElement("img");
    img.alt = "Suez Sohan";
    img.className = "w-80";
    img.src = chrome.runtime.getURL("images/developerPic.png");
    developerImgElem.appendChild(img);

    const goBackFromDeveloper = document.getElementById("goBackFromDeveloper");
    const analysisWrapper = document.getElementById("analysisWrapper");
    const developerPageWrapper = document.getElementById("developerPageWrapper");
    const gotoDeveloperPage = document.getElementById("gotoDeveloperPage");

    gotoDeveloperPage.addEventListener("click", () => {
        analysisWrapper.classList.add("hidden");
        developerPageWrapper.classList.remove("hidden");
    })

    goBackFromDeveloper.addEventListener("click", () => {
        analysisWrapper.classList.remove("hidden");
        developerPageWrapper.classList.add("hidden");

    });


}