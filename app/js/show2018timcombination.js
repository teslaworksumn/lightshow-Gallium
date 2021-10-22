const path = parent.require('path');
const timCombination = parent.require('./js/timCombination.js');

const feedback = document.getElementById('done');

async function combine(sequences) {
    const allSequences = sequences;
    const fullPathSequences = [];
    const fullDirectoryPath = document.getElementById('SelectedDirectory').innerHTML;
    const finalShowFolder = 'SHOW 2018 DO NOT EDIT';

    for (let i = 0; i < allSequences.length; i += 1) {
        allSequences[i][0] = path.join(finalShowFolder, allSequences[i][0]);

        // eslint-disable-next-line max-len
        fullPathSequences.push(allSequences[i].map((sequencePath) => path.join(fullDirectoryPath, sequencePath)));
        timCombination.combineTimFiles(fullPathSequences[i]);
    }

    return [fullDirectoryPath, finalShowFolder];
}

async function combineTimFiles2018() {
    const ClearSky = ['1_Clear_Sky.tim', '1_Clear_Sky_Bengt.tim', '1_Clear_Sky_Chris_Walaszek.tim', '1_Clear_Sky_Eileen_Campbell.tim'];
    const Unicorn = ['2_Unicorn_Adventure.tim', '2_Unicorn_Adventure_Kayla_Engelstad.tim', '2_Unicorn_Adventure_Kailey_Pierce.tim'];
    const Dragons = ['3_Dragons_and_Dragons.tim', '3_Dragons_and_Dragons_Adam_Barsness.tim', '3_Dragons_and_Dragons_Leyla_Soykan.tim'];
    const Artic = ['4_Artic_Sunrise.tim', '4_Arctic_Sunrise_Jacob_Diethert.tim', '4_Arctic_Sunrise_Jacqueline_Sorenson.tim'];
    const Glory = ['5_Glory_to_the_Bells.tim', '5_Glory_to_the_Bells_Haley Carrero.tim', '5_Glory_to_the_Bells_Ian_Smith.tim'];
    const sequences = [ClearSky, Unicorn, Dragons, Artic, Glory];

    const paths = await combine(sequences);
    message = `Finished combining sequences.\nCombined sequences are located in '${paths[0]}/${paths[1]}'`;
    feedback.innerText = message;
}
