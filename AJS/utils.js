var dsFL, sursaCircuitList;

//at some point call like this:
/*
    if (cmd == '20220531') {
        //Fisa limita
        dsFL = get_dsFLQty(SALDOC.CCCFLMR);
        var ds = ITELINES;
        loopDataset(ds, 0, ITELINES.CCCQTYFL);
        ds = SRVLINES;
        loopDataset(ds, 1, SRVLINES.CCCQTYFL);
        dsFL = null;
        //devize
        dsFL = get_dsFLQty(getAllDevizeFromPrjc(SALDOC.PRJC));
        var ds = ITELINES;
        loopDataset(ds, 0, ITELINES.CCCQTY1DEVIZ);
        ds = SRVLINES;
        loopDataset(ds, 1, SRVLINES.CCCQTY1DEVIZ);
        dsFL = null;

        X.WARNING('Actualizare finalizata.');
    }
*/

function get_dsFLQty(FL) {
    var mtrlines = X.GETSQLDATASET('SELECT ML.SODTYPE, ML.MTRL, SUM(ML.QTY1) QTY1, ' +
        'ML.CCCSPECIALIZARE, ML.CCCCOLECTIE, ML.CCCCAPITOL, ML.CCCGRUPALUCRARI, ML.CCCACTIVITATE, ' +
        'ML.CCCCLADIRE, ML.CCCPRIMARYSPACE, ML.CCCSECONDARYSPACE, ML.CCCINCAPERE, ' +
        'ML.CCCTABLOURI, ML.CCCCIRCUIT, ML.CCCMTRLGEN, ' +
        '(SELECT CCCCONSUMATOR FROM CCCCONSUMATOR WHERE CCCMTRLGEN=ML.CCCMTRLGEN AND CCCHEADER=:SALDOC.CCCHEADER) CCCCONSUMATOR_C, ' +
        '(SELECT CCCCONSUMATOR FROM CCCTABLOURI WHERE CCCTABLOU=ML.CCCTABLOURI AND CCCHEADER=:SALDOC.CCCHEADER) CCCTABLOURI_S, ' +
        'ML.CCCSPECIALITATESF, ML.CCCSF, ML.CCCCOLECTIESF ' +
        ' FROM MTRLINES ML ' +
        'WHERE ML.FINDOC in (' + FL + ') and ml.mtrl in (select distinct mtrl from mtrlines where findoc=' + SALDOC.FINDOC + ')' +
        ' GROUP BY ML.SODTYPE, ML.MTRL, ' +
        'ML.CCCSPECIALIZARE, ML.CCCCOLECTIE, ML.CCCCAPITOL, ML.CCCGRUPALUCRARI, ML.CCCACTIVITATE, ' +
        'ML.CCCCLADIRE, ML.CCCPRIMARYSPACE, ML.CCCSECONDARYSPACE, ML.CCCINCAPERE, ' +
        'ML.CCCTABLOURI, ML.CCCCIRCUIT, ML.CCCMTRLGEN, ' +
        'ML.CCCSPECIALITATESF, ML.CCCSF, ML.CCCCOLECTIESF ', null);

    return mtrlines;

}

function actualizeazaCantitateDevize(prjc) {
    dsFL = get_dsFLQty(getAllDevizeFromPrjc(prjc));
    loopDataset(ITELINES, 0, ITELINES.CCCQTY1DEVIZ, 1);
    loopDataset(SRVLINES, 1, SRVLINES.CCCQTY1DEVIZ, 1);
    dsFL = null;
    //if caller function's name in not "ON_POST" then message is displayed
    if (arguments.callee.caller.toString().indexOf('ON_POST') == -1) {
        X.WARNING('Actualizare finalizata.');
    }
}

function actualizeazaCantitateFL(FL) {
    dsFL = get_dsFLQty(FL);
    loopDataset(ITELINES, 0, ITELINES.CCCQTYFL, 0);
    loopDataset(SRVLINES, 1, SRVLINES.CCCQTYFL, 0);
    dsFL = null;
    if (arguments.callee.caller.toString().indexOf('ON_POST') == -1) {
        X.WARNING('Actualizare finalizata.');
    }
}

function actualizeazaCantitateDevize_linie(prjc) {
    dsFL = get_dsFLQty(getAllDevizeFromPrjc(prjc));
    applyToLine(ITELINES, 0, ITELINES.CCCQTY1DEVIZ, 1);
    applyToLine(SRVLINES, 1, SRVLINES.CCCQTY1DEVIZ, 1);
    dsFL = null;
}

function actualizeazaCantitateFL_linie(FL) {
    dsFL = get_dsFLQty(FL);
    applyToLine(ITELINES, 0, ITELINES.CCCQTYFL, 0);
    applyToLine(SRVLINES, 1, SRVLINES.CCCQTYFL, 0);
    dsFL = null;
}

function getAllDevizeFromPrjc(prjc) {
    var devize = X.GETSQLDATASET('select findoc from findoc where sosource=1351 and series=4068 and iscancel=0 and prjc=' + prjc, null);
    var devize_str = '';
    devize.FIRST;
    while (!devize.Eof) {
        devize_str += devize.FINDOC + ',';
        devize.NEXT;
    }
    return devize_str.substring(0, devize_str.length - 1);
}

function applyToLine(ds, extra, aField, filedNr) {
    var attributes = {
        geografie: {
            cladire: ds.CCCCLADIRE,
            primaryspace: ds.CCCPRIMARYSPACE,
            secondaryspace: ds.CCCSECONDARYSPACE,
            incapere: ds.CCCINCAPERE,
        },
        conectica: {
            sursa: ds.CCCTABLOURI,
            circuit: ds.CCCCIRCUIT,
            consumator: ds.CCCMTRLGEN,
        },
        sf: {
            specialitate: ds.CCCSPECIALITATESF,
            sf: ds.CCCSF,
            colectie: ds.CCCCOLECTIESF,
        }
    };

    if (extra) {
        attributes.activitate = {
            specializare: ds.CCCSPECIALIZARE,
            colectie: ds.CCCCOLECTIE,
            capitol: ds.CCCCAPITOL,
            grupalucrari: ds.CCCGRUPALUCRARI,
            activitate: ds.CCCACTIVITATE
        };
    }

    //clean the probable mess anterior to solving a bug, otherwise results in a crash
    //doesn't have to do with this script, but it's a good practice
    if (SALDOC.WHOUSE)
        ds.WHOUSE = SALDOC.WHOUSE;

    var qtyFL = getFLQtyFor(ds.MTRL, attributes, dsFL);
    if (qtyFL && aField != qtyFL) {
        switch (filedNr) {
            case 0:
                ds.CCCQTYFL = qtyFL;
                break;
            case 1:
                ds.CCCQTY1DEVIZ = qtyFL;
                break;
        }
    }
}

//ds = ITELINES/SRVLINES
//loop thru each line in ds and set field "aField" to the qty in the dsFl
//"extra" is for activitati, care sunt reprezentate prin cinci campuri pe acelasi mtrl (?!?!?)
function loopDataset(ds, extra, aField, filedNr) {
    ds.FIRST;
    while (!ds.EOF) {
        applyToLine(ds, extra, aField, filedNr);
        X.PROCESSMESSAGES();
        ds.NEXT;
    }
}

function getFLQtyFor(mtrl, attributes, dsFL) {
    //inspect attributes object
    var locateStr = '';
    if (attributes) {
        if (attributes.activitate) {
            if (attributes.activitate.specializare) {
                if (locateStr)
                    locateStr += '{CCCSPECIALIZARE}=' + attributes.activitate.specializare;
                else
                    locateStr += '{CCCSPECIALIZARE}=' + attributes.activitate.specializare;
            }
            if (attributes.activitate.colectie) {
                if (locateStr)
                    locateStr += ' AND {CCCCOLECTIE}=' + attributes.activitate.colectie;
                else
                    locateStr += '{CCCCOLECTIE}=' + attributes.activitate.colectie;
            }
            if (attributes.activitate.capitol) {
                if (locateStr)
                    locateStr += ' AND {CCCCAPITOL}=' + attributes.activitate.capitol;
                else
                    locateStr += '{CCCCAPITOL}=' + attributes.activitate.capitol;
            }
            if (attributes.activitate.grupalucrari) {
                if (locateStr)
                    locateStr += ' AND {CCCGRUPALUCRARI}=' + attributes.activitate.grupalucrari;
                else
                    locateStr += '{CCCGRUPALUCRARI}=' + attributes.activitate.grupalucrari;
            }
            if (attributes.activitate.activitate) {
                if (locateStr)
                    locateStr += ' AND {CCCACTIVITATE}=' + attributes.activitate.activitate;
                else
                    locateStr += '{CCCACTIVITATE}=' + attributes.activitate.activitate;
            }
        }
        if (attributes.geografie) {
            if (attributes.geografie.cladire) {
                if (locateStr)
                    locateStr += ' AND {CCCCLADIRE}=' + attributes.geografie.cladire;
                else
                    locateStr += '{CCCCLADIRE}=' + attributes.geografie.cladire;
            }
            if (attributes.geografie.primaryspace) {
                if (locateStr)
                    locateStr += ' AND {CCCPRIMARYSPACE}=' + attributes.geografie.primaryspace;
                else
                    locateStr += '{CCCPRIMARYSPACE}=' + attributes.geografie.primaryspace;
            }
            if (attributes.geografie.secondaryspace) {
                if (locateStr)
                    locateStr += ' AND {CCCSECONDARYSPACE}=' + attributes.geografie.secondaryspace;
                else
                    locateStr += '{CCCSECONDARYSPACE}=' + attributes.geografie.secondaryspace;
            }

            if (attributes.geografie.incapere) {
                if (locateStr)
                    locateStr += ' AND {CCCINCAPERE}=' + attributes.geografie.incapere;
                else
                    locateStr += '{CCCINCAPERE}=' + attributes.geografie.incapere;
            }
        }

        if (attributes.conectica) {
            if (attributes.conectica.sursa) {
                if (locateStr)
                    locateStr += ' AND {CCCTABLOURI}=' + attributes.conectica.sursa;
                else
                    locateStr += '{CCCTABLOURI}=' + attributes.conectica.sursa;
            }
            if (attributes.conectica.circuit) {
                if (locateStr)
                    locateStr += ' AND {CCCCIRCUIT}=' + attributes.conectica.circuit;
                else
                    locateStr += '{CCCCIRCUIT}=' + attributes.conectica.circuit;
            }
            if (attributes.conectica.consumator) {
                if (locateStr)
                    locateStr += ' AND {CCCMTRLGEN}=' + attributes.conectica.consumator;
                else
                    locateStr += '{CCCMTRLGEN}=' + attributes.conectica.consumator;
            }
        }
        if (attributes.sf) {
            if (attributes.sf.specialitate) {
                if (locateStr)
                    locateStr += ' AND {CCCSPECIALITATESF}=' + attributes.sf.specialitate;
                else
                    locateStr += '{CCCSPECIALITATESF}=' + attributes.sf.specialitate;
            }
            if (attributes.sf.sf) {
                if (locateStr)
                    locateStr += ' AND {CCCSF}=' + attributes.sf.sf;
                else
                    locateStr += '{CCCSF}=' + attributes.sf.sf;
            }
            if (attributes.sf.colectie) {
                if (locateStr)
                    locateStr += ' AND {CCCCOLECTIESF}=' + attributes.sf.colectie;
                else
                    locateStr += '{CCCCOLECTIESF}=' + attributes.sf.colectie;
            }
        }

    }

    var qtys = [];
    dsFL.FILTERED = 0;
    dsFL.FILTER = locateStr.length ? '({MTRL}=' + mtrl + ' AND ' + locateStr + ')' : '({MTRL}=' + mtrl + ')';
    dsFL.FILTERED = 1;
    dsFL.FIRST;
    while (!dsFL.eof) {
        qtys.push(dsFL.QTY1);
        dsFL.NEXT;
    }

    if (qtys.length > 1) {
        X.WARNING('Too many records for ' + mtrl);
    }

    return qtys[0];
}

//call it ON_CREATE, for example: setFldEdOnConsumator('ITELINES.CCCMTRLGEN', ':SALDOC.CCCHEADER', ':ITELINES.CCCTABLOURI', ':ITELINES.CCCCIRCUIT');
function setEditorsOnElectricalFields(schEl, fldSursa, fldCircuit, fldConsumator, sursa, circuit) {
    var editor = 'CCCTABLOURI(W[A.CCCHEADER=' + schEl + '])';
    X.SETFIELDEDITOR(fldSursa, editor);

    editor = 'CCCCIRCUIT(W[CCCHEADER=' + schEl + ' AND CCCTABLOU=' + sursa + '])';
    X.SETFIELDEDITOR(fldCircuit, editor);
    editor = 'CCCCONSUMATORITEMV(W[A.CCCHEADER=' + schEl + ' ' +
        'AND A.CCCMTRLGEN IN (SELECT CC.CCCMTRLGEN FROM ' +
        'CCCCONSUMATOR CC INNER JOIN CCCLINIICIRCUIT AA ON (CC.CCCCONSUMATOR=AA.CCCCONSUMATOR) ' +
        'INNER JOIN CCCCIRCUIT BB ON (AA.CCCCIRCUIT=BB.CCCCIRCUIT) ' +
        'WHERE AA.CCCHEADER=' + schEl + ' ' +
        'AND BB.CCCTABLOU=' + sursa + ' ' +
        'AND AA.CCCCIRCUIT=' + circuit + ')])';
    X.SETFIELDEDITOR(fldConsumator, editor);
}

function setEditorOnActivitateFields(prjc, fldSpecializare, fldColectie, fldCapitol, fldGrupaLucrari, fldActivitate, specializare, colectie, capitol, grupalucrari) {
    var editor = 'CCCSPECIALIZARE';
    X.SETFIELDEDITOR(fldSpecializare, editor);
    editor = 'CCCCOLECTIE(W[CCCSPECIALIZARE=' + specializare + ' AND CCCCOLECTIE IN (SELECT DISTINCT CCCCOLECTIE FROM CCCACTIVITATEPRJC WHERE PRJC = ' + prjc + ')])';
    X.SETFIELDEDITOR(fldColectie, editor);
    editor = 'CCCCAPITOL(W[CCCCOLECTIE=' + colectie + ' AND CCCCAPITOL IN (SELECT DISTINCT CCCCAPITOL FROM CCCACTIVITATEPRJC WHERE PRJC = ' + prjc + ')])';
    X.SETFIELDEDITOR(fldCapitol, editor);
    editor = 'CCCGRUPALUCRARI(W[CCCCAPITOL = ' + capitol + ' AND CCCGRUPALUCRARI IN (SELECT DISTINCT CCCGRUPALUCRARI FROM CCCACTIVITATEPRJC WHERE PRJC = ' + prjc + ')])';
    X.SETFIELDEDITOR(fldGrupaLucrari, editor);
    editor = 'CCCACTIVITATE(W[CCCGRUPALUCRARI = ' + grupalucrari + ' AND CCCACTIVITATE IN (SELECT DISTINCT CCCACTIVITATE FROM CCCACTIVITATEPRJC WHERE PRJC = ' + prjc + ')])';
    X.SETFIELDEDITOR(fldActivitate, editor);
}

function setEditorOnFunctionalFields(fldSpecialitateSF, fldSF, fldColectieSF, specialitateSF, SF) {
    var editor = 'CCCSPECIALITATESF';
    X.SETFIELDEDITOR(fldSpecialitateSF, editor);
    editor = 'CCCSF(W[A.CCCSPECIALITATESF=' + specialitateSF + '])';
    X.SETFIELDEDITOR(fldSF, editor);
    editor = 'CCCCOLECTIESF(W[A.CCCSF=' + SF + '])';
    X.SETFIELDEDITOR(fldColectieSF, editor);
}

function setEditorOnGeographicalFields(schEl, fldCladire, fldPrimaryspace, fldSecondarySpace, fldIncapere, cladire, primaryspace, secondaryspace) {
    var editor = 'CCCCLADIRE(W[A.CCCHEADER=' + schEl + '])';
    X.SETFIELDEDITOR(fldCladire, editor);
    editor = 'CCCPRIMARYSPACE(W[A.CCCHEADER=' + schEl + ' AND CCCCLADIRE=' + cladire + '])';
    X.SETFIELDEDITOR(fldPrimaryspace, editor);
    editor = 'CCCSECONDARYSPACE(W[A.CCCHEADER=' + schEl + ' AND CCCPRIMARYSPACE=' + primaryspace + '])';
    X.SETFIELDEDITOR(fldSecondarySpace, editor);
    editor = 'CCCINCAPERE(W[A.CCCHEADER=' + schEl + ' AND CCCSECONDARYSPACE=' + secondaryspace + '])';
    X.SETFIELDEDITOR(fldIncapere, editor);
}

//var enumLinii = getSelectedFromGrid('dsConsumatori', 'CCCLINIICIRCUIT');
function getSelectedFromGrid(gridName, returnedField) {
    var gridSelected = X.GETPROPERTY('GRIDSELECTED:' + gridName + '|' + returnedField),
        arrGridSelected = gridSelected.replace(/\r\n/g, ",");
    return arrGridSelected.substring(0, arrGridSelected.length - 1);
}

//[{sursa: 1332, circuit: 132254}]
function circuitsExistsInFl(schEl, fl, sursaCircuitArrOfObj, refreshList) {
    if (refreshList)
        sursaCircuitList = getSursaCircuitList(fl);
    var ret = [];

    if (sursaCircuitList.RECORDCOUNT) {
        for (var i = 0; i < sursaCircuitArrOfObj.length; i++) {
            ret.push(sursaCircuitArrOfObj[i]);
            ret[ret.length - 1].schema = schEl;
            if (sursaCircuitList.LOCATE('CCCTABLOURI;CCCCIRCUIT', sursaCircuitArrOfObj[i].sursa, sursaCircuitArrOfObj[i].circuit)) {
                ret[ret.length - 1].exists = true;
            } else {
                ret[ret.length - 1].exists = false;
            }
            ret[ret.length - 1].deviz = sursaCircuitList.deviz;
        }
    }

    function getSursaCircuitList(fl) {
        var q = 'select distinct a.ccctablouri, a.ccccircuit, c.deviz from mtrlines a ' +
            'inner join findoc b on (a.findoc=b.findoc) ' +
            'left join ccccircuit c on (c.ccccircuit=a.ccccircuit) ' +
            'where b.findoc=' + fl;

        return X.GETSQLDATASET(q, null);
    }

    return ret;
}

//CCCCIRCUIT.DEVIZ = creazaDocVariatii(SALDOC, 4068, 'SALDOC[Form=Deviz electric]', CCCHEADER.PRJC, CCCHEADER.CCCHEADER, CCCHEADER.FLEL, CCCTABLOURI.CCCTABLOU, CCCCIRCUIT.CCCCIRCUIT, CCCLINIICIRCUIT);
//newFindoc = creazaDocVariatii(SALDOC, 4077, 'SALDOC[Form=AFL electric]', SALDOC.PRJC, SALDOC.CCCHEADER, SALDOC.CCCFLMR, sursa, circuit, ITELINES, SRVLINES);
function creazaDocVariatii(obj, series, strObj, prjc, schEl, fl, sursa, circuit, liniiIteCircuit, liniiSrvCircuit, status) {
    if (!sursa && !circuit) {
        return;
    }
    //verifica daca ai linii in liniiIteCircuit si liniiSrvCircuit
    //RECORDCOUNT pe filtered returneaza total nefiltrat
    //decat sa loop prin ele, verific daca exista ceva pe prima linie din fiecare => recordcount > 0
    liniiIteCircuit.FIRST;
    liniiSrvCircuit.FIRST;
    if (!liniiIteCircuit.MTRL)
        if (!liniiSrvCircuit.MTRL)
            return;

    var d = X.CreateObjForm(strObj);
    try {
        d.DbInsert;
        var h = d.FindTable('FINDOC');
        h.Edit;
        h.SERIES = series;
        h.PRJC = prjc;
        h.CCCHEADER = schEl;
        if (fl)
            h.CCCFLMR = fl;
        if (status)
            h.CCCSTATUS = status;
        if (sursa) {
            h.CCCTABLOURI = sursa;
        }
        if (circuit) {
            h.INT01 = circuit;
        }

        if (obj.CCCRESP)
            h.CCCRESP = obj.CCCRESP;
        if (obj.CCCPERSCONST)
            h.CCCPERSCONST = obj.CCCPERSCONST;
        if (obj.CCCMAGAZIONER)
            h.CCCMAGAZIONER = obj.CCCMAGAZIONER;
        if (obj.COMMENTS)
            h.COMMENTS = obj.COMMENTS;

        h.CCCSERVICIU = 1; //no popup

        var l = d.FindTable('ITELINES'),
            srv = d.FindTable('SRVLINES'),
            i = 0,
            j = 0,
            id = 0;
        if (liniiIteCircuit.RECORDCOUNT) {
            i = loadLines(l, liniiIteCircuit, false);
        }
        if (liniiSrvCircuit.RECORDCOUNT) {
            j = loadLines(srv, liniiSrvCircuit, true);
        }

        if (i || j) {
            id = d.SHOWOBJFORM();
            if (id > 0) {
                dispose(d);
                //marcare in ds proveninenta ca fiind linie convertita (pentru generari secventiale), in variatii FL; in schema electrica nu are sens
                var doc = X.SQL('select fincode from findoc where findoc=' + id, null);
                if (i) markSource(liniiIteCircuit, 1, id, doc);
                if (j) markSource(liniiSrvCircuit, 1, id, doc);
                return id;
            } else {
                dispose(d);
                debugger;
                X.WARNING('Ati optat sa nu salvati documentul propus.');
                //demarcare in ds proveninenta ca fiind linie convertita (pentru generari secventiale), in variatii FL; in schema electrica nu are sens
                if (i) markSource(liniiIteCircuit, 0, null, '');
                if (j) markSource(liniiSrvCircuit, 0, null, '');
                return 0;
            }
        } else {
            dispose(d);
            return 0;
        }
    } catch (err) {
        if (err.message.indexOf('Selector record not found') > -1) {
            X.EXCEPTION('Verificati daca activitatea (specializare, colectie, etc) este adaugata in proiect.\n' + err.message);
        } else {
            X.EXCEPTION(err.message);
        }
    } finally {
        dispose(d);
    }

    function loadLines(dest, src, isSrv) {
        src.FIRST;
        while (!src.EOF) {
            dest.APPEND;
            dest.MTRL = src.MTRL;
            dest.CCCMTRLGEN = src.CCCMTRLGEN;
            if (isSrv) {
                if (src.CCCSPECIALIZARE) {
                    dest.CCCSPECIALIZARE = src.CCCSPECIALIZARE;
                } else {
                    X.WARNING('Nu exista specializare pentru ' + X.SQL('select activitate from cccactivitate where cccactivitate=' + src.CCCACTIVITATE, null));
                    return;
                }
                if (src.CCCCOLECTIE) {
                    dest.CCCCOLECTIE = src.CCCCOLECTIE;
                }
                if (src.CCCCAPITOL) {
                    dest.CCCCAPITOL = src.CCCCAPITOL;
                }
                if (src.CCCGRUPALUCRARI) {
                    dest.CCCGRUPALUCRARI = src.CCCGRUPALUCRARI;
                }
                if (src.CCCACTIVITATE) {
                    dest.CCCACTIVITATE = src.CCCACTIVITATE;
                }
            }
            commonLines();
            dest.POST;
            src.NEXT;
        }

        function commonLines() {
            if (src.QTY1)
                dest.QTY1 = src.QTY1;
            else
                dest.QTY1 = 1;
            if (src.CCCSPECIALITATESF)
                dest.CCCSPECIALITATESF = src.CCCSPECIALITATESF;
            if (src.CCCSF)
                dest.CCCSF = src.CCCSF;
            if (src.CCCCOLECTIESF)
                dest.CCCCOLECTIESF = src.CCCCOLECTIESF;
            if (src.CCCCOLECTIESF)
                dest.CCCCOLECTIESF = src.CCCCOLECTIESF;
            if (sursa)
                dest.CCCTABLOURI = sursa;
            if (circuit)
                dest.CCCCIRCUIT = circuit;
            if (src.CCCCLADIRE)
                dest.CCCCLADIRE = src.CCCCLADIRE;
            if (src.CCCPRIMARYSPACE)
                dest.CCCPRIMARYSPACE = src.CCCPRIMARYSPACE;
            if (src.CCCSECONDARYSPACE)
                dest.CCCSECONDARYSPACE = src.CCCSECONDARYSPACE;
            if (dest.CCCINCAPERE)
                dest.CCCINCAPERE = src.CCCINCAPERE;
            if (src.MTRLINES)
                dest.MTRLINESS = src.MTRLINES;
            if (src.FINDOC)
                dest.FINDOCS = src.FINDOC;
            //marcare in ds destinatie ca fiind linie rezultata din acest proces de conversie (creare doc variatii)
            dest.CCCQTYNR = 1;
        }

        return dest.RECORDCOUNT;
    }

    function markSource(ds, mark, id, doc) {
        if (ds.RECORDCOUNT) {
            ds.FIRST;
            if (ds.CCCQTYNR !== 'undefined' && ds.CCCBULLSHIT1 !== 'undefined' && ds.CCCINT01 !== 'undefined') {
                while (!ds.EOF) {
                    ds.CCCQTYNR = mark;
                    ds.CCCINT01 = id;
                    ds.CCCBULLSHIT1 = doc;
                    ds.NEXT;
                }
            }
        }
    }
}

function dispose(obj) {
    obj.FREE;
    obj = null;
}

function getDetailsForGeneric(schEl, sursa, circuit, mtrlGen) {
    var q = 'SELECT CC.CCCMTRLGEN, BB.* FROM CCCLINIICIRCUIT BB ' +
        'INNER JOIN CCCCIRCUIT AA ON (AA.CCCCIRCUIT=BB.CCCCIRCUIT) ' +
        'INNER JOIN CCCCONSUMATOR CC ON (BB.CCCCONSUMATOR=CC.CCCCONSUMATOR) ' +
        'WHERE AA.CCCHEADER=' + schEl + ' AND AA.CCCTABLOU=' + sursa + ' AND AA.CCCCIRCUIT=' + circuit + ' AND CC.CCCMTRLGEN=' + mtrlGen;

    return X.GETSQLDATASET(q, null);
}

//test git