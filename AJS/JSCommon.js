//// JSCommon - refactoring

lib.include('JSFileSys');

/*records performance of a function
like this:
var oraStart = new Date().getTime(),
	oraStop,
	durataExecSec;
call_to_a_function();
oraStop = new Date().getTime(),
durataExecSec = (oraStop - oraStart) / 1000;
recPerf(durataExecSec, SALDOC.FINDOC, ITELINES.RECORDCOUNT+SRVLINES.RECORDCOUNT, X.SYS.USER, 'call_to_a_function');
*/
function recPerf(durataExec_s, findoc, nrLnii, usr, partName) {
    //FNNAME = Function name
    //partName: function within function
    var caller = recPerf.caller.toString().split('()')[0],
        fnName = partName ? caller + '>' + partName : caller,
        createTblQ = 'create table CCCRECPERF (CCCRECPERF int not null identity(1,1) primary key, FNNAME VARCHAR(MAX) NOT NULL, ' +
        'DATA datetime not null default getDate(), DURATAEXECS FLOAT NOT NULL, ' +
        'findoc int not null, NRLINII float not null, usr int not null)',
        theQ = "if OBJECT_ID('dbo.CCCRECPERF') is null " + createTblQ;

    try {
        X.RUNSQL(theQ, null);

        X.RUNSQL("insert into CCCRECPERF (FNNAME, DURATAEXECS, FINDOC, NRLINII, USR) values ('" +
            fnName + "', " + durataExec_s + "," + findoc + "," + nrLnii + "," + usr + ")", null);
    } catch (err) {
        X.WARNING(err.message);
        debugger;
    }
}

//salveaza b64 obtinut din pdf factura, daca nu s-a creat deja, dar doar pentru documente care afecteaza valoric
function printDocToB64(f, t, c) {
    //(findoc, trndate, fincode)

    function createTblPrintB64() {
        var createTblQ = 'create table CCCPRINTB64 (CCCPRINTB64 int not null identity(1,1) primary key, dataCreare datetime not null default getDate(), printb64 varchar(max) not null, ' +
            'findoc int not null, trndate date not null)',
            theQ = "if OBJECT_ID('dbo.CCCPRINTB64') is null " + createTblQ;

        X.RUNSQL(theQ, null);
    }

    //daca nu are deja
    var q = "SELECT isnull(a.findoc, 0) FROM TRDTRN A JOIN TPRMS B ON A.COMPANY = B.COMPANY AND A.SODTYPE = B.SODTYPE AND A.TPRMS = B.TPRMS WHERE A.COMPANY IN (50) " +
        "AND A.SODTYPE = 13 AND(A.TRNVAL * B.FLG02 <> 0 OR A.TRNVAL * B.FLG01 <> 0) AND a.sosource = 1351 and a.findoc = " + f,
        ret = false;

    if (!X.SQL('select isnull(findoc, 0) from CCCPRINTB64 where findoc =' + f, null)) {
        if (X.SQL(q, null)) {
            //daca doc imi afecteaza vanzarea
            try {
                createTblPrintB64();
                var invPdf = printInvoice(f, 'SALDOC', 107, c),
                    b64 = invPdf ? encode64(invPdf) : '';
                if (b64) {
                    X.RUNSQL("insert into CCCPRINTB64 (printb64, findoc, trndate) values ('" + b64 + "', " + f + ", '" + t + "')", null);
                    ret = true;
                }
                if (invPdf)
                    delFile(invPdf);
            } catch (err) {
                X.WARNING('Generarea facturi tiparite pentru download eronata.\n' + err.message);
                ret = false;
            }
        } else
            ret = true;
    } else
        ret = true;

    return ret;
}

function printInvoice(f, strModul, printTemplate, fincode) {
    //(findoc, 'SALDOC', 107, fincode)
    var folderPath = 'C:\\S1Print\\FTP\\Online\\';
    if (f) {
        try {
            createPath(folderPath);
            sal = X.CreateObj(strModul);
            sal.DBLocate(f);
            pdfFile = folderPath + fincode + '.pdf';
            sal.PRINTFORM(printTemplate, 'PDF file', pdfFile);
            return pdfFile;
        } catch (e) {
            X.WARNING(e.message);
            return null;
        }
    } else {
        return false;
    }
}

//Reads a binary file, returns a string
function encode64(from) {
    var inputStream = new ActiveXObject("ADODB.Stream");
    inputStream.Type = 1;
    inputStream.Open();
    inputStream.LoadFromFile(from);

    var versions = ["MSXML2.DOMDocument.6.0",
        "MSXML2.DOMDocument.3.0",
        "MSXML2.DOMDocument"
    ];

    for (var i = 0; i < 3; i++) {
        try {
            xmlDoc = new ActiveXObject(versions[i]);

            if (xmlDoc)
                break;
        } catch (ex) {
            xmlDoc = null;
        }
    }

    var element = xmlDoc.createElement("Base64Data");
    element.dataType = "bin.base64";

    element.nodeTypedValue = inputStream.Read();

    inputStream.Close();

    return element.text;
}

//blockDuplicate(CCCCOLECTIE, CCCCOLECTIE.COLLECTION, 'CCCCOLECTIE.COLLECTION', 'CCCCOLECTIE.ISACTIVE')
function blockDuplicateByFilter(ds, fldVal, filterFld, activeFld, semafoarele) {
    var ret = false;
    ds.FILTER = "({" + filterFld + "}='" + fldVal + "' AND {" + activeFld + "}=1)";
    ds.FILTERED = 1;

    ds.FIRST;
    var i = 0;
    while (!ds.eof) {
        i++;
        ds.next;
    }
    if (i > 1) {
        X.warning('Duplicat.');
        //bypass delete events, if it's the case
        semafoarele.del = true;
        ds.DELETE;
        semafoarele.del = false;
        i = 0;
        ret = true;
    }

    ds.FILTER = "({" + activeFld + "}=1)";
    ds.FILTERED = 1;

    return ret;
}

function blockDuplicate(ds, tbl, pk, col, colVal, fkCol, fkVal, semafoarele) {
    var x = locateNextInTree(tbl, pk, col, colVal, fkCol, fkVal);
    try {
        if (x) {
            X.WARNING('Duplicat.');
            semafoarele.del = true;
            ds.DELETE;
            semafoarele.del = false;
            return x;
        } else {
            return x;
        }
    } catch (e) {}

    function locateNextInTree(tbl, pk, col, colVal, fkCol, fkVal) {
        if (typeof colVal == 'string')
            colVal = "'" + colVal + "'";

        if (fkCol)
            return X.SQL("select top 1 isnull(" + pk + ", 0) from " + tbl + " where " + fkCol + "=" + fkVal + " and " + col + "=" + colVal, null);
        else
            return X.SQL("select top 1 isnull(" + pk + ", 0) from " + tbl + " where " + col + "=" + colVal, null); //lista
    }
}


function fieldToUpperCase(fldVal) {
    if (fldVal != fldVal.toUpperCase()) {
        return fldVal.toUpperCase();
    } else {
        return fldVal;
    }
}