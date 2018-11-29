const path = parent.require('path');
const fse = parent.require('fs-extra');
const timCombination = parent.require('./js/timCombination.js');
const feedback = document.getElementById('done');
const submit = document.getElementById('submit');

async function combineTimFiles2018() {
    const ClearSky = ['1_Clear_Sky.tim', '1_Clear_Sky_Bengt.tim', '1_Clear_Sky_Chris_Walaszek.tim', '1_Clear_Sky_Eileen_Campbell.tim'];
    const Unicorn = ['2_Unicorn_Adventure.tim', '2_Unicorn_Adventure_Kayla_Engelstad.tim', '2_Unicorn_Adventure_Kailey_Pierce.tim'];
    const Dragons = ['3_Dragons_and_Dragons.tim', '3_Dragons_and_Dragons_Adam_Barsness.tim', '3_Dragons_and_Dragons_Leyla_Soykan.tim'];
    const Artic = ['4_Artic_Sunrise.tim', '4_Arctic_Sunrise_Jacob_Diethert.tim', '4_Arctic_Sunrise_Jacqueline_Sorenson.tim'];
    const Glory = ['5_Glory_to_the_Bells.tim', '5_Glory_to_the_Bells_Haley Carrero.tim', '5_Glory_to_the_Bells_Ian_Smith.tim'];


    const sequences = [ClearSky, Unicorn, Dragons, Artic, Glory];
    submit.setAttribute("disabled", "");
    await combine(sequences);
}

async function combine(sequences) {
    const fullDirectoryPath =
        document.getElementById('SelectedDirectory').innerHTML;

    if (fullDirectoryPath === "") {
        feedback.innerText = "Select a directory and try again";
        submit.removeAttribute("disabled");
        return;
    }

    if (!fse.existsSync(fullDirectoryPath)) {
        feedback.innerText = "Selected Directory does not exist.  Try again";
        submit.removeAttribute("disabled");
        return;
    }
    const FinalShowFolder = 'SHOW 2018 DO NOT EDIT';


    feedback.innerText = "Combining sequences...";
    const fullPathSequences = [];
    for (let i = 0; i < sequences.length; i++) {
        const message = "Combining sequence " + (i + 1).toString() + "/" + sequences.length.toString();
        console.log(message);
        feedback.innerText = message;
        sequences[i][0] = path.join(FinalShowFolder, sequences[i][0]);
        fullPathSequences.push(sequences[i].map(sequencePath => path.join(fullDirectoryPath, sequencePath)));
        timCombination.combineTimFiles(fullPathSequences[i]);
    }
    submit.removeAttribute("disabled");
    feedback.innerText = 'Done';
}
