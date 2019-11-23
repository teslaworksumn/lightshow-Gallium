#!/bin/bash -eu

# node timConversion.js ../gallium-test-files/basicEffects/allon_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 100
# diff ./test.csv ../gallium-test-files/basicEffects/allon_setLevel_100.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/complicated_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 25
# diff ./test.csv ../gallium-test-files/basicEffects/complicated_setLevel_25.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/verycomplicated_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 100
# diff ./test.csv ../gallium-test-files/basicEffects/verycomplicated_setLevel_100.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/verycomplicated_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 50
# diff ./test.csv ../gallium-test-files/basicEffects/verycomplicated_setLevel_50.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/verycomplicated_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 25
# diff ./test.csv ../gallium-test-files/basicEffects/verycomplicated_setLevel_25.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/verycomplicated_long_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 100
# diff ./test.csv ../gallium-test-files/basicEffects/verycomplicated_long_setLevel_100.csv --strip-trailing-cr | wc -l

node timConversion.js ../gallium-test-files/basicEffects/verycomplicated_long_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml 25
diff ./test.csv ../gallium-test-files/basicEffects/verycomplicated_long_setLevel_25.csv --strip-trailing-cr | wc -l


