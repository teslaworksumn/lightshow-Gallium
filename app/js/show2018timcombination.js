const path = parent.require('path');
const timCombination = parent.require('./js/timCombination.js');

const feedback = document.getElementById('done');

async function combine(sequences) {
    const allSequences = sequences;
    const fullPathSequences = [];
    const fullDirectoryPath = document.getElementById('SelectedDirectory').innerHTML;
    const finalShowFolder = 'SHOW 2021 DO NOT EDIT';

    for (let i = 0; i < allSequences.length; i += 1) {
        allSequences[i][0] = path.join(finalShowFolder, allSequences[i][0]);

        // eslint-disable-next-line max-len
        fullPathSequences.push(allSequences[i].map(sequencePath => path.join(fullDirectoryPath, sequencePath)));
        timCombination.combineTimFiles(fullPathSequences[i]);
    }

    return [fullDirectoryPath, finalShowFolder];
}

async function combineTimFiles2021() {
    const Collide = ['1_ Collide.tim', 'Collide_AdamBarsness.tim', 'Collide_JackStruck.tim', 'Collide_JoshHeinrich.tim', 'Collide_AdamBarsness_end.tim'];
    const Arctic = ['2_Arctic_Sunrise.tim', '1_ArcticSunrise_HunterSimard.tim'];
    const Aurora = ['3_Aurora.tim', '2_Aurora_BengtSymstad.tim', '2_Aurora_AbbieFriessen.tim'];
    const Glory = ['4_Glory_to_the_Bells.tim', '5_GloryToTheBells_BrianaHerzog.tim', '5_GloryToTheBells_BengtSymstad.tim'];
    const sequences = [Collide, Arctic, Aurora, Glory];

    const paths = await combine(sequences);
    message = `Finished combining sequences.\nCombined sequences are located in '${paths[0]}/${paths[1]}'`;
    feedback.innerText = message;
}
