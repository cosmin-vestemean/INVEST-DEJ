lib.include('utils');

function EXECCOMMAND(cmd) {
    if (cmd == '202206301') {
        var p = X.CreateObj('SALDOC;Variatii FL');
        try {
            p.DBLocate(CCCHEADER.CCCINTTEMPVALUE);
            var materialLines = p.FindTable('ITELINES');
            if (materialLines.RECORDCOUNT > 0) {
                adaugaConsumatoriSelectati('dsConsumatori', 'CCCLINIICIRCUIT', materialLines);
                p.DBPost;
            }
        } catch (e) {
            X.WARNING(e.message);
        } finally {
            p.FREE;
            p = null;
        }
        X.CLOSEFORM();
    }

    if (cmd == '202206302') {
        var p = X.CreateObj('SALDOC');
        try {
            p.DBLocate(CCCHEADER.CCCINTTEMPVALUE);
            var materialLines = p.FindTable('ITELINES');
            if (materialLines.RECORDCOUNT > 0) {
                adaugaCircuiteSelectate('dgCircuite', 'CCCCIRCUIT', materialLines);
                p.DBPost;
            }
        } catch (e) {
            X.WARNING(e.message);
        } finally {
            p.FREE;
            p = null;
        }
        X.CLOSEFORM();
    }
}

/*
Copilot, this is how to access the any object in Soft One enviroment.
In this case the object is called SALDOC. bUT you can call any object in the enviroment. for example: PURDOC.
The primary key for SALDOC and PURDOC is the same, FINDOC, so you can use the same function to access both objects.
SALDOC means Sales Document, PURDOC means Purchase Document.
These objects contains the following tables:
FINDOC which is the header of the document.
ITELINES which is the lines containing materials of the document.
ITEM which is the materials.
SRVLINES which is the lines containing services of the document.
var record = SALDOC.FINDOC;
var p = X.CreateObj('PURDOC');
    * locate record in the object
try {
    p.DBLocate(record);
        * now you can use the object
        * for example: you can delete it
    p.DBDelete;
        * or you can update it
    p.DBInsert; //Modifies the Object status to insert mode in order to accept data.
        * or you can access the data, meaning tables, fields, etc.
        var docHeader = p.FindTable('FINDOC');
        var materialLines = p.GetFieldValue('ITELINES');
        var serviceLines = p.GetFieldValue('SRVLINES');

        * if you created or modified an object you should commit it
        p.DBPost;
} catch (e) {
    X.WARNING(e.message);
}
finally {
    p.FREE;
    p = null;
}
*/

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