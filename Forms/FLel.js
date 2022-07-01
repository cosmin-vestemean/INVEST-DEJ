var zoomed = false;

function ON_POST() {
    //pentru filtrul pe linii
    ITELINES.FILTERED = 0;
    SRVLINES.FILTERED = 0;
    SALDOC.CCCFILTRUOBIECTCM = null;
    SALDOC.CCCFILTRUDEVIZCM = null;
    SALDOC.CCCFILTRUSPECIALITATESF = null;
    SALDOC.CCCFILTRUSF = null;
    SALDOC.CCCFILTRUCOLECTIESF = null;
    SALDOC.CCCFILTRUTABLOU = null;
    //--------START------------Editor Operatie in pontaj-Anna-08.04.2016-------------
    //creare id la doc nou
    if (SALDOC.FINDOC < 0) {
        //selectez max id din linii de servicii
        sSQLP = 'SELECT max(A.cccpontajsel)  cccpontajsel	FROM   mtrlines A  LEFT OUTER JOIN findoc B ON A.findoc = B.findoc 	WHERE  B.series IN ( 4056, 4058, 4059, 4067) 	and A.sodtype = 52 ';
        dsP = X.GETSQLDATASET(sSQLP, null);

        //declar ident nou tinand cont de max din linii
        var ident;
        ident = dsP.cccpontajsel;

        //parcurg liniile de document
        SRVLINES.FIRST;
        while (!SRVLINES.EOF()) {
            //vf daca s-a add id sa nu si completez id
            if ((SRVLINES.CCCPONTAJSEL != null) && (SRVLINES.CCCPONTAJSEL != 0) && (SRVLINES.CCCPONTAJSEL
                     != '')) {}
            else {
                ident = ident + 1;
                SRVLINES.CCCPONTAJSEL = ident;
            }
            SRVLINES.NEXT;
        }
        // daca am document deja salvat si modific documentul
    } else {
        //parcurg id din linii de servicii din DB
        sSQLMT = 'select cccpontajsel, CCCCOMMENTS2 from mtrlines where findoc =' + SALDOC.FINDOC + ' and sodtype = 52';
        dsMT = X.GETSQLDATASET(sSQLMT, null);

        //declar var existanta linie serviciu in DB versus View
        var exista;
        exista = 0;

        //parcurg linii serv din DB
        dsMT.FIRST;
        while (!dsMT.EOF()) {
            //verific daca linia de serv se regaseste in pontaj
            sSQLVP = 'select count(*) vf from findoc where int01= ' + dsMT.cccpontajsel + ' and sosource= 1011';
            dsVP = X.GETSQLDATASET(sSQLVP, null);

            //daca se regaseste in pontaj
            if (dsVP.vf > 0) {
                //parcurg liniile din view
                SRVLINES.FIRST;
                while (!SRVLINES.EOF()) {
                    //fac verificarea daca linii serv DB corespunde cu linii serv View
                    if (SRVLINES.CCCPONTAJSEL == dsMT.cccpontajsel) {
                        //daca exista e ok
                        exista = 1;
                    }
                    SRVLINES.NEXT;
                }
                //daca nu exista blocare salvare
                if (exista == 0) {
                    X.EXCEPTION('Operatia ' + dsMT.CCCCOMMENTS2 + ' este implicata intr-un pontaj. Nu se poate sterge linia!');
                } else {
                    exista = 0;
                }
            }
            dsMT.NEXT;
        }

        //selectez max id din linii de servicii
        sSQLP = 'SELECT max(A.cccpontajsel)  cccpontajsel	FROM   mtrlines A  LEFT OUTER JOIN findoc B ON A.findoc = B.findoc 	WHERE  B.series IN ( 4056, 4058, 4059, 4067) 	and A.sodtype = 52 ';
        dsP = X.GETSQLDATASET(sSQLP, null);

        //declar ident nou tinand cont de max din linii
        var ident;
        ident = dsP.cccpontajsel;

        //parcurg liniile de document
        SRVLINES.FIRST;
        while (!SRVLINES.EOF()) {
            //vf daca s-a add id sa nu si completez id
            if ((SRVLINES.CCCPONTAJSEL != null) && (SRVLINES.CCCPONTAJSEL != 0) && (SRVLINES.CCCPONTAJSEL != '')) {}
            else {
                ident = ident + 1;
                SRVLINES.CCCPONTAJSEL = ident;
            }
            SRVLINES.NEXT;
        }
    }
    //------------END-------Editor Operatie in pontaj-Anna-08.04.2016-------------

    var o = X.CreateObj('CCCSCHELGEO');
    try {
        o.DBLocate(SALDOC.CCCHEADER);
        var l = o.FindTable('CCCHEADER');
        l.Edit;
        l.FLEL = SALDOC.FINDOC;
        o.DBPost;
    } catch (e) {
        X.WARNING(e.message);
    }
    finally {
        o.FREE;
        o = null;
    }

    X.SETPROPERTY('MERGECHANGELOF', 1);
}

function ON_AFTERPOST() {
    X.RUNSQL('update findoc set cccflmr=' + SALDOC.FINDOC + ' where cccheader=' + SALDOC.CCCHEADER + ' and series=4068 and prjc=' + SALDOC.PRJC, null);
}

function ON_LOCATE() {
    X.RUNSQL('update findoc set cccflmr=' + SALDOC.FINDOC + ' where cccheader=' + SALDOC.CCCHEADER + ' and series=4068 and prjc=' + SALDOC.PRJC, null);
}

function ON_DELETE() {
    if (SALDOC.SERIES == 4059 || SALDOC.SERIES == 4067) {

        //interdictie stergere de fisa limita daca este prinsa mai departe in flux.
        sSQLVF = 'select count(*) contor from findoc A left outer join mtrlines B on A.findoc=B.findoc where (A.cccflmr= ' + SALDOC.FINDOC + ' or B.findocs=' + SALDOC.FINDOC + ' ) and iscancel=0';
        dsVF = X.GETSQLDATASET(sSQLVF, null);

        if (dsVF.contor != 0) {
            X.EXCEPTION('Fisa limita nu poate fi stearsa exista tranzactii active ce o au in componenta!');
        }

        SRVLINES.FIRST;
        while (!SRVLINES.EOF()) {
            //verific daca linia de serv se regaseste in pontaj
            sSQLVP = 'select count(*) vf from findoc where int01= ' + SRVLINES.cccpontajsel + ' and sosource= 1011';
            dsVP = X.GETSQLDATASET(sSQLVP, null);

            //daca se regaseste in pontaj
            if (dsVP.vf > 0) {
                X.EXCPETION('Operatia ' + SRVLINES.CCCCOMMENTS2 + ' este implicata intr-un pontaj. Nu se poate sterge FL!');
            }

            CCCFINEMPNM.NEXT;
        }
    }

    X.RUNSQL('update findoc set cccflmr=null where cccheader=' + SALDOC.CCCHEADER + ' and series=4068 and prjc=' + SALDOC.PRJC, null);
}

function EXECCOMMAND(CMD) {
    if (CMD == 20200818) {
        //Creaza succesiv Rezervare virt si apoi if(var findoc = o.DBPost) {CreateObj(Propunere transfer)}

    }

    if (CMD == 20181210) {
        X.SETPROPERTY('PANEL', 'Panel1', 'VISIBLE', zoomed);
        X.SETPROPERTY('PANEL', 'Panel11', 'VISIBLE', zoomed);
        X.SETPROPERTY('PANEL', 'Panel12', 'VISIBLE', zoomed);
        zoomed = !zoomed;
    }
	
	if (CMD == 20220202) {
		ITELINES.FIRST;
		while (!ITELINES.EOF) {
			calculCantInit();
			ITELINES.NEXT;
		}
		
		X.WARNING('Done.');
	}
}

function ON_CANCEL() {
    //pun 0 pe filtru in linii de Obiect si deviz la cancel
    ITELINES.FILTERED = 0;
    SRVLINES.FILTERED = 0;
}

function ON_SALDOC_PRJC() {
    var q,
    fl;
    if (SALDOC.FINDOC < 0 && SALDOC.PRJC) {
        q = "select coalesce(fincode, '') from findoc where series=4067 and prjc=" + SALDOC.PRJC;
        fl = X.SQL(q, null);
        if (fl) {
            X.EXCEPTION('Mai exista o fisa limita: ' + fl + '\nLa re vedere');
        }
    }

    sSQL = 'select TRDBRANCH from prjc where prjc=' + SALDOC.PRJC;
    RD = X.GETSQLDATASET(sSQL, '');

    SALDOC.TRDBRANCH = RD.TRDBRANCH;

    sSQL = 'select varchar02,varchar03,varchar04 from prjextra where prjc=' + SALDOC.PRJC;
    RCCC = X.GETSQLDATASET(sSQL, '');

    SALDOC.CCCNRCME = RCCC.varchar03;
    SALDOC.CCCNRCTR = RCCC.varchar04;
    SALDOC.CCCNRCOM = RCCC.varchar02;
}

//actualizare responsabil dep.
function ON_SALDOC_CCCDEP() {
    SALDOC.CCCRESPON = null;
}

//filtru in linii pe deviz si obiect CM
function ON_SALDOC_CCCFILTRUOBIECTCM() {
    filterThis(SALDOC.CCCFILTRUOBIECTCM, 'PRJCSTAGE');
}

function ON_SALDOC_CCCFILTRUDEVIZCM() {
    filterThis(SALDOC.CCCFILTRUDEVIZCM, 'CCCDEVIZ');
}

function ON_SALDOC_CCCFILTRUSPECIALITATESF() {
    filterThis(SALDOC.CCCFILTRUSPECIALITATESF, 'CCCSPECIALITATESF');
}

function ON_SALDOC_CCCFILTRUSF() {
    filterThis(SALDOC.CCCFILTRUSF, 'CCCSF');
}

function ON_SALDOC_CCCFILTRUCOLECTIESF() {
    filterThis(SALDOC.CCCFILTRUCOLECTIESF, 'CCCCOLECTIESF');
}

function ON_SALDOC_CCCFILTRUTABLOU() {
    filterThis(SALDOC.CCCFILTRUTABLOU, 'CCCTABLOU');
}

function filterThis(intCampFiltru, strCampFiltrat) {
    //filtru cumulativ
    var a = stareaActualaFiltre(1);
    var b = stareaActualaFiltre(2);
    if (intCampFiltru) {
        //daca a => implict exista si b, singura diferenta este ca unul actioneaza pe ITELINES iar celalalt pe SRVLINES
        if (a) {
            ITELINES.FILTER = '(' + a + ' AND {ITELINES.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            ITELINES.FILTERED = 1;
            SRVLINES.FILTER = '(' + b + ' AND {SRVLINES.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            SRVLINES.FILTERED = 1;
        } else {
            ITELINES.FILTER = '({ITELINES.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            ITELINES.FILTERED = 1;
            SRVLINES.FILTER = '({SRVLINES.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            SRVLINES.FILTERED = 1;
        }
    } else {
        if (a) {
            ITELINES.FILTER = '(' + a + ')';
            ITELINES.FILTERED = 1;
            SRVLINES.FILTER = '(' + b + ')';
            SRVLINES.FILTERED = 1;
        } else {
            ITELINES.FILTERED = 0;
            SRVLINES.FILTERED = 0;
        }
    }
}

function stareaActualaFiltre(intFlag) {
    var arrFilters = [SALDOC.CCCFILTRUOBIECTCM, SALDOC.CCCFILTRUDEVIZCM, SALDOC.CCCFILTRUSPECIALITATESF, SALDOC.CCCFILTRUSF, SALDOC.CCCFILTRUCOLECTIESF, SALDOC.CCCFILTRUTABLOU];
    var ret = ''; //default
    var x = 'ITELINES';
    if (intFlag == 1) {
        x = 'ITELINES.';
    } else if (intFlag == 2) {
        x = 'SRVLINES.';
    } else
        return ret;

    var arrFields = [x + 'PRJCSTAGE', x + 'CCCDEVIZ', x + 'CCCSPECIALITATESF', x + 'CCCSF', x + 'CCCCOLECTIESF', x + 'CCCTABLOU'];

    for (var i = 0; i < arrFilters.length; i++) {
        if (arrFilters[i]) {
            ret += '{' + arrFields[i] + '}=' + arrFilters[i] + ' AND ';
        }
    }

    if (ret) {
        //am un ' AND ' (5 caractere) care ma incurca la sfarsitul frazei
        ret = ret.substring(0, ret.length - 5);
    }

    return ret;
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

function calculCantInit() {
	if (ITELINES.MTRL && !ITELINES.CCCANULAT) {
	var qi = X.GETSQLDATASET('select top 1 b.findoc, b.fincode, b.trndate, a.qty1 '+
		'from mtrlines a '+
		'inner join findoc b on a.findoc=b.findoc '+
		'where b.sosource=1351 and (b.series=4068 or b.series=4074) and cccheader='+SALDOC.CCCHEADER+' and a.mtrl= '+ ITELINES.MTRL +
		' and a.cccspecialitatesf= ' + ITELINES.CCCSPECIALITATESF +
		' and a.CCCSF= ' + ITELINES.CCCSF +
		' and a.CCCCOLECTIESF= ' + ITELINES.CCCCOLECTIESF +
		' and a.CCCCLADIRE= ' + ITELINES.CCCCLADIRE +
		' and a.CCCPRIMARYSPACE= ' + ITELINES.CCCPRIMARYSPACE +
		' and a.CCCSECONDARYSPACE= ' + ITELINES.CCCSECONDARYSPACE +
		' and a.CCCCLADIRE= ' + ITELINES.CCCCLADIRE +
		' and B.INT01= ' + ITELINES.CCCCIRCUIT +
		' and B.CCCTABLOURI= ' + ITELINES.CCCTABLOURI +
		' order by b.insdate desc', null);
		
		if (qi.RECORDCOUNT) {
		ITELINES.CCCANULAT = qi.qty1;
		}
	}
}