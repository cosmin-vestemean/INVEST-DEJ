/*
CREATE FUNCTION dbo.udf_GetNumeric
(
@strAlphaNumeric VARCHAR(256)
)
RETURNS VARCHAR(256)
AS
BEGIN
DECLARE @intAlpha INT
SET @intAlpha = PATINDEX('%[^0-9]%', @strAlphaNumeric)
BEGIN
WHILE @intAlpha > 0
BEGIN
SET @strAlphaNumeric = STUFF(@strAlphaNumeric, @intAlpha, 1, '' )
SET @intAlpha = PATINDEX('%[^0-9]%', @strAlphaNumeric )
END
END
RETURN ISNULL(@strAlphaNumeric,0)
END

ALTER TABLE MTRLINES ADD CCCMTRLGENINIT INT NULL/DESIGNER.

CREATE TABLE CCCMATERIALMARUNT (
CCCMATERIALMARUNT INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
PRJC INT NOT NULL,
CCCHEADER INT NOT NULL,
FINDOC INT NOT NULL,
MTRLINES INT,
MTRL INT NOT NULL,
QTY1 FLOAT
)

CREATE VIEW [dbo].[CCCCONSUMATORV]
AS
(
SELECT A.CCCCONSUMATOR
,A.DENUMIRE
,A.CCCHEADER
,A.QTY
,A.ISACTIVE
FROM CCCCONSUMATOR A
)
 */

var itsMeSF = false,
	oldPosition = 1,
	pasibileDeAFL = [],
	itsNew = false,
	canDel = [999, 1000];

function EXECCOMMAND(cmd) {
	if (cmd == 202010191) {
		if (X.SYS.USER == 999) {
			//debugger;
			makeSets();
		}
	}

	if (cmd == 202008032) {
		if (!(CCCCIRCUIT.CCCCIRCUIT && CCCCIRCUIT.DENUMIRE))
			return;
		oldPosition = CCCTABLOURI.CCCTABLOU;
		X.OPENSUBFORM('SFFILTRE');
	}

	if (cmd == 202008241) {
		itsMeSF = true;
		removeFilters();
		itsMeSF = false;
	}

	if (cmd == 202008281) {
		removeFilters();
	}

	if (cmd == 202008252) {
		removeFilters();
	}

	if (cmd == 202008251) {
		creazaTrasee();
	}

	if (cmd == 202008261) {
		creazaTraseeEl();
	}

	if (cmd == 202008031) {
		if (!(CCCCIRCUIT.CCCCIRCUIT && CCCCIRCUIT.DENUMIRE))
			return;

		var locaSursa = CCCTABLOURI.CCCTABLOU,
			locaCircuit = CCCCIRCUIT.CCCCIRCUIT;

		//debugger;
		if (CCCCIRCUIT.DEVIZ) {
			X.WARNING('A mai fost generat un deviz pentru acest circuit: ' + CCCCIRCUIT.DEVIZ_SALDOC_FINCODE + '\nLa re vedere');
			return;
		}

		var d = X.CreateObjForm('SALDOC[Form=Deviz electric]');
		try {
			d.DbInsert;
			var h = d.FindTable('FINDOC');
			h.Edit;
			h.SERIES = 4068;
			h.PRJC = CCCHEADER.PRJC;
			h.CCCHEADER = CCCHEADER.CCCHEADER;
			if (!CCCTABLOURI.CCCTABLOU) {
				dispose(d);
				return;
			} else {
				h.CCCTABLOURI = CCCTABLOURI.CCCTABLOU;
			}
			if (!CCCCIRCUIT.CCCCIRCUIT) {
				dispose(d);
				return;
			} else {
				h.INT01 = CCCCIRCUIT.CCCCIRCUIT;
			}

			h.CCCSERVICIU = 1; //no popup

			var l = d.FindTable('ITELINES'),
				strErr = '';
			CCCLINIICIRCUIT.FIRST;
			while (!CCCLINIICIRCUIT.EOF) {
				var r = 0,
					s = 0;
				//var x = X.SQL('select isnull(cccmtrlgen, 0) from cccconsumator where cccconsumator=' + CCCLINIICIRCUIT.CCCCONSUMATOR, null);
				r = CCCCONSUMATOR.LOCATE('CCCCONSUMATOR', CCCLINIICIRCUIT.CCCCONSUMATOR);
				if (r)
					if (CCCCONSUMATOR.CCCMTRLGEN)
						s = CCCARTGEN.LOCATE('CCCMTRLGEN', CCCCONSUMATOR.CCCMTRLGEN);
				if (r == 1 && s == 1) {
					l.APPEND;
					if (s == 1 && CCCARTGEN.MTRLSTOCABIL) {
						l.MTRL = CCCARTGEN.MTRLSTOCABIL;
					} else {
						l.MTRL = CCCCONSUMATOR.CCCMTRLGEN;
					}
					if (CCCLINIICIRCUIT.QTY)
						l.QTY1 = CCCLINIICIRCUIT.QTY;
					else
						l.QTY1 = 1;
					l.CCCMTRLGEN = CCCCONSUMATOR.CCCMTRLGEN;
					if (CCCLINIICIRCUIT.CCCSPECIALITATESF)
						l.CCCSPECIALITATESF = CCCLINIICIRCUIT.CCCSPECIALITATESF;
					if (CCCLINIICIRCUIT.CCCSF)
						l.CCCSF = CCCLINIICIRCUIT.CCCSF;
					if (CCCLINIICIRCUIT.CCCCOLECTIESF)
						l.CCCCOLECTIESF = CCCLINIICIRCUIT.CCCCOLECTIESF;
					if (CCCLINIICIRCUIT.CCCCOLECTIESF)
						l.CCCCOLECTIESF = CCCLINIICIRCUIT.CCCCOLECTIESF;
					if (CCCTABLOURI.CCCTABLOU)
						l.CCCTABLOURI = CCCTABLOURI.CCCTABLOU;
					if (CCCCIRCUIT.CCCCIRCUIT)
						l.CCCCIRCUIT = CCCCIRCUIT.CCCCIRCUIT;
					if (CCCLINIICIRCUIT.CCCCLADIRE)
						l.CCCCLADIRE = CCCLINIICIRCUIT.CCCCLADIRE;
					if (CCCLINIICIRCUIT.CCCPRIMARYSPACE)
						l.CCCPRIMARYSPACE = CCCLINIICIRCUIT.CCCPRIMARYSPACE;
					if (CCCLINIICIRCUIT.CCCSECONDARYSPACE)
						l.CCCSECONDARYSPACE = CCCLINIICIRCUIT.CCCSECONDARYSPACE;
					if (CCCLINIICIRCUIT.CCCINCAPERE)
						l.CCCINCAPERE = CCCLINIICIRCUIT.CCCINCAPERE;
					l.BOOL02 = 1;
					l.POST;
				} else {
					strErr += CCCLINIICIRCUIT.CCCCONSUMATOR_CCCCONSUMATOR_DENUMIRE + '\n';
				}
				CCCLINIICIRCUIT.NEXT;
			}

			if (strErr.length)
				X.WARNING('Urmatoarii consumatori nu au fost preluati (Nu au articol generic aferent?):\n' + strErr);

			var id = d.SHOWOBJFORM();
			if (id) {
				CCCCIRCUIT.DEVIZ = id;
				X.EXEC('button:Save');
			}

		} catch (e) {
			X.WARNING(e.message);
		} finally {
			dispose(d);
			var a = CCCTABLOURI.LOCATE('CCCTABLOU', locaSursa);
			var b = CCCCIRCUIT.LOCATE('CCCCIRCUIT', locaCircuit);
		}
	}

	if (cmd == 20220216) {
		if (X.ASK("Confirmare reactualizare", 'Doriti sa reactualizez TOATE materialele stocabile?') != 6)
			return;
		CCCARTGEN.FIRST;
		while (!CCCARTGEN.EOF) {
			replaceMtrlGen();
			CCCARTGEN.NEXT;
		}
	}

	if (cmd == 202008131) {
		replaceMtrlGen();
	}

	if (cmd == 20220706) {
		var query = 'delete from ccccircuit where ccccircuit in (select aa.ccccircuit from ' +
			'( ' +
			'select a.deviz, a.ccctablou, a.ccccircuit, a.denumire, b.cccliniicircuit ' +
			'from ccccircuit a ' +
			'left join cccliniicircuit b on (a.ccccircuit=b.ccccircuit and a.cccheader=b.cccheader) ' +
			'where a.cccheader=' + CCCHEADER.CCCHEADER + ' ' +
			'and a.ccctablou=' + CCCTABLOURI.CCCTABLOU + ' ' +
			') aa ' +
			'left join (select a.deviz fincode, a.ccctablou, a.ccccircuit, a.denumire, b.cccliniicircuit ' +
			'from ccccircuit a ' +
			'left join cccliniicircuit b on (a.ccccircuit=b.ccccircuit and a.cccheader=b.cccheader) ' +
			'where a.cccheader=' + CCCHEADER.CCCHEADER + ' ' +
			'and a.ccctablou=' + CCCTABLOURI.CCCTABLOU + ') bb ' +
			'on (aa.denumire=bb.denumire and aa.ccccircuit=bb.ccccircuit) ' +
			'where aa.cccliniicircuit is null ' +
			')';
		X.RUNSQL(query, null);
		X.DBLocate(CCCHEADER.CCCHEADER);
	}
}

function dispose(obj) {
	obj.FREE;
	obj = null;
}

function ON_CCCCONSUMATOR_ATRIBUT() {
	if (CCCTABLOURI.LOCATE('CCCCONSUMATOR', CCCCONSUMATOR.CCCCONSUMATOR) == 1) {
		CCCTABLOURI.DELETE;
	}
	if (CCCCONSUMATOR.ATRIBUT == 1) { //sursa
		if (CCCCONSUMATORGEO.CCCCLADIRE) {
			//var row = CCCCONSUMATOR.DENUMIRE;
			//X.EXEC('Button:Save');
			//CCCCONSUMATOR.LOCATE('DENUMIRE', row);
			CCCTABLOURI.APPEND;
			if (CCCCONSUMATOR.COD)
				CCCTABLOURI.COD = CCCCONSUMATOR.COD;
			if (CCCCONSUMATOR.DENUMIRE)
				CCCTABLOURI.DENUMIRE = CCCCONSUMATOR.DENUMIRE;
			if (CCCCONSUMATOR.QTY)
				CCCTABLOURI.QTY = CCCCONSUMATOR.QTY;
			if (CCCCONSUMATOR.CCCSPECIALITATESF)
				CCCTABLOURI.CCCSPECIALITATESF = CCCCONSUMATOR.CCCSPECIALITATESF;
			if (CCCCONSUMATOR.CCCSF)
				CCCTABLOURI.CCCSF = CCCCONSUMATOR.CCCSF;
			if (CCCCONSUMATOR.CCCCOLECTIESF)
				CCCTABLOURI.CCCCOLECTIESF = CCCCONSUMATOR.CCCCOLECTIESF;
			if (CCCCONSUMATORGEO.CCCCLADIRE)
				CCCTABLOURI.CCCCLADIRE = CCCCONSUMATORGEO.CCCCLADIRE;
			if (CCCCONSUMATORGEO.CCCPRIMARYSPACE)
				CCCTABLOURI.CCCPRIMARYSPACE = CCCCONSUMATORGEO.CCCPRIMARYSPACE;
			if (CCCCONSUMATORGEO.CCCSECONDARYSPACE)
				CCCTABLOURI.CCCSECONDARYSPACE = CCCCONSUMATORGEO.CCCSECONDARYSPACE;
			if (CCCCONSUMATORGEO.CCCINCAPERE)
				CCCTABLOURI.CCCINCAPERE = CCCCONSUMATORGEO.CCCINCAPERE;
			if (CCCCONSUMATOR.OBSERVATII)
				CCCTABLOURI.OBSERVATII = CCCCONSUMATOR.OBSERVATII;
			if (CCCCONSUMATOR.DATAADAUGARII)
				CCCTABLOURI.DATAADAUGARII = CCCCONSUMATOR.DATAADAUGARII;
			if (CCCCONSUMATOR.CCCCONSUMATOR)
				CCCTABLOURI.CCCCONSUMATOR = CCCCONSUMATOR.CCCCONSUMATOR;
			if (CCCCONSUMATOR.ATRIBUT)
				CCCTABLOURI.ATRIBUT = CCCCONSUMATOR.ATRIBUT;
			if (CCCCONSUMATOR.CCCMTRLGEN)
				CCCTABLOURI.CCCMTRLGEN = CCCCONSUMATOR.CCCMTRLGEN;
			CCCTABLOURI.POST;
		} else {
			CCCCONSUMATOR.ATRIBUT = null;
			X.WARNING('Creati geografia aferenta si apoi alegeti atributul "SURSA".');
		}

		X.WARNING('Detaliile complete ale sursei in pagina "Surse" se pot vizualiza DOAR dupa salvare.');
	}
}

function ON_CCCCONSUMATOR_BEFOREDELETE() {
	//daca face parte dintr-un circuit cu deviz, nu se poate sterge
	//caut in CCCLINIICIRCUIT < CCCCIRCUIT > CCCTABLOURI

	var q = 'select isnull(b.ccccircuit, 0) from ccccircuit b inner join ccctablouri a on (a.ccctablou=b.ccctablou) inner join cccliniicircuit c on ' +
		'(b.ccccircuit=c.ccccircuit) where (c.cccconsumator=' + CCCCONSUMATOR.CCCCONSUMATOR + ' or a.cccconsumator=' + CCCCONSUMATOR.CCCCONSUMATOR + ') and b.deviz is not null;',
		c = X.SQL(q, null);

	if (c) {
		X.EXCEPTION('Nu puteti sterge un consumator sau o sursa\ndaca a fost folosit intr-un document pe flux.\nVezi pagina "Documente"');
	}

	if (CCCTABLOURI.LOCATE('CCCCONSUMATOR', CCCCONSUMATOR.CCCCONSUMATOR) == 1) {
		X.EXCEPTION('Nu puteti sterge o sursa.\nSchimbati atributul.');
	}

	//sterge din articole generice:
	if (CCCCONSUMATOR.CCCMTRLGEN) {
		//are
		X.RUNSQL('delete from CCCARTGEN where cccmtrlgen=' + CCCCONSUMATOR.CCCMTRLGEN, null);
	}
}

function ON_CCCCONSUMATOR_DENUMIRE() {
	if (CCCCONSUMATOR.DENUMIRE) {
		//cauta articolul cu mtrl=cccmtrlgen
		X.RUNSQL('update mtrl set name=' + CCCCONSUMATOR.DENUMIRE + ' where mtrl=' + CCCCONSUMATOR.CCCMTRLGEN, null);
	}
}

function ON_LOCATE() {

	//CCCTABLOURI.SETREADONLY('DENUMIRE', 1);
	removeFilters();
	pasibileDeAFL.length = 0;

	if (CCCHEADER.CCCHEADER && 7 == 6) {
		var ds = X.GETSQLDATASET('select ccctablou from ccctablouri where isnull(cccconsumator, 0) <= 0 and cccheader=' + CCCHEADER.CCCHEADER, null);
		if (ds && ds.RECORDCOUNT) {
			CCCCONSUR.FIRST;
			while (!CCCCONSUR.EOF) {
				CCCCONSUR.DELETE;
			}
			ds.FIRST;
			while (!ds.EOF) {
				CCCCONSUR.APPEND;
				CCCCONSUR.CCCTABLOU = ds.ccctablou;
				CCCCONSUR.POST;
				ds.NEXT;
			}
			X.OPENSUBFORM('SFCONSUR');
		}
	}

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

function ON_SFCONSUR_ACCEPT() {}

function ON_CCCHEADER_F1() {
	applyFilters('CCCCLADIRE', CCCHEADER.F1);
}

function ON_CCCHEADER_F2() {
	applyFilters('CCCPRIMARYSPACE', CCCHEADER.F2);
}

function ON_CCCHEADER_F3() {
	applyFilters('CCCSECONDARYSPACE', CCCHEADER.F3);
}

function ON_CCCHEADER_F4() {
	applyFilters('CCCINCAPERE', CCCHEADER.F4);
}

function ON_CCCHEADER_F5() {
	applyFilters('CCCSPECIALITATESF', CCCHEADER.F5);
}

function ON_CCCHEADER_F6() {
	applyFilters('CCCSF', CCCHEADER.F6);
}

function ON_CCCHEADER_F7() {
	applyFilters('CCCCOLECTIESF', CCCHEADER.F7);
}

function ON_CCCHEADER_F8() {
	applyFilters('DENUMIRE', CCCHEADER.F8);
}

function applyFilters() {
	//debugger;
	//citeste tot ce a ramas si aplica
	var vFilterC = '',
		vFilterLC = '',
		filters = [{
			camp: 'CCCCLADIRE',
			val: CCCHEADER.F1
		}, {
			camp: 'CCCPRIMARYSPACE',
			val: CCCHEADER.F2
		}, {
			camp: 'CCCSECONDARYSPACE',
			val: CCCHEADER.F3
		}, {
			camp: 'CCCINCAPERE',
			val: CCCHEADER.F4
		}, {
			camp: 'CCCSPECIALITATESF',
			val: CCCHEADER.F5
		}, {
			camp: 'CCCSF',
			val: CCCHEADER.F6
		}, {
			camp: 'CCCCOLECTIESF',
			val: CCCHEADER.F7
		}, {
			camp: 'DENUMIRE',
			val: CCCHEADER.F8
		}];
	for (var i = 0; i < filters.length; i++) {
		if (filters[i].val) {
			if (filters[i].camp != 'DENUMIRE') {
				vFilterC += vFilterC ? " AND {x1x2x3x4x5." + filters[i].camp + "}= " + filters[i].val : "{x1x2x3x4x5." + filters[i].camp + "}= " + filters[i].val;
				vFilterLC += vFilterLC ? " AND {x1x2x3x4x5." + filters[i].camp + "}= " + filters[i].val : "{x1x2x3x4x5." + filters[i].camp + "}= " + filters[i].val;
			} else {
				vFilterC += vFilterC ? " AND {x1x2x3x4x5." + filters[i].camp + "} LIKE '" + filters[i].val + "'" : "{x1x2x3x4x5." + filters[i].camp + "} LIKE '" + filters[i].val + "'";
			}
		}
	}
	if (vFilterC) {
		CCCCONSUMATOR.FILTER = replInFilter(vFilterC, "CCCCONSUMATOR");
		CCCCONSUMATOR.FILTERED = 1;
	} else {
		showAllButMarunt();
	}

	if (vFilterLC) {
		CCCLINIICIRCUIT.FILTER = replInFilter(vFilterLC, "CCCLINIICIRCUIT");
		CCCLINIICIRCUIT.FILTERED = 1;
	} else {
		CCCLINIICIRCUIT.FILTERED = 0;
	}

}

function replInFilter(vFilter, withWhat) {
	return '(' + vFilter.replace(/x1x2x3x4x5/g, withWhat) + ')';
}

function ON_SFFILTRE_SHOW() {
	itsMeSF = true;
	//removeFilters();
}

function ON_SFFILTRE_ACCEPT() {
	CCCTABLOURI.LOCATE('CCCTABLOU', oldPosition);
	oldPosition = 1;
	CCCCONSUMATOR.FIRST;
	while (!CCCCONSUMATOR.EOF) {
		CCCLINIICIRCUIT.APPEND;
		CCCLINIICIRCUIT.CCCCONSUMATOR = CCCCONSUMATOR.CCCCONSUMATOR;
		if (CCCCONSUMATOR.QTY)
			CCCLINIICIRCUIT.QTY = CCCCONSUMATOR.QTY;
		if (CCCCONSUMATOR.CCCCLADIRE)
			CCCLINIICIRCUIT.CCCCLADIRE = CCCCONSUMATOR.CCCCLADIRE;
		if (CCCCONSUMATOR.CCCPRIMARYSPACE)
			CCCLINIICIRCUIT.CCCPRIMARYSPACE = CCCCONSUMATOR.CCCPRIMARYSPACE;
		if (CCCCONSUMATOR.CCCSECONDARYSPACE)
			CCCLINIICIRCUIT.CCCSECONDARYSPACE = CCCCONSUMATOR.CCCSECONDARYSPACE;
		if (CCCCONSUMATOR.CCCINCAPERE)
			CCCLINIICIRCUIT.CCCINCAPERE = CCCCONSUMATOR.CCCINCAPERE;
		if (CCCCONSUMATOR.CCCSPECIALITATESF)
			CCCLINIICIRCUIT.CCCSPECIALITATESF = CCCCONSUMATOR.CCCSPECIALITATESF;
		if (CCCCONSUMATOR.CCCSF)
			CCCLINIICIRCUIT.CCCSF = CCCCONSUMATOR.CCCSF;
		if (CCCCONSUMATOR.CCCCOLECTIESF)
			CCCLINIICIRCUIT.CCCCOLECTIESF = CCCCONSUMATOR.CCCCOLECTIESF;
		//CCCLINIICIRCUIT.QTY = CCCCONSUMATOR.QTY;
		CCCLINIICIRCUIT.POST;
		CCCCONSUMATOR.NEXT;
	}

	//removeFilters();
	itsMeSF = false;
}

function ON_SFFILTRE_CANCEL() {
	//removeFilters();
	itsMeSF = false;
}

function removeFilters() {
	showAllButMarunt();
	CCCCIRCUIT.FILTERED = 0;
	CCCLINIICIRCUIT.FILTERED = 0;

	if (CCCHEADER.F1)
		CCCHEADER.F1 = null;
	if (CCCHEADER.F2)
		CCCHEADER.F2 = null;
	if (CCCHEADER.F3)
		CCCHEADER.F3 = null;
	if (CCCHEADER.F4)
		CCCHEADER.F4 = null;
	if (CCCHEADER.F5)
		CCCHEADER.F5 = null;
	if (CCCHEADER.F6)
		CCCHEADER.F6 = null;
	if (CCCHEADER.F7)
		CCCHEADER.F7 = null;
	if (CCCHEADER.F8)
		CCCHEADER.F8 = null;
}

function ON_CCCLINIICIRCUIT_QTY() {
	var q = 'select isnull(qty, 0) from cccliniicircuit where cccheader=' + CCCHEADER.CCCHEADER +
		' and ccccircuit=' + CCCLINIICIRCUIT.CCCCIRCUIT + ' and cccconsumator=' + CCCLINIICIRCUIT.CCCCONSUMATOR,
		qty = X.SQL(q, null);
	if (areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT) && CCCLINIICIRCUIT.QTY < qty) {
		//X.EXCEPTION('Exista deviz pe flux, cantitatea se poate doar mari, deocamdata.');
	}
}

function ON_CCCLINIICIRCUIT_CCCCLADIRE() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_CCCPRIMARYSPACE() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_CCCSECONDARYSPACE() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_CCCINCAPERE() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_CCCSPECIALITATESF() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_CCCSF() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_CCCCOLECTIESF() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function ON_CCCLINIICIRCUIT_ATRIBUT() {
	//daca are deviz in spate, pa schimbare
	if (areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Exista deviz pe flux, nu se pot schimba parametrii consumatorului.');
	}
}

function areDeviz(c) {
	if (!c)
		return;
	var q = 'select deviz from ccccircuit where cccheader=' + CCCHEADER.CCCHEADER + ' and ccccircuit=' + c,
		d = X.SQL(q, null);
	if (d) {
		return true;
	} else {
		return false;
	}
}

function ON_CCCLINIICIRCUIT_CCCCONSUMATOR() {
	//daca are deviz in spate, pa schimbare
	if (!itsNew && areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Exista deviz pe flux, nu se pot schimba consumatorii.');
	}

	if (CCCLINIICIRCUIT.CCCCONSUMATOR)
		X.OPENSUBFORM('SFCONLOC');
}

function ON_SFCONLOC_ACCEPT() {
	if (CCCLINIICIRCUIT.CCCCONSUMATOR) {
		if (CCCCONLOC.CANT)
			CCCLINIICIRCUIT.QTY = CCCCONLOC.CANT;
		if (CCCCONLOC.CCCCLADIRE)
			CCCLINIICIRCUIT.CCCCLADIRE = CCCCONLOC.CCCCLADIRE;
		if (CCCCONLOC.CCCPRIMARYSPACE)
			CCCLINIICIRCUIT.CCCPRIMARYSPACE = CCCCONLOC.CCCPRIMARYSPACE;
		if (CCCCONLOC.CCCSECONDARYSPACE)
			CCCLINIICIRCUIT.CCCSECONDARYSPACE = CCCCONLOC.CCCSECONDARYSPACE;
		if (CCCCONLOC.CCCINCAPERE)
			CCCLINIICIRCUIT.CCCINCAPERE = CCCCONLOC.CCCINCAPERE;
		if (CCCCONLOC.SSF)
			CCCLINIICIRCUIT.CCCSPECIALITATESF = CCCCONLOC.SSF;
		if (CCCCONLOC.SF)
			CCCLINIICIRCUIT.CCCSF = CCCCONLOC.SF;
		if (CCCCONLOC.CSF)
			CCCLINIICIRCUIT.CCCCOLECTIESF = CCCCONLOC.CSF;
		CCCLINIICIRCUIT.POST;
	}
}

function ON_SFCONLOC_SHOW() {
	CCCCONLOC.FIRST;
	while (!CCCCONLOC.EOF) {
		CCCCONLOC.DELETE;
	}

	var id = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID,
		q = 'SELECT AA.CCCCONSUMATOR, AA.DENUMIRE CONSUMATOR, BB.QTY CANT, ' +
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
		'WHERE AA.CCCHEADER = ' + id + ' AND AA.CCCCONSUMATOR=' + CCCLINIICIRCUIT.CCCCONSUMATOR,
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

function ON_CCCLINIICIRCUIT_BEFOREDELETE() {
	if (areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT)) {
		//X.EXCEPTION('Nu se poate sterge, are deviz pe flux.');
	}
}

function ON_CCCLINIICIRCUIT_POST() {
	debugger;
	itsNew = false;
	if (areDeviz(CCCLINIICIRCUIT.CCCCIRCUIT) && !arrEgzista(pasibileDeAFL, CCCLINIICIRCUIT.CCCCIRCUIT)) {
		pasibileDeAFL.push(CCCLINIICIRCUIT.CCCCIRCUIT);
	}
}

function arrEgzista(arr, newEntry) {
	var egzista = false;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] = newEntry) {
			egzista = true;
			break;
		}
	}

	return egzista;
}

function creazaTrasee() {
	var i = 1,
		j = 1;
	CCCTRASEEGEO.FIRST;
	while (!CCCTRASEEGEO.EOF) {
		CCCTRASEEGEO.DELETE;
	}

	i = 1,
		j = 1,
		k = 1,
		l = 1;
	CCCCLADIRE.DISABLECONTROLS;
	CCCPRIMARYSPACE.DISABLECONTROLS;
	CCCSECONDARYSPACE.DISABLECONTROLS;
	CCCINCAPERE.DISABLECONTROLS;
	CCCCLADIRE.FIRST;
	while (!CCCCLADIRE.EOF) {
		//X.PROCESSMESSAGES;
		CCCPRIMARYSPACE.FIRST;
		while (!CCCPRIMARYSPACE.EOF) {
			//X.PROCESSMESSAGES;
			CCCSECONDARYSPACE.FIRST;
			while (!CCCSECONDARYSPACE.EOF) {
				//X.PROCESSMESSAGES;
				CCCINCAPERE.FIRST;
				while (!CCCINCAPERE.EOF) {
					//X.PROCESSMESSAGES;
					X.SETPROPERTY('PANEL', 'pTrasee', 'CAPTION', i + '/' + j + '/' + k + '/' + l);
					CCCTRASEEGEO.APPEND;
					CCCTRASEEGEO.DENUMIRE = CCCCLADIRE.DENUMIRE + '/' + CCCPRIMARYSPACE.DENUMIRE + '/' + CCCSECONDARYSPACE.DENUMIRE + '/' + CCCINCAPERE.DENUMIRE;
					CCCTRASEEGEO.CCCCLADIRE = CCCCLADIRE.CCCCLADIRE;
					CCCTRASEEGEO.CCCPRIMARYSPACE = CCCPRIMARYSPACE.CCCPRIMARYSPACE;
					CCCTRASEEGEO.CCCSECONDARYSPACE = CCCSECONDARYSPACE.CCCSECONDARYSPACE;
					CCCTRASEEGEO.CCCINCAPERE = CCCINCAPERE.CCCINCAPERE;
					CCCTRASEEGEO.CCCHEADER = CCCHEADER.CCCHEADER;
					CCCTRASEEGEO.PRJC = CCCHEADER.PRJC;
					CCCTRASEEGEO.ISACTIVE = 1;
					CCCTRASEEGEO.POST;
					l++;
					CCCINCAPERE.NEXT;
				}
				k++;
				CCCSECONDARYSPACE.NEXT;
			}
			j++;
			CCCPRIMARYSPACE.NEXT;
		}
		i++;
		CCCCLADIRE.NEXT;
	}

	CCCCLADIRE.ENABLECONTROLS;
	CCCPRIMARYSPACE.ENABLECONTROLS;
	CCCSECONDARYSPACE.ENABLECONTROLS;
	CCCINCAPERE.ENABLECONTROLS;

	X.EXEC('button:Save');
}

function creazaTraseeEl() {
	var curSursa = CCCTABLOURI.CCCTABLOU,
		curCircuit = CCCCIRCUIT.CCCCIRCUIT,
		curLiniCircuit = CCCLINIICIRCUIT.CCCLINIICIRCUIT,
		i = 1,
		j = 1,
		k = 1;

	CCCTRASEEGEL.FIRST;
	while (!CCCTRASEEGEL.EOF) {
		CCCTRASEEGEL.DELETE;
	}

	CCCTABLOURI.FIRST;
	while (!CCCTABLOURI.EOF) {
		X.PROCESSMESSAGES;

		CCCCIRCUIT.FIRST;
		while (!CCCCIRCUIT.EOF) {
			X.PROCESSMESSAGES;

			CCCLINIICIRCUIT.FIRST;
			while (!CCCLINIICIRCUIT.EOF) {
				X.SETPROPERTY('PANEL', 'pTraseeEl', 'CAPTION', i + '/' + j + '/' + k);
				X.PROCESSMESSAGES;
				CCCTRASEEGEL.APPEND;
				CCCTRASEEGEL.DENUMIRE = CCCTABLOURI.DENUMIRE + '/' + CCCCIRCUIT.DENUMIRE + '/' + CCCLINIICIRCUIT.CCCCONSUMATOR_CCCCONSUMATOR_DENUMIRE;
				CCCTRASEEGEL.SURSA = CCCTABLOURI.CCCTABLOU;
				CCCTRASEEGEL.CIRCUIT = CCCCIRCUIT.CCCCIRCUIT;
				CCCTRASEEGEL.CONSUMATOR = CCCLINIICIRCUIT.CCCCONSUMATOR;
				CCCTRASEEGEL.CCCHEADER = CCCHEADER.CCCHEADER;
				CCCTRASEEGEL.PRJC = CCCHEADER.PRJC;
				CCCTRASEEGEL.ISACTIVE = 1;
				CCCTRASEEGEL.POST;
				k++;
				CCCLINIICIRCUIT.NEXT;
			}

			j++;
			CCCCIRCUIT.NEXT;
		}
		i++;
		CCCTABLOURI.NEXT;
	}

	X.EXEC('button:Save');
}

function fillLstTablouri() {
	var lstTabl = X.GETSQLDATASET('select t.ccctablou, t.denumire, t.dataadaugarii, t.isactive, t.cccmtrlgen, t.cccconsumator, m.code, m.name, m.insdate, u.name usr ' +
		'from ccctablouri t ' +
		'left join mtrl m on (m.mtrl=t.cccmtrlgen and t.prjc=m.cccprjc and m.cccheader=t.cccheader) ' +
		'left join users u on (u.users=m.insuser) ' +
		'left join cccartgen a on (a.cccmtrlgen=t.cccmtrlgen and a.prjc=t.prjc and a.cccheader=t.cccheader) ' +
		'left join mtrl ma on (ma.mtrl=a.mtrlstocabil and ma.cccprjc=a.prjc and ma.cccheader=a.cccheader) ' +
		'where t.cccheader=' + CCCHEADER.CCCHEADER, null);

	listaTablouri = [];
	lstTabl.FIRST;
	while (!lstTabl.eof) {
		var tbl = {};
		tbl.ccctablou = lstTabl.ccctablou;
		tbl.denumire = lstTabl.denumire;
		tbl.dataadaugarii = lstTabl.dataadaugarii;
		tbl.isactive = lstTabl.isactive;
		tbl.cccmtrlgen = lstTabl.cccmtrlgen;
		tbl.cccconsumator = lstTabl.cccconsumator;
		tbl.codAG = lstTabl.code;
		tbl.numeAG = lstTabl.name;
		tbl.insdateAG = lstTabl.insdate;
		tbl.usrAG = lstTabl.usr;
		listaTablouri.push(tbl);
		lstTabl.NEXT;
	}

	return listaTablouri;
}

function fillLstConsum() {
	var lstConsum = X.GETSQLDATASET('select t.cccconsumator, t.denumire, t.dataadaugarii, t.isactive, t.cccmtrlgen, m.code, m.name, m.insdate, u.name usr ' +
		'from cccconsumator t ' +
		'left join mtrl m on (m.mtrl=t.cccmtrlgen and t.prjc=m.cccprjc and m.cccheader=t.cccheader) ' +
		'left join users u on (u.users=m.insuser) ' +
		'left join cccartgen a on (a.cccmtrlgen=t.cccmtrlgen and a.prjc=t.prjc and a.cccheader=t.cccheader) ' +
		'left join mtrl ma on (ma.mtrl=a.mtrlstocabil and ma.cccprjc=a.prjc and ma.cccheader=a.cccheader) ' +
		'where t.cccheader=' + CCCHEADER.CCCHEADER, null);

	listaConsumatori = [];
	lstConsum.FIRST;
	while (!lstConsum.eof) {
		var c = {};
		c.cccconsumator = lstConsum.cccconsumator;
		c.denumire = lstConsum.denumire;
		c.dataadaugarii = lstConsum.dataadaugarii;
		c.isactive = lstConsum.isactive;
		c.cccmtrlgen = lstConsum.cccmtrlgen;
		c.codAG = lstConsum.code;
		c.numeAG = lstConsum.name;
		c.insdateAG = lstConsum.insdate;
		c.usrAG = lstConsum.usr;
		listaConsumatori.push(c);
		lstConsum.NEXT;
	}

	return listaConsumatori;
}

function parseDSConsumatori(listaConsumatoriExistenti) {
	CCCCONSUMATOR.FIRST;
	while (!CCCCONSUMATOR.EOF) {
		if (!CCCCONSUMATOR.CCCMTRLGEN) {
			//denumire consumator unica
			//debugger;
			if (!consumatorExistent(listaConsumatoriExistenti, CCCCONSUMATOR.DENUMIRE)) {
				var mtrl = createAndOrLinkGeneric(CCCCONSUMATOR.DENUMIRE, CCCCONSUMATOR, 'CCCCONSUMATOR', CCCCONSUMATOR.CCCCONSUMATOR);
				if (mtrl) {
					CCCARTGEN.APPEND;
					CCCARTGEN.CCCMTRLGEN = mtrl;
					CCCARTGEN.POST;

					if (CCCTABLOURI.LOCATE('DENUMIRE', CCCCONSUMATOR.DENUMIRE)) {
						CCCTABLOURI.CCCMTRLGEN = mtrl;
						CCCTABLOURI.POST;
					}
				}
			} else {
				showAllButMarunt();
				CCCCONSUMATOR.LOCATE('DENUMIRE', CCCCONSUMATOR.DENUMIRE);
				X.EXCEPTION(CCCCONSUMATOR.DENUMIRE + '. Denumirea acestui consumator exista.\nFolositi alta denumire sau revizuiti abordarea.');
			}
		}

		CCCCONSUMATOR.NEXT;
	}
}

function parseDSTablouri(listaTablouriExistente) {
	CCCTABLOURI.FIRST;
	while (!CCCTABLOURI.EOF) {
		if (!CCCTABLOURI.CCCMTRLGEN) {
			//denumire consumator unica
			if (!consumatorExistent(listaTablouriExistente, CCCTABLOURI.DENUMIRE)) {
				var mtrl = createAndOrLinkGeneric(CCCTABLOURI.DENUMIRE, CCCTABLOURI, 'CCCTABLOU', CCCTABLOURI.CCCTABLOU);
				if (mtrl) {
					CCCARTGEN.APPEND;
					CCCARTGEN.CCCMTRLGEN = mtrl;
					CCCARTGEN.POST;
					CCCCONSUMATOR.CCCMTRLGEN = mtrl;
					CCCCONSUMATOR.POST;
				}
			} else {
				showAllButMarunt();
				CCCTABLOURI.LOCATE('DENUMIRE', CCCTABLOURI.DENUMIRE);
				X.EXCEPTION(CCCTABLOURI.DENUMIRE + '. Denumirea acestei surse exista.\nFolositi alta denumire sau revizuiti abordarea.');
			}
		}
		CCCTABLOURI.NEXT;
	}
}

function createDefaultGenerics() {
	//AUTODIAG, todos: 1. check duplicates in cccartgen;
	//??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????

	//compara consumatorii nou adaugati cu lista celor deja adaugati.
	//daca cei nou adaugati folosesc aceasi denumire cu cei deja introdusi X.EXCEPTION
	var listaTablouriExistente = fillLstTablouri(),
		listaConsumatoriExistenti = fillLstConsum();

	//lista consumatori nou introdusi
	CCCCONSUMATOR.FILTER = "({CCCCONSUMATOR.CCCCONSUMATOR}<0 AND " + filterConsumator + ")";
	CCCCONSUMATOR.FILTERED = 1;
	parseDSConsumatori(listaConsumatoriExistenti);
	showAllButMarunt(listaConsumatoriExistenti);

	//lista consumatori "scapati" fara articol generic aferent
	CCCCONSUMATOR.FILTER = "({CCCCONSUMATOR.CCCMTRLGEN} IS NULL AND " + filterConsumator + ")";
	CCCCONSUMATOR.FILTERED = 1;
	parseDSConsumatori(listaConsumatoriExistenti);
	showAllButMarunt();

	//toti consumatorii a caror articole generice nu apar in tabela cod proiect/stocabil
	CCCCONSUMATOR.FIRST;
	while (!CCCCONSUMATOR.EOF) {
		if (!CCCARTGEN.LOCATE('CCCMTRLGEN', CCCCONSUMATOR.CCCMTRLGEN)) {
			CCCARTGEN.APPEND;
			CCCARTGEN.CCCMTRLGEN = CCCCONSUMATOR.CCCMTRLGEN;
			CCCARTGEN.POST;
		}
		CCCCONSUMATOR.NEXT;
	}

	//lista surse nou introduse
	CCCTABLOURI.FILTER = "({CCCTABLOURI.CCCTABLOU}<0 AND " + filterTablou + ")";
	CCCTABLOURI.FILTERED = 1;
	parseDSTablouri(listaTablouriExistente);
	showAllButMarunt();

	CCCTABLOURI.FILTER = "({CCCTABLOURI.CCCMTRLGEN} IS NULL AND " + filterTablou + ")";
	CCCTABLOURI.FILTERED = 1;
	parseDSTablouri(listaTablouriExistente);
	showAllButMarunt();

	//CREARE  AFL: daca pasibileDeAFL are ceva intr-ansa, verifica daca acel circuit este legat de vreun diviz (CCCCIRCUIT.DEVIZ).
	//Daca da, AFL, daca nu... mi se rumpe.
	//Daca DA: compara ce diferentele dintre anterior (uita-te in baza de date) si ce se doreste a fi salvat.
	//DIferentele/fiecare circuit => afl per sursa/circuit
	//debugger;

	if (pasibileDeAFL && pasibileDeAFL.length) {
		//are ceva
		/*
        for (var i = 0; i < pasibileDeAFL.length; i++) {
            if (areDeviz(pasibileDeAFL[i])) {
                //verifica diferente circuit (cantitate la existente si consumatori noi):
                var q = 'select CCCCONSUMATOR, QTY, CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE from cccliniicircuit where ccccircuit=' + pasibileDeAFL[i],
                ante = X.GETSQLDATASET(q, null);
                //compara cu ce urmeaza a fi salvat; nu se poate sterge din consumatorii cu deviz, nu se pot inlocui, nu li se pot modifica parametrii,
                //ramane doar modif cantitate sau linii noi

                CCCLINIICIRCUIT.FIRST;
                var liniiAFL = [];
                while (!CCCLINIICIRCUIT.EOF) {
                    if (ante.LOCATE('CCCCONSUMATOR;CCCCLADIRE;CCCPRIMARYSPACE;CCCSECONDARYSPACE;CCCINCAPERE', CCCLINIICIRCUIT.CCCCONSUMATOR, CCCLINIICIRCUIT.CCCCLADIRE, CCCLINIICIRCUIT.CCCPRIMARYSPACE, CCCLINIICIRCUIT.CCCSECONDARYSPACE, CCCLINIICIRCUIT.CCCINCAPERE)) {
                        //verif cant
                        if (CCCLINIICIRCUIT.QTY > ante.QTY) {
                            //AFL cu diferenta
                            var dif = CCCLINIICIRCUIT.QTY - ante.QTY;
                            insertAFLLine(liniiAFL, dif);
                        }
                    } else {
                        //linie noua, AFL cu consumator nou si cantitate
                        insertAFLLine(liniiAFL, CCCLINIICIRCUIT.QTY);
                    }
                    CCCLINIICIRCUIT.NEXT;
                }
                if (liniiAFL.length > 0) {
                    createAFL(liniiAFL);
                }
            }
        }
		*/
		X.WARNING('Creati AFL/Variatii FL corespunzator pe flux!.');

		pasibileDeAFL.length = 0;
	}
}

function ON_POST() {
	createDefaultGenerics();
	creareComboMaterialMarunt('MATERIAL MARUNT');
	protectieDublare();
}

function protectieDublare() {
	if (CCCHEADER.CCCHEADER < 0 && CCCHEADER.PRJC) {
		var se = X.SQL("select coalesce(denumire, '')from cccheader where prjc = " + CCCHEADER.PRJC, null);
		if (se) {
			X.WARNING('Mai exista o schema electrica: ' + se + '\nLa re vedere');
			X.CANCELEDITS;
		}
	}
}

function ON_AFTERPOST() {
	if (CCCHEADER.CCCHEADER)
		X.DBLocate(CCCHEADER.CCCHEADER);
}

function insertGeoMM(tabel, oFK, oDenumire, oObs) {
	var schema = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID,
		val = checkObjEmpty(oFK) ? "" : oFK.val + ",",
		col = checkObjEmpty(oFK) ? "" : oFK.col + ",",
		ret = "if not exists " +
		" (select 1 from " + tabel + " where prjc=" + CCCHEADER.PRJC + " and cccheader=" + schema + " and " + oDenumire.col + "='" + oDenumire.val + "')" +
		" begin" +
		" insert into " + tabel +
		" (" + col + "prjc, cccheader," + oDenumire.col + ", " + oObs.col + ")" +
		" values (" + val + CCCHEADER.PRJC + "," + schema + ",'" + oDenumire.val + "','" + oObs.val + "')" +
		" end;";

	return ret;
}

function SelLongShit(tabel, mm, hasAlias) {
	var schema = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID,
		alias = hasAlias ? " as " + tabel : "";
	return "(select " + tabel + " from " + tabel + " where prjc = " + CCCHEADER.PRJC + " and cccheader = " + schema +
		" and denumire = '" + mm + "')" + alias;
}

function SelShortShit(tabel, mm) {
	return "(select " + tabel + " from " + tabel + " where name = '" + mm + "') as " + tabel;
}

function insertSFMM(tabel, oFK, oDenumire, oObs) {
	var val = checkObjEmpty(oFK) ? "" : oFK.val + ",",
		col = checkObjEmpty(oFK) ? "" : oFK.col + ",",
		ret = "if not exists " +
		" (select 1 from " + tabel + " where " + oDenumire.col + "='" + oDenumire.val + "')" +
		" begin" +
		" insert into " + tabel +
		" (" + col + oDenumire.col + ", " + oObs.col + ")" +
		" values (" + val + "'" + oDenumire.val + "','" + oObs.val + "')" +
		" end;";

	return ret;
}

function checkObjEmpty(obj) {
	if (obj === null || obj === 'undefined' || (Object.keys(obj).length === 0 && obj.constructor === Object))
		return true;
	else
		return false;
}

function creareComboMaterialMarunt(mm) {
	var schema = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID,
		//cladire, spatiu prim., sp. sec., incapere
		//specialitate sf, sf, colectie sf
		//consumator, sursa, circuit
		t1 = 'BEGIN TRANSACTION [Tran1] ' +
		'BEGIN TRY ',
		t2 = 'COMMIT TRANSACTION [Tran1] ' +
		'END TRY ' +
		'BEGIN CATCH ' +
		'IF @@TRANCOUNT > 0 ' +
		'ROLLBACK TRANSACTION [Tran1] ' +
		'END CATCH ',
		c = insertGeoMM('ccccladire', null, {
			col: 'denumire',
			val: mm
		}, {
			col: 'observatii',
			val: 'Creat automat, a nu se sterge.'
		}),
		ps = insertGeoMM('cccprimaryspace', {
			col: 'ccccladire',
			val: "(select ccccladire from ccccladire where prjc = " + CCCHEADER.PRJC + " and cccheader = " + schema + " and denumire = '" + mm + "')"
		}, {
			col: 'denumire',
			val: mm
		}, {
			col: 'observatii',
			val: 'Creat automat, a nu se sterge.'
		}),
		ss = insertGeoMM('cccsecondaryspace', {
			col: 'cccprimaryspace',
			val: "(select cccprimaryspace from cccprimaryspace where prjc = " + CCCHEADER.PRJC + " and cccheader = " + schema + " and denumire = '" + mm + "')"
		}, {
			col: 'denumire',
			val: mm
		}, {
			col: 'observatii',
			val: 'Creat automat, a nu se sterge.'
		}),
		i = insertGeoMM('cccincapere', {
			col: 'cccsecondaryspace',
			val: "(select cccsecondaryspace from cccsecondaryspace where prjc = " + CCCHEADER.PRJC + " and cccheader = " + schema + " and denumire = '" + mm + "')"
		}, {
			col: 'denumire',
			val: mm
		}, {
			col: 'observatii',
			val: 'Creat automat, a nu se sterge.'
		}),
		ssf = insertSFMM('cccspecialitatesf', null, {
			col: 'name',
			val: mm
		}, {
			col: 'remarks',
			val: 'Creat automat, a nu se sterge.'
		}),
		sf = insertSFMM('cccsf', {
			col: 'cccspecialitatesf',
			val: "(select cccspecialitatesf from cccspecialitatesf where name = '" + mm + "')"
		}, {
			col: 'name',
			val: mm
		}, {
			col: 'remarks',
			val: 'Creat automat, a nu se sterge.'
		}),
		csf = insertSFMM('ccccolectiesf', {
			col: 'cccsf',
			val: "(select cccsf from cccsf where name = '" + mm + "')"
		}, {
			col: 'name',
			val: mm
		}, {
			col: 'remarks',
			val: 'Creat automat, a nu se sterge.'
		});
	t = t1 + c + ps + ss + i + ssf + sf + csf + t2;

	X.RUNSQL(t, null);

	var m = X.SQL(" select mtrl from mtrl where cccprjc = " + CCCHEADER.PRJC + " and cccheader = " + schema + " and name = '" + mm + " (M.G.I.)'", null),
		mS = X.SQL(" select mtrl from mtrl where cccprjc = " + CCCHEADER.PRJC + " and cccheader = " + schema + " and name = '" + mm + " (AUX sursa material marunt) (M.G.I.)'", null),
		ag = m ? m : createAndOrLinkGeneric(mm, null, null, null, 1),
		agS = mS ? mS : createAndOrLinkGeneric(mm + ' (AUX sursa material marunt)'),
		ds = X.GETSQLDATASET(" select " + SelLongShit('ccccladire', mm, true) + "," + SelLongShit('cccprimaryspace', mm, true) + "," + SelLongShit('cccsecondaryspace', mm, true) + "," +
			SelLongShit('cccincapere', mm, true) + "," + SelShortShit('cccspecialitatesf', mm) + "," + SelShortShit('cccsf', mm) + "," + SelShortShit('ccccolectiesf', mm), null),
		co = insertConsumatorMM("cccconsumator", ag, mm, 2, ds),
		cosu = insertConsumatorMM("cccconsumator", agS, mm + ' (AUX sursa material marunt)', 2, ds),
		su = insertSursaMM("ccctablouri", ag, mm, 1, ds),
		ci = '';

	t = co + cosu + su + ci;
	X.RUNSQL(t, null);
}

function insertConsumatorMM(tabel, mtrlgen, denumire, atribut, ds) {
	var schema = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID;
	return " if not exists (select 1 from " + tabel + " where prjc=" + CCCHEADER.PRJC + " and cccheader=" + schema + " and denumire = '" + denumire + "') begin insert into " + tabel +
		"(cod, denumire, qty, atribut, observatii, " +
		" cccspecialitatesf, cccsf, ccccolectiesf, " +
		"ccccladire, cccprimaryspace, cccsecondaryspace, cccincapere, " +
		"dataadaugarii, prjc, cccheader, cccmtrlgen)" +
		"values('MM', '" + denumire + "', 1, " + atribut + ", 'Creat automat, a nu se sterge.', " +
		ds.cccspecialitatesf + ", " + ds.cccsf + ", " + ds.ccccolectiesf + ", " +
		ds.ccccladire + ", " + ds.cccprimaryspace + ", " + ds.cccsecondaryspace + ", " + ds.cccincapere +
		", '" + X.FORMATDATE('YYYYMMDD ', X.SYS.LOGINDATE) + "', " + CCCHEADER.PRJC + ", " + schema + ", " + mtrlgen + ") end;";
}

function insertSursaMM(tabel, mtrlgen, denumire, atribut, ds) {
	var schema = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID;
	return " if not exists (select 1 from " + tabel + " where prjc=" + CCCHEADER.PRJC + " and cccheader=" + schema + " and denumire = '" + denumire + "') begin insert into " + tabel +
		"(cod, denumire, qty, atribut, observatii, " +
		" cccspecialitatesf, cccsf, ccccolectiesf, " +
		"ccccladire, cccprimaryspace, cccsecondaryspace, cccincapere, " +
		"dataadaugarii, prjc, cccheader, cccmtrlgen, cccconsumator)" +
		"values('MM', '" + denumire + "', 1, " + atribut + ", 'Creat automat, a nu se sterge.', " +
		ds.cccspecialitatesf + ", " + ds.cccsf + ", " + ds.ccccolectiesf + ", " +
		ds.ccccladire + ", " + ds.cccprimaryspace + ", " + ds.cccsecondaryspace + ", " + ds.cccincapere +
		", '" + X.FORMATDATE('YYYYMMDD ', X.SYS.LOGINDATE) + "', " + CCCHEADER.PRJC + ", " + schema + ", " + mtrlgen + ", " +
		SelLongShit('cccconsumator', denumire + ' (AUX sursa material marunt)', false) + ') end;';
}

function insertAFLLine(arr, qty) {
	//linia curenta a CCCLINIICIRCUIT cu qty drept cantitate
	var o = {};
	o.CCCCONSUMATOR = CCCLINIICIRCUIT.CCCCONSUMATOR;
	o.CCCMTRLGEN = CCCLINIICIRCUIT.CCCMTRLGEN;
	o.CCCSPECIALITATESF = CCCLINIICIRCUIT.CCCSPECIALITATESF;
	o.CCCSF = CCCLINIICIRCUIT.CCCSF;
	o.CCCCOLECTIESF = CCCLINIICIRCUIT.CCCCOLECTIESF;
	o.CCCCLADIRE = CCCLINIICIRCUIT.CCCCLADIRE;
	o.CCCPRIMARYSPACE = CCCLINIICIRCUIT.CCCPRIMARYSPACE;
	o.CCCSECONDARYSPACE = CCCLINIICIRCUIT.CCCSECONDARYSPACE;
	o.CCCINCAPERE = CCCLINIICIRCUIT.CCCINCAPERE;
	o.QTY1 = qty;

	arr.push(o);
}

function createAFL(linii) {
	var d = X.CreateObjForm('SALDOC[Form=AFL electric]');
	try {
		d.DbInsert;
		var h = d.FindTable('FINDOC');
		h.Edit;
		h.SERIES = 4074;
		h.PRJC = CCCHEADER.PRJC;
		h.CCCFLMR = CCCHEADER.FLEL;
		h.CCCHEADER = CCCHEADER.CCCHEADER;
		h.CCCSTATUS = 2123;
		if (!CCCTABLOURI.CCCTABLOU) {
			dispose(d);
			return;
		} else {
			h.CCCTABLOURI = CCCTABLOURI.CCCTABLOU;
		}
		if (!CCCCIRCUIT.CCCCIRCUIT) {
			dispose(d);
			return;
		} else {
			h.INT01 = CCCCIRCUIT.CCCCIRCUIT;
		}
		h.CCCSERVICIU = 1; //no poup in linii

		var l = d.FindTable('ITELINES');
		for (var i = 0; i < linii.length; i++) {
			var r = 0,
				s = 0;
			r = CCCCONSUMATOR.LOCATE('CCCCONSUMATOR', linii[i].CCCCONSUMATOR);
			if (r)
				s = CCCARTGEN.LOCATE('CCCMTRLGEN', CCCCONSUMATOR.CCCMTRLGEN);
			if (r == 1) {
				l.APPEND;
				if (s == 1 && CCCARTGEN.MTRLSTOCABIL) {
					l.MTRL = CCCARTGEN.MTRLSTOCABIL;
				} else {
					l.MTRL = CCCCONSUMATOR.CCCMTRLGEN;
					//l.CCCMTRLGENINIT = CCCCONSUMATOR.CCCMTRLGEN;
				}
				if (linii[i].QTY)
					l.QTY1 = linii[i].QTY1;
				else
					l.QTY1 = 1;
				l.CCCMTRLGEN = CCCCONSUMATOR.CCCMTRLGEN;
				if (linii[i].CCCSPECIALITATESF)
					l.CCCSPECIALITATESF = linii[i].CCCSPECIALITATESF;
				if (linii[i].CCCSF)
					l.CCCSF = linii[i].CCCSF;
				if (linii[i].CCCCOLECTIESF)
					l.CCCCOLECTIESF = linii[i].CCCCOLECTIESF;
				if (linii[i].CCCCOLECTIESF)
					l.CCCCOLECTIESF = linii[i].CCCCOLECTIESF;
				if (CCCTABLOURI.CCCTABLOU)
					l.CCCTABLOURI = CCCTABLOURI.CCCTABLOU;
				if (CCCCIRCUIT.CCCCIRCUIT)
					l.CCCCIRCUIT = CCCCIRCUIT.CCCCIRCUIT;
				if (linii[i].CCCCLADIRE)
					l.CCCCLADIRE = linii[i].CCCCLADIRE;
				if (linii[i].CCCPRIMARYSPACE)
					l.CCCPRIMARYSPACE = linii[i].CCCPRIMARYSPACE;
				if (linii[i].CCCSECONDARYSPACE)
					l.CCCSECONDARYSPACE = linii[i].CCCSECONDARYSPACE;
				if (linii[i].CCCINCAPERE)
					l.CCCINCAPERE = linii[i].CCCINCAPERE;
				l.BOOL02 = 1;
				l.POST;
			}
		}

		var id = d.SHOWOBJFORM();
		if (id) {
			/*CCCCIRCUIT.DEVIZ = id;
			var r = X.RUNSQL('insert into CCCAFL (CCCHEADER, CCCCIRCUIT, FINDOC) ' +
			'VALUES (:CCCLINIICIRCUIT.CCCHEADER, :CCCLINIICIRCUIT.CCCCIRCUIT, ' + id + ')', null);
			X.EXEC('button:Save');*/
		}

	} catch (e) {
		X.WARNING(e.message);
	} finally {
		dispose(d);
	}
}

function createAndOrLinkGeneric(nume, ds, strObj, id, esteMM) {
	//debugger;

	var o = X.CreateObj('ITEM'),
		mtrl = X.SQL('select isnull(mtrl, 0) from mtrl where name = \'' + nume + '\' and mtracn=16 and cccheader=' + CCCHEADER.CCCHEADER, null);
	//if mtrl does not exists by name then create mtrl and link it
	if (!mtrl) {
		try {
			o.DBInsert;
			var t = o.FindTable('MTRL');
			t.Edit;
			var n = X.SQL(" select FORMAT(max(dbo.udf_GetNumeric(code)) + 1, '0######')from mtrl where isnull(cccprjc, 0) <> 0 ", null);
			if (!n)
				n = '0000001'; //primul
			t.CODE = 'ARTGEN-' + n;
			t.MTRTHIRD = 1;
			t.REMAINMODE = 1;
			t.NAME = nume.toString() + ' (M.G.I.)';
			t.CCCHEADER = CCCHEADER.CCCHEADER ? CCCHEADER.CCCHEADER : X.NEWID;
			t.CCCPRJC = CCCHEADER.PRJC;
			t.VAT = 0;
			t.MTRACN = 16;
			t.MTRUNIT1 = 1;
			t.SODTYPE = 51;
			if (esteMM)
				t.CCCESTEMATERIALMARUNT = 1;
			t.REMARKS = 'Articol generic creat automat din schema electrica';
			mtrl = o.DBPost;
			if (ds && strObj && id)
				if (mtrl) {
					if (ds.LOCATE(strObj, id) == 1) {
						ds.CCCMTRLGEN = mtrl;
						ds.POST;
					}
				}
		} catch (e) {
			if (strObj && id)
				X.WARNING(e.message + '/' + nume + '/' + strObj + '/' + id);
			else
				X.WARNING(e.message + '/' + nume);
		} finally {
			o.FREE;
			o = null;
		}
	}

	return mtrl;
}

function ON_CCCCONSUMATOR_DENUMIRE() {
	/*
	if (CCCCONSUMATOR.LOCATE('DENUMIRE', CCCCONSUMATOR.DENUMIRE) == 1) {
	CCCCONSUMATOR.DENUMIRE = '';
	X.WARNING('Mai exista un consumator cu aceasta denumire.');
	}
	 */
}

function consumatorExistent(l, str) {
	for (var i = 0; i < l.length; i++) {
		if (l[i].denumire.toLowerCase().trim() == str.toLowerCase().trim()) {
			return true;
		}
	}

	return false;
}

var itsMeOld = false;

function ON_CCCARTGEN_MTRLSTOCABIL() {
	debugger;
	if (itsMeOld)
		return;

	if (!CCCARTGEN.MTRLSTOCABIL) {
		replaceMtrlGen();
		return;
	} else {
		X.EXCEPTION('\nNu puteti inlocui materialul stocabil anterior...');
	}

	var it = X.CreateObjForm('ITEM[Form=Vizualizare articole,List=Lista articole]');
	try {
		it.DBLocate(CCCARTGEN.MTRLSTOCABIL);
		var m = it.FindTable('MTRL');
		if (m && m.ISNULL('CCCESTEMATERIALMARUNT')) {
			X.WARNING('Va rog decideti daca articolul este material marunt.');
			var id = it.SHOWOBJFORM();
			if (m && m.ISNULL('CCCESTEMATERIALMARUNT')) {
				X.WARNING('Nicio categorisire, nu va fi inlocuit');
				return;
			}
		}
	} catch (err) {
		X.WARNING(err.message);
	} finally {
		//daca nu este material marunt inlocuieste pe flux; cel marunt nu intra pe flux
		if (m && !m.ISNULL('CCCESTEMATERIALMARUNT')) //daca are ori 0 ori 1, nu si null
			if (m && m.CCCESTEMATERIALMARUNT == 0) {
				replaceMtrlGen(); //nu este material marunt
			} else {
				X.WARNING('Material marunt detectat, nu va fi inlocuit.');
			}
		it.Free;
	}
}

function getDocsWithArtGen(artGen) {
	return X.GETSQLDATASET('select distinct f.findoc, f.fincode, f.trndate ' +
		'from findoc f ' +
		'inner join mtrlines ml on (f.findoc=ml.findoc and f.sosource=ml.sosource and f.company=ml.company and ml.mtrl=' + artGen + ')' +
		//'where f.sosource=1351 and f.series in (4067) ' +
		'where f.sosource=1351 and f.series in (4067, 4068, 4073) ' +
		'and isnull(f.iscancel, 0) = 0 and f.cccheader=' + CCCHEADER.CCCHEADER, null);
}

function replaceMtrlGen() {
	//debugger;
	//inlocuire in liste (consumatori/surse)
	if (CCCTABLOURI.LOCATE('CCCMTRLGEN', CCCARTGEN.CCCMTRLGEN) == 1) {
		if (CCCARTGEN.MTRLSTOCABIL)
			CCCTABLOURI.MTRL = CCCARTGEN.MTRLSTOCABIL;
		else
			CCCTABLOURI.MTRL = null;
	} else {
		if (CCCCONSUMATOR.LOCATE('CCCMTRLGEN', CCCARTGEN.CCCMTRLGEN) == 1) {
			if (CCCARTGEN.MTRLSTOCABIL)
				CCCCONSUMATOR.MTRL = CCCARTGEN.MTRLSTOCABIL;
			else
				CCCCONSUMATOR.MTRL = null;
		}
	}

	//afl, deviz, fl
	var dsDocs = getDocsWithArtGen(CCCARTGEN.CCCMTRLGEN),
		contorTotal = dsDocs.RECORDCOUNT,
		i = 1,
		multiQrys = '';
	if (dsDocs.RECORDCOUNT) {
		X.PROCESSMESSAGES();
		X.SETPROPERTY('PANEL', 'pInlocuireGenerice', 'CAPTION', 'doc nr. ' + i.toString() + '/ total ' + contorTotal.toString());
		i++;
		dsDocs.FIRST;
		while (!dsDocs.EOF) {
			if (dsDocs.findoc) {
				var dsLiniiDeInlocuit = X.GETSQLDATASET('select mtrlines from mtrlines where findoc=' + dsDocs.findoc + ' and mtrl=' + CCCARTGEN.CCCMTRLGEN, null),
					t1 = 'BEGIN TRANSACTION [Tran1] BEGIN TRY ',
					t2 = ' COMMIT TRANSACTION [Tran1] END TRY BEGIN CATCH ROLLBACK TRANSACTION [Tran1] END CATCH';

				if (dsLiniiDeInlocuit.recordcount > 0) {
					X.SETPROPERTY('PANEL', 'pInlocuireGenerice', 'CAPTION', 'doc nr. ' + i.toString() + '/ total ' + contorTotal.toString() + '/ linii ' + dsLiniiDeInlocuit.recordcount.toString());
					X.PROCESSMESSAGES();
					dsLiniiDeInlocuit.first;
					while (!dsLiniiDeInlocuit.eof) {
						multiQrys += 'update mtrlines set mtrl=' + CCCARTGEN.MTRLSTOCABIL + ' where sosource=1351 and findoc=' + dsDocs.findoc + ' and mtrlines=' + dsLiniiDeInlocuit.mtrlines + ';';
						dsLiniiDeInlocuit.next;
					}
				}
			}
			dsDocs.NEXT;
		}
	}

	if (multiQrys.length > 0) {
		var totalQry = t1 + multiQrys + t2;
		debugger;
		X.RUNSQL(totalQry, null);
		X.EXEC('button:Save');
		X.WARNING('Inlocuirea a luat sfarsit.');
		X.SETPROPERTY('PANEL', 'pInlocuireGenerice', 'CAPTION', 'Inlocuire coduri proiect cu materiale stocabile');
	} else {
		X.WARNING('Nu am ce inlocui.');
	}
}

function ON_CCCHEADER_PRJC() {
	CCCHEADER.DENUMIRE = 'Schema electrica ' + CCCHEADER.PRJC_PRJC_NAME;
	CCCHEADER.DATASCH = X.SYS.LOGINDATE;

	CCCCONSUMATOR.FIRST;
	while (!CCCCONSUMATOR.EOF) {
		CCCCONSUMATOR.PRJC = CCCHEADER.PRJC;
		CCCCONSUMATOR.NEXT;
	}

	CCCTABLOURI.FIRST;
	while (!CCCTABLOURI.EOF) {
		CCCTABLOURI.PRJC = CCCHEADER.PRJC;
		CCCTABLOURI.NEXT;
	}

	CCCCIRCUIT.FIRST;
	while (!CCCCIRCUIT.EOF) {
		CCCCIRCUIT.PRJC = CCCHEADER.PRJC;
		CCCCIRCUIT.NEXT;
	}

	CCCCLADIRE.FIRST;
	while (!CCCCLADIRE.EOF) {
		CCCCLADIRE.PRJC = CCCHEADER.PRJC;
		CCCCLADIRE.NEXT;
	}

	CCCPRIMARYSPACE.FIRST;
	while (!CCCPRIMARYSPACE.EOF) {
		CCCPRIMARYSPACE.PRJC = CCCHEADER.PRJC;
		CCCPRIMARYSPACE.NEXT;
	}

	CCCSECONDARYSPACE.FIRST;
	while (!CCCSECONDARYSPACE.EOF) {
		CCCSECONDARYSPACE.PRJC = CCCHEADER.PRJC;
		CCCSECONDARYSPACE.NEXT;
	}

	CCCINCAPERE.FIRST;
	while (!CCCINCAPERE.EOF) {
		CCCINCAPERE.PRJC = CCCHEADER.PRJC;
		CCCINCAPERE.NEXT;
	}

	CCCLINIICIRCUIT.FIRST;
	while (!CCCLINIICIRCUIT.EOF) {
		CCCLINIICIRCUIT.PRJC = CCCHEADER.PRJC;
		CCCLINIICIRCUIT.NEXT;
	}

	CCCARTGEN.FIRST;
	while (!CCCARTGEN.EOF) {
		CCCARTGEN.PRJC = CCCHEADER.PRJC;
		CCCARTGEN.NEXT;
	}

	protectieDublare();
}

function ON_DELETE() {
	var trece = false;
	for (var i = 0; i < canDel.length; i++) {
		if (X.SYS.GROUPS == canDel[i]) {
			trece = true;
			break;
		} else
			trece = false;
	}

	if (!trece) {
		X.EXCEPTION('Stergere interzisa, apelati la o persoana avizata.');
	}

	X.RUNSQL('delete from cccartgen where cccheader=' + CCCHEADER.CCCHEADER, null);
}

function ON_CCCARTGEN_DELETE() {
	var dsDocs = getDocsWithArtGen(CCCARTGEN.CCCMTRLGEN);
	if (dsDocs.RECORDCOUNT) {
		var strD = '';
		dsDocs.FIRST;
		while (!dsDocs.EOF) {
			strD += dsDocs.fincode + '/' + dsDocs.trndate + '\n';
			dsDocs.NEXT;
		}
		X.EXCEPTION('Nu se poate sterge, urmatoarele documente contin referinte:\n' + strD);
	}
}

function ON_CCCLINIICIRCUIT_NEW() {
	itsNew = true;
}

//-----------------
var cccheader = 6;

function makeSets() {
	var q = 'select cccconsumator, denumire, isnull(ccccladire, 0) ccccladire, isnull(cccprimaryspace, 0) cccprimaryspace' +
		', isnull(cccsecondaryspace, 0) cccsecondaryspace, isnull(cccincapere, 0) cccincapere, ' +
		'isnull(qty, 0) qty from cccconsumator where cccheader = ' + cccheader + ' order by denumire, cccconsumator';
	var ds = X.GETSQLDATASET(q, null);
	var l1 = [];
	ds.FIRST;
	while (!ds.EOF) {
		var o = {};
		o.cccconsumator = ds.cccconsumator > 0 ? ds.cccconsumator : 'null';
		o.denumire = ds.denumire;
		o.ccccladire = ds.ccccladire > 0 > 0 ? ds.ccccladire : 'null';
		o.cccprimaryspace = ds.cccprimaryspace > 0 ? ds.cccprimaryspace : 'null';
		o.cccsecondaryspace = ds.cccsecondaryspace > 0 ? ds.cccsecondaryspace : 'null';
		o.cccincapere = ds.cccincapere > 0 ? ds.cccincapere : 'null';
		o.qty = ds.qty;
		l1.push(o);
		ds.NEXT;
	}

	var prev = l1[0].denumire,
		l2 = [];
	l2.push(l1[0]);
	for (var i = 1; i < l1.length; i++) {
		if (l1[i].denumire != prev) {
			//alt set de cccconsumator cu aceasi denumire

			//prelucreaza-l pe cel din l2
			//1. alege primul
			var itStays = l2[0];
			//2. cu care inlocuiesti cccconsumator in toate liniile din toate circuitele care contin denumirea din l2
			if (l2 && l2.length > 1)
				replaceConsumator(itStays, l2);

			//2.5. muta geografia consu,atorilor din set in CCCCONSUMATORGEO
			if (l2 && l2.length > 1)
				moveLocation(l2, itStays);

			//3. sterge din CCCCONSUMATOR toate liniile care au denumirea din l2, mai putin primul
			if (l2 && l2.length > 1)
				delTheRest(l2);
			//4. reinit
			l2.length = 0;
			prev = l1[i].denumire;
			l2.push(l1[i]);
		} else {
			//aceasi denumire
			prev = l1[i].denumire;
			l2.push(l1[i]);
		}
	}

	//ultimul set
	itStays = l2[0];
	if (l2 && l2.length > 1)
		replaceConsumator(itStays, l2);
	if (l2 && l2.length > 1)
		moveLocation(l2, itStays);
	if (l2 && l2.length > 1)
		delTheRest(l2);
}

function replaceConsumator(replacement, lista) {
	//lista contine a) primul element si singurul care ramane, b) restul listei trebuie inlocuit cu primul
	var str = getStr(lista);
	var q = 'update cccliniicircuit set cccconsumator = ' + replacement.cccconsumator +
		' where cccheader = ' + cccheader + ' and cccconsumator in (' + str + ');';
	X.RUNSQL(q, null);
}

function moveLocation(lista, replacement) {
	//creaza o intrare in CCCCONSUMATORGEO pentru fiecare locatie
	for (var i = 0; i < lista.length; i++) {
		var q = 'insert into CCCCONSUMATORGEO (cccconsumator, ccccladire, cccprimaryspace, cccsecondaryspace, cccincapere, qty, cccheader) ' +
			'values (' + replacement.cccconsumator + ', ' + lista[i].ccccladire + ',' + lista[i].cccprimaryspace + ',' + lista[i].cccsecondaryspace +
			',' + lista[i].cccincapere + ',' + lista[i].qty + ', ' + cccheader + ')';
		X.RUNSQL(q, null);
	}
}

function delTheRest(lista) {
	var str = getStr(lista);
	var q = 'delete from cccconsumator where cccheader=' + cccheader + ' AND cccconsumator in (' + str + ')';
	X.RUNSQL(q, null);
}

function getStr(lista) {
	var str = '';
	for (var i = 1; i < lista.length - 1; i++) {
		str += lista[i].cccconsumator + ',';
	}
	str += lista[lista.length - 1].cccconsumator;

	return str;
}