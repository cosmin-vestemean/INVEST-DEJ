lib.include('utils');

var vedeta = {}, whichTab = 0;

function ON_POST() {
    //interdictie de stare anulat daca documentul a fost deja convertit
    sSQL = 'select count(findoc) f from mtrlines where findocs=' + SALDOC.FINDOC;
    RD = X.GETSQLDATASET(sSQL, '');

    if ((RD.contor != 0) && (SALDOC.CCCSTATUS == 63) && (SALDOC.SERIES == 4041)) {
        X.EXCEPTION('Documentul a fost convertit. Stare invalida!');
    }

    //interdicite de salavare daca am status 60 si nu am completat responsabil si constatat de
    if (SALDOC.CCCSTATUS == 60) {
        if ((SALDOC.CCCRESP_PRSNIN_NAME2 == null) || (SALDOC.CCCRESP_PRSNIN_NAME2 == '')) {
            X.EXCEPTION('Introduceti date in campul Responsabil de zona!');
        }

        if ((SALDOC.CCCPERSCONST_PRSNIN_NAME2 == null) || (SALDOC.CCCPERSCONST_PRSNIN_NAME2 == '')) {
            X.EXCEPTION('Introduceti date in campul Constatare efectuata de!');
        }
    }

    ITELINES.FIRST;
    while (!ITELINES.Eof) {

        sSQL = 'select ACNMSK from MTRL where MTRL = ' + ITELINES.MTRL;
        sAcnmsk = X.GETSQLDATASET(sSQL, '');

        if (((SALDOC.SERIES == 4101) || (SALDOC.SERIES == 4201)) && ((sAcnmsk.ACNMSK == '371') || (sAcnmsk.ACNMSK == '345') || (sAcnmsk.ACNMSK == '346'))) {
            X.EXCEPTION('Articol ' + ITELINES.MTRL_ITEM_NAME + ' nu poate fi vandut cu seria 4101(4201), trebuie sa folositi documentul 4102(4205)!');
        }

        if (((SALDOC.SERIES == 4102) || (SALDOC.SERIES == 4205)) && !((sAcnmsk.ACNMSK == '371') || (sAcnmsk.ACNMSK == '345') || (sAcnmsk.ACNMSK == '346'))) {
            X.EXCEPTION('Articol ' + ITELINES.MTRL_ITEM_NAME + ' nu poate fi vandut cu seria 4102(4205), trebuie sa folositi documentul 4101(4201)!');
        }
        ITELINES.NEXT;
    }

    //alerta gestiune
    if ((SALDOC.SERIES == 4053) && (MTRDOC.WHOUSE == 9)) {
        X.WARNING('Aveti in vedere creare de gestiune! Adaugati gestiunea lucrarii pe proiect!');
    }

    //actualizare status in cazul in care am completat responsabil de zona si constatare efectuata de
    if ((SALDOC.SERIES == 4041) && (SALDOC.CCCPERSCONST != null) && (SALDOC.CCCRESP != null)) {
        //	SALDOC.CCCSTATUS=61;
    }
    //actualizare stare proiect
    if ((SALDOC.SERIES == 4057) && (SALDOC.FINDOC < 0)) {
        sSQL = 'update prjc set PRJSTATE=5 where prjc=' + SALDOC.PRJC;
        X.RUNSQL(sSQL, '');
    }

    //Alerta pentru modificare status
    if (SALDOC.FINDOC > 0) {
        X.WARNING('Aveti in vedere schimbarea statusului.');
    }

    //actualizare findocs cu oferta negociata din header
    if ((SALDOC.CCCOFERTADEVIZ)) {
        ITELINES.FIRST;
        while (!ITELINES.EOF()) {
            ITELINES.FINDOCS = SALDOC.CCCOFERTADEVIZ;
            ITELINES.NEXT;
        }
    } else {
        X.WARNING('Atentie! Lipsa oferta negociata pe proiectul selectat!');
        ITELINES.FIRST;
        while (!ITELINES.EOF()) {
            ITELINES.FINDOCS = null;
            ITELINES.NEXT;
        }

    }
    //actualizare findocs cu oferta negociata din header - end

    //creaza articole generice (cod proiect)
    ITELINES.FIRST;
    var afterMsg = '';
    while (!ITELINES.EOF) {
        if (ITELINES.COMMENTS2 && SALDOC.CCCHEADER /* && ITELINES.MTRL == 13499*/) {
            //debugger;
            var existingMTRL = X.SQL("select isnull(mtrl, 0) from mtrl where cccheader = " + SALDOC.CCCHEADER + " and name='" + ITELINES.COMMENTS2.trim()  + " (M.G.I.)'", null);
            var q = ITELINES.QTY1;
            if (!existingMTRL) {
                var mtrl = creazaArtGen(ITELINES.COMMENTS2);
                ITELINES.MTRL = mtrl;
                afterMsg += 'ITELINES.COMMENTS2\n';

            } else {
                //inlocuieste-l cu cel din baza de date, existent
				//ITELINES.MTRL = existingMTRL;	
				X.EXCEPTION(ITELINES.COMMENTS2.trim() + ': Un articol cu aceasta denumire deja exista.\nVa rog sa il folositi.');
            }
            ITELINES.QTY1 = q;
            ITELINES.COMMENTS = ITELINES.COMMENTS2;
            ITELINES.COMMENTS2 = '';
        }
        ITELINES.NEXT;
    }

    if (afterMsg) {
        X.WARNING('Au fost create urmatoarele coduri proiect:\n' + afterMsg + 'Le gasiti in schema electrica, pagina COD PROIECT - STOCABILE.');
    }

    try {
        var dev = SALDOC.FINDOC ? SALDOC.FINDOC : X.NEWID;
        X.RUNSQL('update ccccircuit set deviz=' + dev + ' where cccheader=' + SALDOC.CCCHEADER + ' and ccccircuit=' + SALDOC.INT01, null);
    } catch (e) {
        X.WARNING(e.message);
    }

    SALDOC.BOOL01 = false;
    SALDOC.BOOL02 = false;
}

// VAT type conversion second part
// Copy VAT of the item lines from the origin document
function copyMTRLINESVAT() {
    ITELINES.DISABLECONTROLS;
    ITELINES.FIRST;
    while (!ITELINES.EOF()) {
        sSQL = 'SELECT VAT FROM MTRLINES WHERE FINDOC = ' + ITELINES.FINDOCS + ' AND MTRLINES = ' + ITELINES.MTRLINESS;
        RD = X.GETSQLDATASET(sSQL, '');
        if (RD.RECORDCOUNT() > 0) {
            RD.FIRST;
            ITELINES.EDIT;
            ITELINES.VAT = RD.VAT;
            ITELINES.POST;
        }
        ITELINES.NEXT;
    }
    ITELINES.ENABLECONTROLS;

    SRVLINES.DISABLECONTROLS;
    SRVLINES.FIRST;
    while (!SRVLINES.EOF()) {
        sSQL = 'SELECT VAT FROM MTRLINES WHERE FINDOC = ' + SRVLINES.FINDOCS + ' AND MTRLINES = ' + SRVLINES.MTRLINESS;
        RD = X.GETSQLDATASET(sSQL, '');
        if (RD.RECORDCOUNT() > 0) {
            RD.FIRST;
            SRVLINES.EDIT;
            SRVLINES.VAT = RD.VAT;
            SRVLINES.POST;
        }
        SRVLINES.NEXT;
    }
    SRVLINES.ENABLECONTROLS;

    ASSLINES.DISABLECONTROLS;
    ASSLINES.FIRST;
    while (!ASSLINES.EOF()) {
        sSQL = 'SELECT VAT FROM MTRLINES WHERE FINDOC = ' + ASSLINES.FINDOCS + ' AND MTRLINES = ' + ASSLINES.MTRLINESS;
        RD = X.GETSQLDATASET(sSQL, '');
        if (RD.RECORDCOUNT() > 0) {
            RD.FIRST;
            ASSLINES.EDIT;
            ASSLINES.VAT = RD.VAT;
            ASSLINES.POST;
        }
        ASSLINES.NEXT;
    }
    ASSLINES.ENABLECONTROLS;
}

// End VAT type conversion second part

function ON_SALDOC_PRJC() {
    sSQL = 'select TRDBRANCH from prjc where prjc=' + SALDOC.PRJC;
    RD = X.GETSQLDATASET(sSQL, '');

    SALDOC.TRDBRANCH = RD.TRDBRANCH;

    sSQL = 'select varchar02,varchar03,varchar04 from prjextra where prjc=' + SALDOC.PRJC;
    RCCC = X.GETSQLDATASET(sSQL, '');

    SALDOC.CCCNRCME = RCCC.varchar03;
    SALDOC.CCCNRCTR = RCCC.varchar04;
    SALDOC.CCCNRCOM = RCCC.varchar02;

    //Aduc oferta client negociata aferenta lucrarii CM
    if (SALDOC.SERIES == 4057) {
        //completare Oferta beneficiar negociata
        sSQLOCN = 'select count(findoc) contor from findoc where series = 4043 and prjc=' + SALDOC.PRJC;
        dsOCN = X.GETSQLDATASET(sSQLOCN, null);

        if (dsOCN.contor > 0) {
            sSQLOC = 'select findoc from findoc where series = 4043 and prjc=' + SALDOC.PRJC;
            dsOC = X.GETSQLDATASET(sSQLOC, null);
            if (dsOC.findoc != 0) {
                SALDOC.CCCOFERTADEVIZ = dsOC.findoc;
            }

        } else {
            X.WARNING('Atentie! Lipsa oferta negociata pe proiectul selectat!')
            SALDOC.CCCOFERTADEVIZ = null;
        }

    }

    var FIN = X.SQL('select findoc from findoc where sosource = 1351 and fprms=4067 and series=4067 and iscancel=0 and prjc=' + SALDOC.PRJC, null);
    if (FIN) {
        SALDOC.CCCFLMR = FIN;
    }
}

function ON_SALDOC_CCCSTATUS() {
    sSQL = 'select count(findoc) contor from mtrlines where findocs=' + SALDOC.FINDOC;
    RD = X.GETSQLDATASET(sSQL, '');

    if ((RD.contor != 0) && (SALDOC.CCCSTATUS == 63) && (SALDOC.SERIES == 4041)) {
        X.WARNING('Documentul a fost convertit. Stare invalida!');
    }
}

function ON_SALDOC_SERIES() {
    if (SALDOC.SERIES == 4041) {
        SALDOC.CCCSTATUS = 60;
    }

    if (SALDOC.SERIES == 4057) {
        SALDOC.CCCSTATUS = 74;
    }

}

function ON_DELETE() {
    unlinkDev();
}

function ON_SALDOC_ISCANCEL() {
    if (SALDOC.ISCANCEL)
        unlinkDev();
}

function unlinkDev() {
    var o = X.CreateObj('CCCSCHELGEO');
    try {
        o.DBLocate(SALDOC.CCCHEADER);
        var l = o.FindTable('CCCCIRCUIT');
        l.Edit;
        if (l.LOCATE('DEVIZ', SALDOC.FINDOC) == 1) {
            l.DEVIZ = null;
        }

        o.DBPost;
    } catch (e) {
        X.WARNING(e.message);
    }
    finally {
        o.FREE;
        o = null;
    }
}

//pun automat serviciul generic in fctie de categorie serviciu
function ON_SRVLINES_MTRCATEGORY() { //daca avem categorie de serv operatii lucrare pune serviciu predefinit
    if (SRVLINES.MTRCATEGORY == 3) {
        SRVLINES.MTRL = 13498;
    }
    //daca avem categorie de serv utilaje pune serviciu predefinit
    if (SRVLINES.MTRCATEGORY == 1) {
        SRVLINES.MTRL = 13504;
    }
    //daca avem categorie de serv forta de munca pune serviciu predefinit
    if (SRVLINES.MTRCATEGORY == 2) {
        SRVLINES.MTRL = 13505;
    }
    //daca avem categorie de serv deplasare pune serviciu predefinit
    if (SRVLINES.MTRCATEGORY == 4) {
        SRVLINES.MTRL = 13506;
    }
}
//--------------start actualizare qty1-------
function ON_ITELINES_MTRL_VALIDATE() {
    if (ITELINES.QTY1)
        ITELINES.CCCQTY1DEVIZ = ITELINES.QTY1;

}

function ON_ITELINES_MTRL() {
    if (ITELINES.CCCQTY1DEVIZ)
        ITELINES.QTY1 = ITELINES.CCCQTY1DEVIZ;
}

//--------------end actualizare qty1-------

//La selectie depart pun null pe responsabil zona
function ON_SALDOC_CCCDEP() {
    SALDOC.CCCRESPON = null;
}

//-----------Import Deviz------------\\

var vCheck;
vCheck = 0;

function ON_SALDOC_CCCDFILENAME() {
    CCCDEVART.FIRST;
    while (!CCCDEVART.Eof) {
        CCCDEVART.DELETE;
    }

    CCCDEVCH.FIRST;
    while (!CCCDEVCH.Eof) {
        CCCDEVCH.DELETE;
    }

    vCheck = 1;
    var Excel = new ActiveXObject("Excel.Application");
    var ExcelApp = Excel.Workbooks.Open(SALDOC.CCCDFILENAME);
    var ExcelSheet = ExcelApp.Worksheets(SALDOC.CCCDSHEET);
    var iRows = Excel.ActiveSheet.UsedRange.Rows.Count;
    var jCol = Excel.ActiveSheet.UsedRange.Columns.Count;

    vLeg = '';
    vNotFound = 0;
    i = 2;
    while (i <= iRows) {
        vNr = ExcelSheet.Cells(i, 1).Value;
        vPozitie = ExcelSheet.Cells(i, 2).Value;
        vTip = ExcelSheet.Cells(i, 3).Value;
        vSimbol = ExcelSheet.Cells(i, 4).Value;
        vDenumire = ExcelSheet.Cells(i, 5).Value;
        vUM = ExcelSheet.Cells(i, 6).Value;
        vConsum = ExcelSheet.Cells(i, 7).Value;
        vCantitate = ExcelSheet.Cells(i, 8).Value;
        vMaterial = ExcelSheet.Cells(i, 9).Value;
        vManopera = ExcelSheet.Cells(i, 10).Value;
        vUtilaj = ExcelSheet.Cells(i, 11).Value;
        vTransport = ExcelSheet.Cells(i, 12).Value;
        vPU = ExcelSheet.Cells(i, 13).Value;
        vPT = ExcelSheet.Cells(i, 14).Value;

        if (vTip == 'Art') {
            vLeg = vSimbol;
        }
        if (vTip == 'Total') {
            vLeg = vPozitie;
        }
        if ((vTip == 'Art') || (vTip == 'Lst.Ret') || (vTip == 'Mat.Ret') || (vTip == 'Mat.Lst') || (vTip == 'Uti.Ret') || (vTip == 'Tra.Ret') || (vTip == 'Man.Ret')) {
            CCCDEVART.APPEND;
            CCCDEVART.NR = vNr;
            CCCDEVART.POZITIE = vPozitie;
            CCCDEVART.TIP = vTip;
            CCCDEVART.SIMBOL = vSimbol;
            CCCDEVART.DENUMIRE = vDenumire;
            CCCDEVART.UM = vUM;
            CCCDEVART.CONSUM = vConsum;
            CCCDEVART.CANTITATE = vCantitate;
            CCCDEVART.MATERIAL = vMaterial;
            CCCDEVART.MANOPERA = vManopera;
            CCCDEVART.UTILAJ = vUtilaj;
            CCCDEVART.TRANSPORT = vTransport;
            CCCDEVART.PU = vPU;
            CCCDEVART.PT = vPT;
            CCCDEVART.LEGATURA = vLeg;
            CCCDEVART.POST;
        }
        if ((vTip == 'Recap') || (vTip == 'Total') || (vTip == 'TVA')) {
            CCCDEVCH.APPEND;
            CCCDEVCH.NR = vNr;
            CCCDEVCH.POZITIE = vSimbol;
            CCCDEVCH.TIP = vTip;
            CCCDEVCH.SIMBOL = vPozitie;
            CCCDEVCH.DENUMIRE = vDenumire;
            CCCDEVCH.PROCENT = vConsum;
            CCCDEVCH.MATERIAL = vMaterial;
            CCCDEVCH.MANOPERA = vManopera;
            CCCDEVCH.UTILAJ = vUtilaj;
            CCCDEVCH.TRANSPORT = vTransport;
            CCCDEVCH.VALTOT = vPU;
            CCCDEVCH.LEGATURA = vLeg;
            CCCDEVCH.POST;
        }

        i = i + 1;
    }
    ExcelApp.Close();
    Excel.Application.Quit();
    vCheck = 0;
    X.WARNING('Import finalizat!');
}

function EXECCOMMAND(cmd) {
    if (cmd == '20200221') {
        var ds = X.GETSQLDATASET('select * from CCCACTIVITATEPRJC where prjc=' + SALDOC.PRJC, null);
        if (ds.RECORDCOUNT) {
            ds.FIRST;
            while (!ds.EOF) {
                SRVLINES.APPEND;
                SRVLINES.MTRL = 13498;
                SRVLINES.CCCSPECIALIZARE = ds.CCCSPECIALIZARE;
                SRVLINES.CCCCOLECTIE = ds.COLECTIE;
                SRVLINES.CCCCAPITOL = ds.CAPITOL;
                SRVLINES.CCCGRUPALUCRARI = ds.GRUPALUCRARI;
                SRVLINES.CCCACTIVITATE = ds.CCCACTIVITATE;
                SRVLINES.POST;
                ds.NEXT;
            }
        }
    }

    if (cmd == '20141107') {
        recalculFormule();
    }

    if (cmd == 20190409) {
        //adauga liniile (art/serv) in fisa limita selectata, nu uita findocs, fullytransf, qty1cov
        if (SALDOC.CCCSTATUS == 2120)
            X.OPENSUBFORM('SFDEVIZE');
        else
            X.WARNING('Doar devizele finalizate pot fin convertite...');
    }
}

function ON_SFDEVIZE_SHOW() {
    CCCDEVIZEDECONVERTITINFL.FIRST;
    while (!CCCDEVIZEDECONVERTITINFL.EOF) {
        CCCDEVIZEDECONVERTITINFL.DELETE;
    }
    var ds = X.GETSQLDATASET('select A.findoc from findoc A where isnull(A.CCCSUMAAGREATA, 0) = 1 and ISNULL((SELECT distinct 1 FROM MTRLINES L, FINDOC F LEFT OUTER JOIN TRDR TR ON F.TRDR=TR.TRDR WHERE L.FINDOCS=A.FINDOC AND F.FINDOC=L.FINDOC AND L.SOSOURCE=1351), 0) <> 1 and A.sosource=1351 and A.fprms=4068 ' +
        'and A.series=4068 and A.iscancel=0 and A.prjc=' + SALDOC.PRJC, null);
    if (ds.RECORDCOUNT) {
        ds.FIRST;
        while (!ds.EOF) {
            if (!esteConvertit(ds.findoc)) {
                CCCDEVIZEDECONVERTITINFL.APPEND;
                CCCDEVIZEDECONVERTITINFL.DEVIZ = ds.findoc;
                if (ds.findoc == SALDOC.FINDOC)
                    CCCDEVIZEDECONVERTITINFL.CONVERSIE = 1;
                else
                    CCCDEVIZEDECONVERTITINFL.CONVERSIE = 0;
                CCCDEVIZEDECONVERTITINFL.POST;
            }

            ds.NEXT;
        }
    }
}

function ON_SALDOC_CCCVALOARE() {
    if (SALDOC.CCCVALOARE) {
        bifeaza(1);
    } else {
        bifeaza(0);
    }
}

function bifeaza(bifa) {
    CCCDEVIZEDECONVERTITINFL.FIRST;
    while (!CCCDEVIZEDECONVERTITINFL.EOF) {
        if (CCCDEVIZEDECONVERTITINFL.DEVIZ == SALDOC.FINDOC) {
            CCCDEVIZEDECONVERTITINFL.CONVERSIE = 1;
        } else
            CCCDEVIZEDECONVERTITINFL.CONVERSIE = bifa;
        CCCDEVIZEDECONVERTITINFL.NEXT;
    }
}

function ON_SFDEVIZE_ACCEPT() {
    var devize = [];
    CCCDEVIZEDECONVERTITINFL.FIRST;
    while (!CCCDEVIZEDECONVERTITINFL.EOF) {
        if (CCCDEVIZEDECONVERTITINFL.CONVERSIE)
            devize.push(CCCDEVIZEDECONVERTITINFL.DEVIZ);
        CCCDEVIZEDECONVERTITINFL.NEXT;
    }

    if (!devize.length)
        return;
    else {
        X.SETPARAM('WARNINGS', 'OFF');
        X.SETPARAM('NOMESSAGES', 1);
        for (var i = 0; i < devize.length; i++) {
            //update current
            if (devize[i] == SALDOC.FINDOC) {
                updateFL_1(ITELINES);
                updateFL_1(SRVLINES);
            } else {
                var d = X.CreateObj('SALDOC'),
                    iteDev = d.FindTable('ITELINES'),
                    srvDev = d.FindTable('SRVLINES');
                try {
                    d.DBLocate(devize[i]);
                    updateFL_1(iteDev);
                    updateFL_1(srvDev);

                } catch (err) {
                    X.WARNING(err.message);
                }
                finally {
                    d.FREE;
                }
            }

        }
        X.SETPARAM('WARNINGS', 'ON');
        X.SETPARAM('NOMESSAGES', 0);
    }

    X.SETPROPERTY('MERGECHANGELOG', 1);
}

function updateFL_1(ds) {
    //debugger;
    var q = '',
        mtrlin = X.SQL('select max(mtrlines) from mtrlines where findoc=' + SALDOC.CCCFLMR, null),
        linum = X.SQL('select max(LINENUM) from mtrlines where findoc=' + SALDOC.CCCFLMR, null);
    ds.FIRST;
    while (!ds.EOF) {
        mtrlin++;
        linum++;
        q += 'INSERT INTO MTRLINES (COMPANY, FINDOC, MTRLINES, LINENUM, SODTYPE, MTRL, SOSOURCE, VAT, FINDOCS, CCCMTRLGEN, QTY1,' +
            'PRJC,CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF, CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE, CCCTABLOURI, CCCCIRCUIT,' +
            'CCCSPECIALIZARE, CCCCOLECTIE,CCCCAPITOL, CCCGRUPALUCRARI, CCCACTIVITATE) VALUES (' +
            ds.COMPANY + ',' + SALDOC.CCCFLMR + ',' + mtrlin + ',' + linum + ',' + ds.SODTYPE + ',' + ds.MTRL + ',1351,' + ds.VAT + ',' + ds.FINDOC + ',' +
            ds.CCCMTRLGEN + ',' + ds.QTY1 + ',' +
            ds.PRJC + ',' + ds.CCCSPECIALITATESF + ',' + ds.CCCSF + ',' + ds.CCCCOLECTIESF + ',' + ds.CCCCLADIRE + ',' + ds.CCCPRIMARYSPACE + ',' +
            ds.CCCSECONDARYSPACE + ',' + ds.CCCINCAPERE + ',' + ds.CCCTABLOURI + ',' + ds.CCCCIRCUIT + ',' + ds.CCCSPECIALIZARE + ',' +
            ds.CCCCOLECTIE + ',' + ds.CCCCAPITOL + ',' + ds.CCCGRUPALUCRARI + ',' + ds.CCCACTIVITATE + ');';
        ds.NEXT;
    }

    X.RUNSQL(q, null);

    X.WARNING('Liniile au fost adaugate in fisa limita indicata.\nO zi frumoasa.');
}

function updateFL(iteDs, srvDs) {
    if (SALDOC.CCCFLMR) {
        var max = X.GETSQLDATASET('select max(mtrlines) max from mtrlines where findoc=' + SALDOC.CCCFLMR, null).max,
            contor = 0;
        if (iteDs.RECORDCOUNT || srvDs.RECORDCOUNT) {
            X.EXEC('Button:Save');
            try {
                var ObjFL = X.CreateObjForm('SALDOC[Form=FLCM electric]');
                ObjFL.DBLocate(SALDOC.CCCFLMR);
                var TblFL = ObjFL.Findtable('FINDOC');
                var FLIte = ObjFL.Findtable('ITELINES');
                var FLSrv = ObjFL.Findtable('SRVLINES');
                if (TblFL.FINDOC == SALDOC.CCCFLMR) {
                    TblFL.Edit;
                    if (iteDs.RECORDCOUNT > 0) {
                        iteDs.FIRST;
                        while (!iteDs.EOF) {
                            contor++;
                            X.PROCESSMESSAGES;
                            max++;
                            FLIte.APPEND;
                            FLIte.MTRLINES = max;
                            if (iteDs.MTRL) {
                                FLIte.MTRL = iteDs.MTRL;
                                if (iteDs.CCCMTRLGEN)
                                    FLIte.CCCMTRLGEN = iteDs.CCCMTRLGEN;
                                if (iteDs.QTY1)
                                    FLIte.QTY1 = iteDs.QTY1;
                                if (SALDOC.PRJC)
                                    FLIte.PRJC = SALDOC.PRJC;
                                if (iteDs.CCCSPECIALITATESF)
                                    FLIte.CCCSPECIALITATESF = iteDs.CCCSPECIALITATESF;
                                if (iteDs.CCCSF)
                                    FLIte.CCCSF = iteDs.CCCSF;
                                if (iteDs.CCCCOLECTIESF)
                                    FLIte.CCCCOLECTIESF = iteDs.CCCCOLECTIESF;
                                if (iteDs.CCCTABLOURI)
                                    FLIte.CCCTABLOURI = iteDs.CCCTABLOURI;
                                if (iteDs.CCCCIRCUIT)
                                    FLIte.CCCCIRCUIT = iteDs.CCCCIRCUIT;
                                if (iteDs.COMMENTS1)
                                    FLIte.COMMENTS1 = iteDs.COMMENTS1;
                                if (iteDs.CCCCLADIRE)
                                    FLIte.CCCCLADIRE = iteDs.CCCCLADIRE;
                                if (iteDs.CCCPRIMARYSPACE)
                                    FLIte.CCCPRIMARYSPACE = iteDs.CCCPRIMARYSPACE;
                                if (iteDs.CCCSECONDARYSPACE)
                                    FLIte.CCCSECONDARYSPACE = iteDs.CCCSECONDARYSPACE;
                                if (iteDs.CCCINCAPERE)
                                    FLIte.CCCINCAPERE = iteDs.CCCINCAPERE;
                                FLIte.FINDOCS = iteDs.FINDOC;
                                FLIte.POST;
                            }
                            X.PROCESSMESSAGES();
                            iteDs.NEXT;
                        }
                    }

                    if (srvDs.RECORDCOUNT > 0) {
                        srvDs.FIRST;
                        while (!srvDs.EOF()) {
                            X.PROCESSMESSAGES;
                            max++;
                            contor++;
                            FLSrv.APPEND;
                            FLSrv.MTRLINES = max;
                            FLSrv.MTRL = srvDs.MTRL;
                            if (srvDs.QTY1)
                                FLSrv.QTY1 = srvDs.QTY1;
                            FLSrv.MTRCATEGORY = 3;
                            if (srvDs.CCCMTRLGEN)
                                FLSrv.CCCMTRLGEN = srvDs.CCCMTRLGEN;
                            if (srvDs.CCCSPECIALIZARE)
                                FLSrv.CCCSPECIALIZARE = srvDs.CCCSPECIALIZARE;
                            if (srvDs.CCCCOLECTIE)
                                FLSrv.CCCCOLECTIE = srvDs.CCCCOLECTIE;
                            if (srvDs.CCCCAPITOL)
                                FLSrv.CCCCAPITOL = srvDs.CCCCAPITOL;
                            if (srvDs.CCCGRUPALUCRARI)
                                FLSrv.CCCGRUPALUCRARI = srvDs.CCCGRUPALUCRARI;
                            if (srvDs.CCCACTIVITATE)
                                FLSrv.CCCACTIVITATE = srvDs.CCCACTIVITATE;
                            if (srvDs.CCCUM)
                                FLSrv.CCCUM = srvDs.CCCUM;
                            if (srvDs.QTY2)
                                FLSrv.QTY2 = srvDs.QTY2;
                            if (SALDOC.PRJC)
                                FLSrv.PRJC = SALDOC.PRJC;
                            if (srvDs.CCCSPECIALITATESF)
                                FLSrv.CCCSPECIALITATESF = srvDs.CCCSPECIALITATESF;
                            if (srvDs.CCCSF)
                                FLSrv.CCCSF = srvDs.CCCSF;
                            if (srvDs.CCCCOLECTIESF)
                                FLSrv.CCCCOLECTIESF = srvDs.CCCCOLECTIESF;
                            if (srvDs.CCCTABLOURI)
                                FLSrv.CCCTABLOURI = srvDs.CCCTABLOURI;
                            if (srvDs.CCCCIRCUIT)
                                FLSrv.CCCCIRCUIT = srvDs.CCCCIRCUIT;
                            if (srvDs.CCCCLADIRE)
                                FLSrv.CCCCLADIRE = srvDs.CCCCLADIRE;
                            if (srvDs.CCCPRIMARYSPACE)
                                FLSrv.CCCPRIMARYSPACE = srvDs.CCCPRIMARYSPACE;
                            if (srvDs.CCCSECONDARYSPACE)
                                FLSrv.CCCSECONDARYSPACE = srvDs.CCCSECONDARYSPACE;
                            if (srvDs.CCCINCAPERE)
                                FLSrv.CCCINCAPERE = srvDs.CCCINCAPERE;
                            if (srvDs.COMMENTS1)
                                FLSrv.COMMENTS1 = srvDs.COMMENTS1;
                            FLSrv.FINDOCS = srvDs.FINDOC;
                            //srvDs.QTY1COV = srvDs.QTY1;
                            FLSrv.POST;

                            X.PROCESSMESSAGES();
                            srvDs.NEXT;
                        }
                    }

                    //TblFL.FULLYTRANSF = 1;
                    if (iteDs.RECORDCOUNT + srvDs.RECORDCOUNT == contor) {
                        ObjFL.DBPost;
                    } else {
                        X.WARNING('Nu s-au convertit toate liniile, invalidez conversia.\nReluati conversia.');
                    }
                    X.WARNING('Liniile au fost adaugate in fisa limita indicata.\nO zi frumoasa.');
                }
            } catch (e) {
                X.WARNING(e.message);
            }
            finally {
                ObjFL.FREE;
                ObjFL = null;

            }
        }

    }
}

function ON_CCCDEVART_MATERIAL() {
    if (vCheck == 0) {
        calculPU();
        if (CCCDEVART.TIP != 'Art')
            calculTotal();
    }
}

function ON_CCCDEVART_MANOPERA() {
    if (vCheck == 0) {
        calculPU();
        if (CCCDEVART.TIP != 'Art')
            calculTotal();
    }
}

function ON_CCCDEVART_UTILAJ() {
    if (vCheck == 0) {
        calculPU();
        if (CCCDEVART.TIP != 'Art')
            calculTotal();
    }
}

function ON_CCCDEVART_TRANSPORT() {
    if (vCheck == 0) {
        calculPU();
        if (CCCDEVART.TIP != 'Art')
            calculTotal();
    }
}

function calculPU() {
    CCCDEVART.PU = CCCDEVART.MATERIAL + CCCDEVART.MANOPERA + CCCDEVART.UTILAJ + CCCDEVART.TRANSPORT;
    CCCDEVART.PT = CCCDEVART.PU * CCCDEVART.CANTITATE;
}

function ON_CCCDEVART_CANTITATE() {
    if (vCheck == 0) {
        calculPU();
        calculTotal();
        CCCDEVART.PT = CCCDEVART.PU * CCCDEVART.CANTITATE;
    }
}

function ON_CCCDEVART_CONSUM() {
    if (vCheck == 0) {
        if (CCCDEVART.TIP == 'Art') {
            CCCDEVART.CANTITATE = CCCDEVART.CONSUM;
            ceCantNou = CCCDEVART.CANTITATE;
            ceLeg = CCCDEVART.LEGATURA;
            cePoz = CCCDEVART.RECNO;
            CCCDEVART.DISABLECONTROLS;
            CCCDEVART.FIRST;
            while (!CCCDEVART.Eof) {
                if ((CCCDEVART.LEGATURA == ceLeg) && (CCCDEVART.TIP != 'Art')) {
                    CCCDEVART.CANTITATE = CCCDEVART.CONSUM * ceCantNou;
                }
                CCCDEVART.NEXT;
            }
            CCCDEVART.RECNO = cePoz;
            CCCDEVART.ENABLECONTROLS;
        } else {
            cePoz = CCCDEVART.RECNO;
            ceLeg = CCCDEVART.LEGATURA;
            CCCDEVART.DISABLECONTROLS;
            CCCDEVART.FIRST;
            while (!CCCDEVART.Eof) {
                if ((CCCDEVART.LEGATURA == ceLeg) && (CCCDEVART.TIP == 'Art')) {
                    ceCant = CCCDEVART.CANTITATE;
                    CCCDEVART.LAST;
                }
                CCCDEVART.NEXT;
            }
            CCCDEVART.RECNO = cePoz;
            CCCDEVART.CANTITATE = ceCant * CCCDEVART.CONSUM;
            CCCDEVART.ENABLECONTROLS;
        }
    }
}

function calculTotal() {
    cePoz = CCCDEVART.RECNO;
    ceLeg = CCCDEVART.LEGATURA;
    CCCDEVART.DISABLECONTROLS;
    CCCDEVART.FIRST;
    ceMat = 0;
    ceMan = 0;
    ceUti = 0;
    ceTra = 0;
    while (!CCCDEVART.Eof) {
        if ((CCCDEVART.LEGATURA == ceLeg) && (CCCDEVART.TIP != 'Art')) {
            if (CCCDEVART.CONSUM * CCCDEVART.MATERIALE != null)
                ceMat = ceMat + CCCDEVART.CONSUM * CCCDEVART.MATERIAL;
            if (CCCDEVART.CONSUM * CCCDEVART.MANOPERA != null)
                ceMan = ceMan + CCCDEVART.CONSUM * CCCDEVART.MANOPERA;
            if (CCCDEVART.CONSUM * CCCDEVART.UTILAJ != null)
                ceUti = ceUti + CCCDEVART.CONSUM * CCCDEVART.UTILAJ;
            if (CCCDEVART.CONSUM * CCCDEVART.TRANSPORT != null)
                ceTra = ceTra + CCCDEVART.CONSUM * CCCDEVART.TRANSPORT;
        }
        CCCDEVART.NEXT;
    }
    CCCDEVART.FIRST;
    while (!CCCDEVART.Eof) {
        if ((CCCDEVART.LEGATURA == ceLeg) && (CCCDEVART.TIP == 'Art')) {
            CCCDEVART.MATERIAL = ceMat;
            CCCDEVART.MANOPERA = ceMan;
            CCCDEVART.UTILAJ = ceUti;
            CCCDEVART.TRANSPORT = ceTra;
            CCCDEVART.LAST;
        }
        CCCDEVART.NEXT;
    }
    CCCDEVART.RECNO = cePoz;
    CCCDEVART.ENABLECONTROLS;
}

function recalculFormule() {
    CCCDEVCH.FIRST;
    while (!CCCDEVCH.Eof) {
        if (CCCDEVCH.SIMBOL == 'T0') {
            ceMat = 0;
            ceMan = 0;
            ceUti = 0;
            ceTra = 0;
            CCCDEVART.FIRST;
            while (!CCCDEVART.Eof) {
                if (CCCDEVART.TIP == 'Art') {
                    ceMat = ceMat + CCCDEVART.MATERIAL * CCCDEVART.CONSUM;
                    ceMan = ceMan + CCCDEVART.MANOPERA * CCCDEVART.CONSUM;
                    ceUti = ceUti + CCCDEVART.UTILAJ * CCCDEVART.CONSUM;
                    ceTra = ceTra + CCCDEVART.TRANSPORT * CCCDEVART.CONSUM;
                }
                CCCDEVART.NEXT;
            }
            CCCDEVCH.MATERIAL = ceMat;
            CCCDEVCH.MANOPERA = ceMan;
            CCCDEVCH.UTILAJ = ceUti;
            CCCDEVCH.TRANSPORT = ceTra;
            CCCDEVCH.VALTOT = ceMat + ceMan + ceUti + ceTra;
        }
        if ((CCCDEVCH.TIP == 'Recap') && (CCCDEVCH.LEGATURA == 'T0')) {
            CCCDEVCH.MANOPERA = (CCCDEVCH.PROCENT / 100) * ceMan;
            CCCDEVCH.VALTOT = CCCDEVCH.MANOPERA;
        }
        if (CCCDEVCH.SIMBOL == 'T1') {
            cePoz = CCCDEVCH.RECNO;
            ceMat = 0;
            ceMan = 0;
            ceUti = 0;
            ceTra = 0;
            CCCDEVCH.DISABLECONTROLS;
            CCCDEVCH.FIRST;
            while (!CCCDEVCH.Eof) {
                if (CCCDEVCH.LEGATURA == 'T0') {
                    ceMat = ceMat + CCCDEVCH.MATERIAL;
                    ceMan = ceMan + CCCDEVCH.MANOPERA;
                    ceUti = ceUti + CCCDEVCH.UTILAJ;
                    ceTra = ceTra + CCCDEVCH.TRANSPORT;
                }
                CCCDEVCH.NEXT;
            }
            CCCDEVCH.RECNO = cePoz;
            CCCDEVCH.MATERIAL = ceMat;
            CCCDEVCH.MANOPERA = ceMan;
            CCCDEVCH.UTILAJ = ceUti;
            CCCDEVCH.TRANSPORT = ceTra;
            CCCDEVCH.VALTOT = ceMat + ceMan + ceUti + ceTra;
            CCCDEVCH.ENABLECONTROLS;
        }
        if ((CCCDEVCH.TIP == 'Recap') && (CCCDEVCH.LEGATURA == 'T1')) {
            CCCDEVCH.MANOPERA = (CCCDEVCH.PROCENT / 100) * ceMan;
            CCCDEVCH.MATERIAL = (CCCDEVCH.PROCENT / 100) * ceMat;
            CCCDEVCH.TRANSPORT = (CCCDEVCH.PROCENT / 100) * ceTra;
            CCCDEVCH.UTILAJ = (CCCDEVCH.PROCENT / 100) * ceUti;
            CCCDEVCH.VALTOT = CCCDEVCH.MANOPERA + CCCDEVCH.MATERIAL + CCCDEVCH.TRANSPORT + CCCDEVCH.UTILAJ;
        }
        if (CCCDEVCH.SIMBOL == 'T2') {
            cePoz = CCCDEVCH.RECNO;
            ceMat = 0;
            ceMan = 0;
            ceUti = 0;
            ceTra = 0;
            CCCDEVCH.DISABLECONTROLS;
            CCCDEVCH.FIRST;
            while (!CCCDEVCH.Eof) {
                if (CCCDEVCH.LEGATURA == 'T1') {
                    ceMat = ceMat + CCCDEVCH.MATERIAL;
                    ceMan = ceMan + CCCDEVCH.MANOPERA;
                    ceUti = ceUti + CCCDEVCH.UTILAJ;
                    ceTra = ceTra + CCCDEVCH.TRANSPORT;
                }
                CCCDEVCH.NEXT;
            }
            CCCDEVCH.RECNO = cePoz;
            CCCDEVCH.MATERIAL = ceMat;
            CCCDEVCH.MANOPERA = ceMan;
            CCCDEVCH.UTILAJ = ceUti;
            CCCDEVCH.TRANSPORT = ceTra;
            CCCDEVCH.VALTOT = ceMat + ceMan + ceUti + ceTra;
            CCCDEVCH.ENABLECONTROLS;
        }
        if ((CCCDEVCH.TIP == 'Recap') && (CCCDEVCH.LEGATURA == 'T2')) {
            CCCDEVCH.MANOPERA = (CCCDEVCH.PROCENT / 100) * ceMan;
            CCCDEVCH.MATERIAL = (CCCDEVCH.PROCENT / 100) * ceMat;
            CCCDEVCH.TRANSPORT = (CCCDEVCH.PROCENT / 100) * ceTra;
            CCCDEVCH.UTILAJ = (CCCDEVCH.PROCENT / 100) * ceUti;
            CCCDEVCH.VALTOT = CCCDEVCH.MANOPERA + CCCDEVCH.MATERIAL + CCCDEVCH.TRANSPORT + CCCDEVCH.UTILAJ;
        }
        if (CCCDEVCH.SIMBOL == 'T3') {
            cePoz = CCCDEVCH.RECNO;
            ceMat = 0;
            ceMan = 0;
            ceUti = 0;
            ceTra = 0;
            CCCDEVCH.DISABLECONTROLS;
            CCCDEVCH.FIRST;
            while (!CCCDEVCH.Eof) {
                if (CCCDEVCH.LEGATURA == 'T2') {
                    ceMat = ceMat + CCCDEVCH.MATERIAL;
                    ceMan = ceMan + CCCDEVCH.MANOPERA;
                    ceUti = ceUti + CCCDEVCH.UTILAJ;
                    ceTra = ceTra + CCCDEVCH.TRANSPORT;
                }
                CCCDEVCH.NEXT;
            }
            CCCDEVCH.RECNO = cePoz;
            CCCDEVCH.MATERIAL = ceMat;
            CCCDEVCH.MANOPERA = ceMan;
            CCCDEVCH.UTILAJ = ceUti;
            CCCDEVCH.TRANSPORT = ceTra;
            CCCDEVCH.VALTOT = ceMat + ceMan + ceUti + ceTra;
            CCCDEVCH.ENABLECONTROLS;
        }
        if ((CCCDEVCH.TIP == 'TVA') && (CCCDEVCH.LEGATURA == 'T3')) {
            CCCDEVCH.MANOPERA = (CCCDEVCH.PROCENT / 100) * ceMan;
            CCCDEVCH.MATERIAL = (CCCDEVCH.PROCENT / 100) * ceMat;
            CCCDEVCH.TRANSPORT = (CCCDEVCH.PROCENT / 100) * ceTra;
            CCCDEVCH.UTILAJ = (CCCDEVCH.PROCENT / 100) * ceUti;
            CCCDEVCH.VALTOT = CCCDEVCH.MANOPERA + CCCDEVCH.MATERIAL + CCCDEVCH.TRANSPORT + CCCDEVCH.UTILAJ;
        }
        if (CCCDEVCH.SIMBOL == 'T4') {
            cePoz = CCCDEVCH.RECNO;
            ceMat = 0;
            ceMan = 0;
            ceUti = 0;
            ceTra = 0;
            CCCDEVCH.DISABLECONTROLS;
            CCCDEVCH.FIRST;
            while (!CCCDEVCH.Eof) {
                if (CCCDEVCH.LEGATURA == 'T3') {
                    ceMat = ceMat + CCCDEVCH.MATERIAL;
                    ceMan = ceMan + CCCDEVCH.MANOPERA;
                    ceUti = ceUti + CCCDEVCH.UTILAJ;
                    ceTra = ceTra + CCCDEVCH.TRANSPORT;
                }
                CCCDEVCH.NEXT;
            }
            CCCDEVCH.RECNO = cePoz;
            CCCDEVCH.MATERIAL = ceMat;
            CCCDEVCH.MANOPERA = ceMan;
            CCCDEVCH.UTILAJ = ceUti;
            CCCDEVCH.TRANSPORT = ceTra;
            CCCDEVCH.VALTOT = ceMat + ceMan + ceUti + ceTra;
            CCCDEVCH.ENABLECONTROLS;
        }
        CCCDEVCH.NEXT;
    }
    X.WARNING('Calcul finalizat!');
}

//---------Final Import Deviz------------------\\

//creaza articole generice pe saldoc.cccheader si saldoc.prjc
function creazaArtGen(nume) {
    X.SETPARAM('WARNINGS', 'OFF');
    X.SETPARAM('NOMESSAGES', 1);
    var o = X.CreateObj('ITEM'),
        mtrl = 0;
    try {
        o.DBInsert;
        var t = o.FindTable('MTRL');
        t.Edit;
        var n = X.SQL("select FORMAT(max(dbo.udf_GetNumeric(code)) + 1,'0######') from mtrl where isnull(cccprjc, 0) <> 0", null);
        if (!n)
            n = '0000001'; //primul
        t.CODE = 'ARTGEN-' + n;
        t.MTRTHIRD = 1;
        t.REMAINMODE = 1;
        t.NAME = nume.toString() + ' (M.G.I.)';
        t.CCCHEADER = SALDOC.CCCHEADER;
        t.CCCPRJC = SALDOC.PRJC;
        t.VAT = 0;
        t.MTRACN = 16;
        t.MTRUNIT1 = 1;
        t.MTRUNIT1 = 1;
        t.MTRUNIT1 = 1;
        t.MTRUNIT1 = ITELINES.CCCUM ? ITELINES.CCCUM : 1;
        t.SODTYPE = 51;
        t.REMARKS = 'Articol generic creat automat din schema electrica';

        mtrl = o.DBPost;
        if (mtrl) {
            var o1 = X.CreateObj('CCCSCHELGEO');
            try {
                o1.DBLocate(SALDOC.CCCHEADER);
                var l = o1.FindTable('CCCARTGEN');
                l.Edit;
                l.APPEND;
                l.CCCMTRLGEN = mtrl;
                l.PRJC = SALDOC.PRJC;
                l.CCCHEADER = SALDOC.CCCHEADER;
                l.MINE = 1;
                l.POST;

                o1.DBPost;
            } catch (e) {
                X.WARNING(e.message);
            }
            finally {
                o1.FREE;
                o1 = null;
            }
        }
    } catch (e) {
        X.WARNING(e.message);
    }
    finally {
        o.FREE;
        o = null;
        return mtrl;
    }

    X.SETPROPERTY('MERGECHANGELOG', 1);

    X.SETPARAM('WARNINGS', 'ON');
    X.SETPARAM('NOMESSAGES', 0);
}

function ON_ITELINES_BOOL01() {
    if (ITELINES.BOOL01 == 1) {
        ITELINES.CCCACTIVITATE = SRVLINES.CCCACTIVITATE;
    } else if (ITELINES.BOOL01 == 0) {
        ITELINES.CCCACTIVITATE = null;
    }
}

function ON_ITELINES_NEW() {
    if (ITELINES.BOOL02 == 0) {
        if (vedeta.CCCMTRLGEN)
            ITELINES.CCCMTRLGEN = vedeta.CCCMTRLGEN;
        if (vedeta.CCCSPECIALITATESF)
            ITELINES.CCCSPECIALITATESF = vedeta.CCCSPECIALITATESF;
        if (vedeta.CCCSF)
            ITELINES.CCCSF = vedeta.CCCSF;
        if (vedeta.CCCCOLECTIESF)
            ITELINES.CCCCOLECTIESF = vedeta.CCCCOLECTIESF;
        if (vedeta.CCCCLADIRE)
            ITELINES.CCCCLADIRE = vedeta.CCCCLADIRE;
        if (vedeta.CCCPRIMARYSPACE)
            ITELINES.CCCPRIMARYSPACE = vedeta.CCCPRIMARYSPACE;
        if (vedeta.CCCSECONDARYSPACE)
            ITELINES.CCCSECONDARYSPACE = vedeta.CCCSECONDARYSPACE;
        if (vedeta.CCCINCAPERE)
            ITELINES.CCCINCAPERE = vedeta.CCCINCAPERE;
        if (vedeta.CCCTABLOURI)
            ITELINES.CCCTABLOURI = vedeta.CCCTABLOURI;
    }
}

function ON_SRVLINES_NEW() {
    if (!SALDOC.BOOL02) {
        if (!SALDOC.BOOL01) {
            SALDOC.CCCSERVICIU = 1;
            if (vedeta.CCCMTRLGEN)
                SRVLINES.CCCMTRLGEN = vedeta.CCCMTRLGEN;
            if (vedeta.CCCSPECIALITATESF)
                SRVLINES.CCCSPECIALITATESF = vedeta.CCCSPECIALITATESF;
            if (vedeta.CCCSF)
                SRVLINES.CCCSF = vedeta.CCCSF;
            if (vedeta.CCCCOLECTIESF)
                SRVLINES.CCCCOLECTIESF = vedeta.CCCCOLECTIESF;
            if (vedeta.CCCCLADIRE)
                SRVLINES.CCCCLADIRE = vedeta.CCCCLADIRE;
            if (vedeta.CCCPRIMARYSPACE)
                SRVLINES.CCCPRIMARYSPACE = vedeta.CCCPRIMARYSPACE;
            if (vedeta.CCCSECONDARYSPACE)
                SRVLINES.CCCSECONDARYSPACE = vedeta.CCCSECONDARYSPACE;
            if (vedeta.CCCINCAPERE)
                SRVLINES.CCCINCAPERE = vedeta.CCCINCAPERE;
            if (vedeta.CCCTABLOURI)
                SRVLINES.CCCTABLOURI = vedeta.CCCTABLOURI;
        } else {
            SALDOC.CCCSERVICIU = 0;
        }
    }
}

function ON_LOCATE() {
    vedeta = {};
    var q = 0,
        mtrlin = 0;
    ITELINES.FIRST;
    while (!ITELINES.EOF) {
        if (ITELINES.BOOL02 > 0) {
            if (ITELINES.QTY1 > q) {
                q = ITELINES.QTY1;
                mtrlin = ITELINES.MTRLINES;
            }
        }
        ITELINES.NEXT;
    }

    //vedeta:
    ITELINES.LOCATE('MTRLINES', mtrlin);
    vedeta.CCCSPECIALITATESF = ITELINES.CCCSPECIALITATESF;
    vedeta.CCCSF = ITELINES.CCCSF;
    vedeta.CCCCOLECTIESF = ITELINES.CCCCOLECTIESF;
    vedeta.CCCCLADIRE = ITELINES.CCCCLADIRE;
    vedeta.CCCPRIMARYSPACE = ITELINES.CCCPRIMARYSPACE;
    vedeta.CCCSECONDARYSPACE = ITELINES.CCCSECONDARYSPACE;
    vedeta.CCCINCAPERE = ITELINES.CCCINCAPERE;
    vedeta.CCCTABLOURI = ITELINES.CCCTABLOURI;
    vedeta.CCCMTRLGEN = ITELINES.CCCMTRLGEN;

    //asigura FL:
    var fl = X.SQL('SELECT isnull(AA.FINDOC, 0) FROM FINDOC AA ' +
        'INNER JOIN MTRLINES BB ON (AA.SOSOURCE=BB.SOSOURCE AND AA.FINDOC=BB.FINDOC) ' +
        'WHERE AA.ISCANCEL=0 AND AA.SERIES = 4067 AND AA.SOSOURCE=1351 AND BB.FINDOCS=' + SALDOC.FINDOC, null);
    if (fl) {
        SALDOC.CCCFLMR = fl;
    }

    //Verifica daca a fost deja convertit in FL
    if (X.SQL('select 1 from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and findocs=' + SALDOC.FINDOC, null)) {
        //a mai fost convertit
        X.SETPROPERTY('FIELD', 'SALDOC.CCCSUMAAGREATA', 'CAPTION', 'CONVERTIT IN FL');
        SALDOC.SETREADONLY('CCCSUMAAGREATA', 0);
        SALDOC.CCCSUMAAGREATA = null;
        SALDOC.SETREADONLY('CCCSUMAAGREATA', 1);
    } else {
        X.SETPROPERTY('FIELD', 'SALDOC.CCCSUMAAGREATA', 'CAPTION', 'De convertit in FL');
        SALDOC.SETREADONLY('CCCSUMAAGREATA', 0);
    }

    SALDOC.BOOL01 = 0;
    SALDOC.BOOL02 = 0;

    X.SETPROPERTY('MERGECHANGELOG', 1);
}

function ON_ITELINES_CCCMTRLGEN() {
    if (!apartineCircuitului(ITELINES))
        return;

    if (!SALDOC.BOOL02)
        if (ITELINES.CCCMTRLGEN && ITELINES.CCCMTRLGEN != vedeta.CCCMTRLGEN && !SALDOC.CCCSERVICIU) {
            whichTab = 1;
            X.OPENSUBFORM('SFCONLOC');
        }
}

function ON_SRVLINES_CCCMTRLGEN() {
    //debugger;
    if (!apartineCircuitului(SRVLINES))
        return;

    if (SRVLINES.CCCMTRLGEN && SRVLINES.CCCMTRLGEN != vedeta.CCCMTRLGEN && !SALDOC.CCCSERVICIU) {
        whichTab = 2;
        X.OPENSUBFORM('SFCONLOC');
    }
}

function apartineCircuitului(ds) {
    if (X.SQL('select case when ' + ds.CCCMTRLGEN + ' not in (' +
        'SELECT DISTINCT bb.cccmtrlgen ' +
        'FROM cccliniicircuit aa ' +
        'inner join cccconsumator bb on (aa.cccconsumator=bb.cccconsumator) ' +
        'WHERE aa.ccccircuit = ' + SALDOC.INT01 + ')' +
        ' then 1 else 0 end', null) == 1) {
        X.WARNING('Consumatorul selectat nu apartine circuitului ' + SALDOC.INT01_CCCCIRCUIT_DENUMIRE);
        ds.DELETE;
        return false;
    } else {
        return true;
    }
}

function ON_ITELINES_COMMENTS2() {
    //rezolva geo si functionalitate atat in consumator cat si in linie
}

function ON_SFCONLOC_SHOW() {
    CCCCONLOC.FIRST;
    while (!CCCCONLOC.EOF) {
        CCCCONLOC.DELETE;
    }

    var ds = getTab();

    if (!ds)
        return;

    if (!SALDOC.CCCHEADER)
        X.EXCEPTION('Acest deviz nu a fost creat din schema electrica.');

    var q = 'SELECT AA.CCCCONSUMATOR, AA.DENUMIRE CONSUMATOR, BB.QTY CANT, ' +
        'BB.CCCCLADIRE, CC.DENUMIRE CLADIRE, ' +
        'BB.CCCPRIMARYSPACE, DD.DENUMIRE PRIMAR, ' +
        'BB.CCCSECONDARYSPACE, EE.DENUMIRE SECUNDAR, ' +
        'BB.CCCINCAPERE, FF.DENUMIRE INCAPERE, ' +
        'AA.CCCSPECIALITATESF, ' +
        'HH.NAME SPECIALITATESF, ' +
        'AA.CCCSF, ' +
        'II.NAME SF, ' +
        'AA.CCCCOLECTIESF, ' +
        'GG.NAME COLECTIESF ' +
        'FROM CCCCONSUMATOR AA ' +
        'LEFT JOIN CCCCONSUMATORGEO BB ON (AA.CCCCONSUMATOR=BB.CCCCONSUMATOR) ' +
        'LEFT JOIN CCCCLADIRE CC ON (CC.CCCCLADIRE=BB.CCCCLADIRE) ' +
        'LEFT JOIN CCCPRIMARYSPACE DD ON (DD.CCCPRIMARYSPACE=BB.CCCPRIMARYSPACE) ' +
        'LEFT JOIN CCCSECONDARYSPACE EE ON (EE.CCCSECONDARYSPACE=BB.CCCSECONDARYSPACE) ' +
        'LEFT JOIN CCCINCAPERE FF ON (FF.CCCINCAPERE=BB.CCCINCAPERE) ' +
        'LEFT JOIN CCCSPECIALITATESF HH ON (HH.CCCSPECIALITATESF=AA.CCCSPECIALITATESF) ' +
        'LEFT JOIN CCCSF II ON (II.CCCSF=AA.CCCSF) ' +
        'LEFT JOIN CCCCOLECTIESF GG ON (GG.CCCCOLECTIESF=AA.CCCCOLECTIESF) ' +
        'WHERE AA.CCCHEADER = ' + SALDOC.CCCHEADER + ' AND AA.CCCMTRLGEN=' + ds.CCCMTRLGEN,
        ds = X.GETSQLDATASET(q, null);

    if (ds.RECORDCOUNT) {
        ds.FIRST;
        while (!ds.EOF) {
            CCCCONLOC.APPEND;
            CCCCONLOC.CCCCONSUMATOR = ds.CCCCONSUMATOR;
            CCCCONLOC.CONSUMATOR = ds.CONSUMATOR;
            CCCCONLOC.CANT = ds.CANT;
            CCCCONLOC.CCCCLADIRE = ds.CCCCLADIRE;
            CCCCONLOC.CLADIRE = ds.CLADIRE;
            CCCCONLOC.CCCPRIMARYSPACE = ds.CCCPRIMARYSPACE;
            CCCCONLOC.PRIMAR = ds.PRIMAR;
            CCCCONLOC.CCCSECONDARYSPACE = ds.CCCSECONDARYSPACE;
            CCCCONLOC.SECUNDAR = ds.SECUNDAR;
            CCCCONLOC.CCCINCAPERE = ds.CCCINCAPERE;
            CCCCONLOC.INCAPERE = ds.INCAPERE;
            CCCCONLOC.SSF = ds.CCCSPECIALITATESF;
            CCCCONLOC.SF = ds.CCCSF;
            CCCCONLOC.CSF = ds.CCCCOLECTIESF;
            CCCCONLOC.POST;
            ds.NEXT;
        }
    }
}

function ON_SFCONLOC_ACCEPT() {
    var ds = getTab();
    if (!ds)
        return;

    if (CCCCONLOC.CCCCONSUMATOR) {
        if (CCCCONLOC.CANT)
            ds.QTY = CCCCONLOC.CANT;
        if (CCCCONLOC.CCCCLADIRE)
            ds.CCCCLADIRE = CCCCONLOC.CCCCLADIRE;
        if (CCCCONLOC.CCCPRIMARYSPACE)
            ds.CCCPRIMARYSPACE = CCCCONLOC.CCCPRIMARYSPACE;
        if (CCCCONLOC.CCCSECONDARYSPACE)
            ds.CCCSECONDARYSPACE = CCCCONLOC.CCCSECONDARYSPACE;
        if (CCCCONLOC.CCCINCAPERE)
            ds.CCCINCAPERE = CCCCONLOC.CCCINCAPERE;
        if (CCCCONLOC.SSF)
            ds.CCCSPECIALITATESF = CCCCONLOC.SSF;
        if (CCCCONLOC.SF)
            ds.CCCSF = CCCCONLOC.SF;
        if (CCCCONLOC.CSF)
            ds.CCCCOLECTIESF = CCCCONLOC.CSF;

        ds.POST;
    } else {
        ds.DELETE;
    }
}

function ON_SFCONLOC_CANCEL() {
    var ds = getTab();

    if (!ds)
        return;

    ds.DELETE;
}

function getTab() {
    if (whichTab == 1) {
        return ITELINES;
    } else if (whichTab == 2) {
        return SRVLINES;
    } else {
        return null;
    }
}

function ON_SRVLINES_CCCSPECIALIZARE() {
    SRVLINES.CCCCOLECTIE = null;
    SRVLINES.CCCCAPITOL = null;
    SRVLINES.CCCGRUPALUCRARI = null;
    SRVLINES.CCCACTIVITATE = null;
}

function ON_SRVLINES_CCCCOLECTIE() {
    SRVLINES.CCCCAPITOL = null;
    SRVLINES.CCCGRUPALUCRARI = null;
    SRVLINES.CCCACTIVITATE = null;
}

function ON_SRVLINES_CCCCAPITOL() {
    SRVLINES.CCCGRUPALUCRARI = null;
    SRVLINES.CCCACTIVITATE = null;
}

function ON_SRVLINES_CCCGRUPALUCRARI() {
    SRVLINES.CCCACTIVITATE = null;
}

function esteConvertit(findoc) {
    if (X.SQL('select 1 from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and findocs=' + findoc, null))
        return true;
    else
        return false;
}

function ON_ITELINES_QTY1 () {
	if (ITELINES.QTY1 && ITELINES.QTY1 != ITELINES.CCCANULAT) {
		ITELINES.CCCANULAT = ITELINES.QTY1;
	}
}