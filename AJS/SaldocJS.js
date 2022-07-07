//// SaldocJS
lib.include('JSCommon');
lib.include('utils');

//if SALDOC.SERIES not in seriesExcluded then set editors
function setEditors(series) {
    var excludedSeries = [4065];
    if (excludedSeries.indexOf(series) == -1) {
        setEditorsOnElectricalFields(':SALDOC.CCCHEADER', 'ITELINES.CCCTABLOURI', 'ITELINES.CCCCIRCUIT', 'ITELINES.CCCMTRLGEN', ':ITELINES.CCCTABLOURI', ':ITELINES.CCCCIRCUIT');
        setEditorsOnElectricalFields(':SALDOC.CCCHEADER', 'SRVLINES.CCCTABLOURI', 'SRVLINES.CCCCIRCUIT', 'SRVLINES.CCCMTRLGEN', ':SRVLINES.CCCTABLOURI', ':SRVLINES.CCCCIRCUIT');

        setEditorOnFunctionalFields('ITELINES.CCCSPECIALITATESF', 'ITELINES.CCCSF', 'ITELINES.CCCCOLECTIESF', ':ITELINES.CCCSPECIALITATESF', ':ITELINES.CCCSF');
        setEditorOnFunctionalFields('ITELINES.CCCSPECIALITATESF', 'SRVLINES.CCCSF', 'SRVLINES.CCCCOLECTIESF', ':SRVLINES.CCCSPECIALITATESF', ':SRVLINES.CCCSF');

        setEditorOnGeographicalFields(':SALDOC.CCCHEADER', 'ITELINES.CCCCLADIRE', 'ITELINES.CCCPRIMARYSPACE', 'ITELINES.CCCSECONDARYSPACE', 'ITELINES.CCCINCAPERE', ':ITELINES.CCCCLADIRE', ':ITELINES.CCCPRIMARYSPACE', ':ITELINES.CCCSECONDARYSPACE');
        setEditorOnGeographicalFields(':SALDOC.CCCHEADER', 'SRVLINES.CCCCLADIRE', 'SRVLINES.CCCPRIMARYSPACE', 'SRVLINES.CCCSECONDARYSPACE', 'SRVLINES.CCCINCAPERE', ':SRVLINES.CCCCLADIRE', ':SRVLINES.CCCPRIMARYSPACE', ':SRVLINES.CCCSECONDARYSPACE');

        setEditorOnActivitateFields(':SALDOC.PRJC', 'SRVLINES.CCCSPECIALIZARE', 'SRVLINES.CCCCOLECTIE', 'SRVLINES.CCCCAPITOL', 'SRVLINES.CCCGRUPALUCRARI', 'SRVLINES.CCCACTIVITATE', ':SRVLINES.CCCSPECIALIZARE', ':SRVLINES.CCCCOLECTIE', ':SRVLINES.CCCCAPITOL', ':SRVLINES.CCCGRUPALUCRARI');
    }
}