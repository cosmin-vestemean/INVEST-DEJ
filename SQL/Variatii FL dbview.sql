CREATE VIEW CCCVARIATIIFL
AS
(
		SELECT fl.*
			,var.findoc docVariatii
			,var.fincode docVFincode
			,var.trndate docVTrndate
			,var.cccint01 afl
			,afl.fincode aflFincode
			,afl.trndate aflTrndate
			,afl.CCCSTATUS
			,var.qty1
			,dev.qty1 cantDev
		FROM (
			SELECT y.prjc
				,x.MTRL
				,x.CCCSPECIALIZARE
				,x.CCCCOLECTIE
				,x.CCCCAPITOL
				,x.CCCGRUPALUCRARI
				,x.CCCACTIVITATE
				,x.CCCCLADIRE
				,x.CCCPRIMARYSPACE
				,x.CCCSECONDARYSPACE
				,x.CCCINCAPERE
				,x.CCCTABLOURI
				,x.CCCCIRCUIT
				,x.CCCMTRLGEN
				,x.CCCSPECIALITATESF
				,x.CCCSF
				,x.CCCCOLECTIESF
				,x.sodtype
				,x.qty1 cantFL
				,m.mtrunit1 um
				,(
					SELECT COALESCE(CCCUNITATEMASURA, 0)
					FROM cccactivitate
					WHERE cccactivitate = COALESCE(x.CCCACTIVITATE, 0)
					) umActivit
			FROM mtrlines x
			INNER JOIN findoc y ON (
					y.findoc = x.findoc
					AND y.sosource = 1351
					AND y.series = 4067
					AND COALESCE(y.iscancel, 0) = 0
					)
			INNER JOIN mtrl m ON (
					m.mtrl = x.mtrl
					AND COALESCE(m.cccestematerialmarunt, 0) = 0
					)
			) fl
		LEFT JOIN (
			SELECT lv.*
				,v.fincode
				,v.trndate
				,v.prjc lucrare
			FROM mtrlines lv
			INNER JOIN findoc v ON (lv.findoc = v.findoc)
			WHERE series = 4073
				AND coalesce(lv.cccqtynr, 0) = 1
			) var ON (
				coalesce(var.lucrare, 0) = coalesce(fl.prjc, 0)
				AND coalesce(var.MTRL, 0) = coalesce(fl.mtrl, 0)
				AND coalesce(var.sodtype, 0) = coalesce(fl.sodtype, 0)
				AND coalesce(var.CCCSPECIALIZARE, 0) = COALESCE(fl.CCCSPECIALIZARE, 0)
				AND COALESCE(var.CCCCOLECTIE, 0) = COALESCE(fl.CCCCOLECTIE, 0)
				AND COALESCE(var.CCCCAPITOL, 0) = COALESCE(fl.CCCCAPITOL, 0)
				AND COALESCE(var.CCCGRUPALUCRARI, 0) = COALESCE(fl.CCCGRUPALUCRARI, 0)
				AND COALESCE(var.CCCACTIVITATE, 0) = COALESCE(fl.CCCACTIVITATE, 0)
				AND COALESCE(var.CCCCLADIRE, 0) = COALESCE(fl.CCCCLADIRE, 0)
				AND COALESCE(var.CCCPRIMARYSPACE, 0) = COALESCE(fl.CCCPRIMARYSPACE, 0)
				AND COALESCE(var.CCCSECONDARYSPACE, 0) = COALESCE(fl.CCCSECONDARYSPACE, 0)
				AND COALESCE(var.CCCINCAPERE, 0) = COALESCE(fl.CCCINCAPERE, 0)
				AND COALESCE(var.CCCTABLOURI, 0) = COALESCE(fl.CCCTABLOURI, 0)
				AND COALESCE(var.CCCCIRCUIT, 0) = COALESCE(fl.CCCCIRCUIT, 0)
				AND COALESCE(var.CCCMTRLGEN, 0) = COALESCE(fl.CCCMTRLGEN, 0)
				AND COALESCE(var.CCCSPECIALITATESF, 0) = COALESCE(fl.CCCSPECIALITATESF, 0)
				AND COALESCE(var.CCCSF, 0) = COALESCE(fl.CCCSF, 0)
				AND COALESCE(var.CCCCOLECTIESF, 0) = COALESCE(fl.CCCCOLECTIESF, 0)
				)
		LEFT JOIN (
			SELECT ml.prjc prjc_dev
				,ML.SODTYPE
				,ML.MTRL
				,SUM(ML.QTY1) QTY1
				,ML.CCCSPECIALIZARE
				,ML.CCCCOLECTIE
				,ML.CCCCAPITOL
				,ML.CCCGRUPALUCRARI
				,ML.CCCACTIVITATE
				,ML.CCCCLADIRE
				,ML.CCCPRIMARYSPACE
				,ML.CCCSECONDARYSPACE
				,ML.CCCINCAPERE
				,ML.CCCTABLOURI
				,ML.CCCCIRCUIT
				,ML.CCCMTRLGEN
				,ML.CCCSPECIALITATESF
				,ML.CCCSF
				,ML.CCCCOLECTIESF
			FROM MTRLINES ML
			WHERE ML.FINDOC IN (
					SELECT findoc
					FROM findoc
					WHERE sosource = 1351
						AND series = 4068
						AND iscancel = 0
					)
			GROUP BY ML.PRJC
				,ML.SODTYPE
				,ML.MTRL
				,ML.CCCSPECIALIZARE
				,ML.CCCCOLECTIE
				,ML.CCCCAPITOL
				,ML.CCCGRUPALUCRARI
				,ML.CCCACTIVITATE
				,ML.CCCCLADIRE
				,ML.CCCPRIMARYSPACE
				,ML.CCCSECONDARYSPACE
				,ML.CCCINCAPERE
				,ML.CCCTABLOURI
				,ML.CCCCIRCUIT
				,ML.CCCMTRLGEN
				,ML.CCCSPECIALITATESF
				,ML.CCCSF
				,ML.CCCCOLECTIESF
			) dev ON (
				coalesce(dev.prjc_dev, 0) = coalesce(fl.prjc, 0)
				AND coalesce(dev.MTRL, 0) = coalesce(fl.mtrl, 0)
				AND coalesce(dev.sodtype, 0) = coalesce(fl.sodtype, 0)
				AND coalesce(dev.CCCSPECIALIZARE, 0) = COALESCE(fl.CCCSPECIALIZARE, 0)
				AND COALESCE(dev.CCCCOLECTIE, 0) = COALESCE(fl.CCCCOLECTIE, 0)
				AND COALESCE(dev.CCCCAPITOL, 0) = COALESCE(fl.CCCCAPITOL, 0)
				AND COALESCE(dev.CCCGRUPALUCRARI, 0) = COALESCE(fl.CCCGRUPALUCRARI, 0)
				AND COALESCE(dev.CCCACTIVITATE, 0) = COALESCE(fl.CCCACTIVITATE, 0)
				AND COALESCE(dev.CCCCLADIRE, 0) = COALESCE(fl.CCCCLADIRE, 0)
				AND COALESCE(dev.CCCPRIMARYSPACE, 0) = COALESCE(fl.CCCPRIMARYSPACE, 0)
				AND COALESCE(dev.CCCSECONDARYSPACE, 0) = COALESCE(fl.CCCSECONDARYSPACE, 0)
				AND COALESCE(dev.CCCINCAPERE, 0) = COALESCE(fl.CCCINCAPERE, 0)
				AND COALESCE(dev.CCCTABLOURI, 0) = COALESCE(fl.CCCTABLOURI, 0)
				AND COALESCE(dev.CCCCIRCUIT, 0) = COALESCE(fl.CCCCIRCUIT, 0)
				AND COALESCE(dev.CCCMTRLGEN, 0) = COALESCE(fl.CCCMTRLGEN, 0)
				AND COALESCE(dev.CCCSPECIALITATESF, 0) = COALESCE(fl.CCCSPECIALITATESF, 0)
				AND COALESCE(dev.CCCSF, 0) = COALESCE(fl.CCCSF, 0)
				AND COALESCE(dev.CCCCOLECTIESF, 0) = COALESCE(fl.CCCCOLECTIESF, 0)
				)
		LEFT JOIN findoc afl ON (afl.findoc = var.cccint01)
			--where fl.prjc=27532
			--ORDER BY fl.sodtype
			--	,fl.mtrl
		)
	--exclude materialele marunte
	--coloana AFL validat
	--conventie de transmis: inhibare doc nou la afl like
	--um = ore => filtru
	--email cu cele 8 linii din oferta rapoarte un se regasesc in UI
	--meniurile unde se regasesc (enumerare si print screen)
	--sync pe test
