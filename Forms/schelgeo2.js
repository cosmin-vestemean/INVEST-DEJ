lib.include('utils');

function EXECCOMMAND(cmd) {
    if (cmd == '202206301') {
        //adauga consumator(i) selectat din schema electrica
        var enumLinii = getSelectedFromGrid('dsConsumatori', 'CCCLINIICIRCUIT');
        var enumCircuite = getSelectedFromGrid('dgCircuite', 'CCCCIRCUIT');
        var enumSurse = getSelectedFromGrid('dgSurse1', 'CCCTABLOU');
        X.WARNING(enumSurse + '\n' + enumCircuite + '\n' + enumLinii);
    }
}

function ON_LOCATE() {
    showAllButMarunt();
    X.SETPROPERTY('MERGECHANGELOG', 1);
}

var filterConsumator = "{CCCCONSUMATOR.DENUMIRE} <> 'MATERIAL MARUNT' AND {CCCCONSUMATOR.DENUMIRE} <> 'MATERIAL MARUNT (AUX)' AND {CCCCONSUMATOR.DENUMIRE} <> 'MATERIAL MARUNT (AUX sursa material marunt)'",
    filterTablou = "{CCCTABLOURI.DENUMIRE} <> 'MATERIAL MARUNT' AND {CCCTABLOURI.DENUMIRE} <> 'MATERIAL MARUNT (AUX sursa material marunt)'",
    filterGeneric = "{CCCARTGEN.CCCMTRLGEN_ITEM_NAME} <> 'MATERIAL MARUNT (M.G.I.)'";

function showAllButMarunt() {
    CCCCONSUMATOR.FILTER = '(' + filterConsumator + ')';
    CCCCONSUMATOR.FILTERED = 1;
    CCCTABLOURI.FILTER = '(' + filterTablou + ')';
    CCCTABLOURI.FILTERED = 1;
    CCCARTGEN.FILTER = '(' + filterGeneric + ')';
    CCCARTGEN.FILTERED = 1;
    CCCCLADIRE.FILTER = "({CCCCLADIRE.DENUMIRE} <> 'MATERIAL MARUNT')";
    CCCCLADIRE.FILTERED = 1;
    CCCPRIMARYSPACE.FILTER = "({CCCPRIMARYSPACE.DENUMIRE} <> 'MATERIAL MARUNT')";
    CCCPRIMARYSPACE.FILTERED = 1;
    CCCSECONDARYSPACE.FILTER = "({CCCSECONDARYSPACE.DENUMIRE} <> 'MATERIAL MARUNT')";
    CCCSECONDARYSPACE.FILTERED = 1;
    CCCINCAPERE.FILTER = "({CCCINCAPERE.DENUMIRE} <> 'MATERIAL MARUNT')";
    CCCINCAPERE.FILTERED = 1;
}

function ON_CREATE() {
    X.SETPROPERTY('EDITOPTIONS', 'READONLY=True');
}