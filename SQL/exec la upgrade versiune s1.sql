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
GO

CREATE FUNCTION dbo.udf_GetNumeric (@strAlphaNumeric VARCHAR(256))
RETURNS VARCHAR(256)
AS
BEGIN
	DECLARE @intAlpha INT

	SET @intAlpha = PATINDEX('%[^0-9]%', @strAlphaNumeric)

	BEGIN
		WHILE @intAlpha > 0
		BEGIN
			SET @strAlphaNumeric = STUFF(@strAlphaNumeric, @intAlpha, 1, '')
			SET @intAlpha = PATINDEX('%[^0-9]%', @strAlphaNumeric)
		END
	END

	RETURN ISNULL(@strAlphaNumeric, 0)
END
GO

ALTER TABLE MTRLINES ADD CCCMTRLGENINIT INT NULL
GO

CREATE TABLE CCCMATERIALMARUNT (
	CCCMATERIALMARUNT INT NOT NULL IDENTITY(1, 1) PRIMARY KEY
	,PRJC INT NOT NULL
	,CCCHEADER INT NOT NULL
	,FINDOC INT NOT NULL
	,MTRLINES INT
	,MTRL INT NOT NULL
	,QTY1 FLOAT
	)
GO

CREATE TABLE CCCVARFLVIA (
	CCCVARFLVIA INT NOT NULL IDENTITY(1, 1) PRIMARY KEY
	,SURSA VARCHAR(50) NOT NULL
	,ISACTIVE SMALLINT NOT NULL DEFAULT 1
	)
GO

/*
vValoare=CUSTLINES.CNUM01 * CUSTLINES.CINT04_RSRC_HCOST
vValoareKM=CUSTLINES.CNUM05 * CUSTLINES.CINT04_RSRC_NUM04
UTBL02(W[SODTYPE=20 AND ISACTIVE=1])
CCCSUBANTRPRJCV(W[A.PRJC=:SALDOC.PRJC])
:SALDOC.CCCSUBANTREPRENOR
:SALDOC.FINDOC
:SALDOC.PRJC
*/
CREATE VIEW CCCSUBANTRPRJCV
AS
SELECT A.SUBANTREPRENOR AS CCCSUBANTREPRENOR
	,B.NAME
	,A.PRJC
FROM CCCSUBANTRPRJC A
INNER JOIN UTBL02 B ON (
		A.SUBANTREPRENOR = B.UTBL02
		AND B.SODTYPE = 20
		)
GO

CREATE TABLE CCCMATERIALMARUNT (
	CCCMATERIALMARUNT INT NOT NULL IDENTITY(1,1) PRIMARY KEY
	,PRJC INT
	,CCCCHEADER INT
	,FINDOC INT
	,MTRLINES INT
	,MTRL INT
	,QTY1 FLOAT
	,CCCCIRCUIT INT
	)
GO

ALTER TABLE CCCMATERIALMARUNT ADD CCCCLADIRE INT
	,CCCPRIMARYSPACE INT
	,CCCSECONDARYSPACE INT
	,CCCINCAPERE INT
	,CCCSPECIALITATESF INT
	,CCCSF INT
	,CCCCOLECTIESF INT
	,CCCTABLOURI INT
	,CCCMTRLGEN INT
	,MTRUNIT SMALLINT
	,CONVERTIT SMALLINT
GO

/****** Object:  View [dbo].[CCCCONSUMATORITEMV]    Script Date: 20.07.2022 11:54:31 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[CCCCONSUMATORITEMV]
AS
(
		SELECT DISTINCT A.CCCMTRLGEN
			,A.DENUMIRE AS CONSUMATOR
			,A.CCCHEADER
			,A.CCCCONSUMATOR
		FROM CCCCONSUMATOR A
		WHERE a.isactive = 1
		)
GO

/****** Object:  View [dbo].[CCCCOMBOS]    Script Date: 20.07.2022 11:55:13 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[CCCCOMBOS]
AS
(
		SELECT DISTINCT a.FINDOC
			,a.prjc
			,a.trndate
			,a.fincode
			,b.PRJCSTAGE
			,b.cccdeviz CCCDEVIZECM
			,b.cccspecialitateSF
			,b.cccsf
			,b.ccccolectiesf
			,b.ccctablou
		FROM findoc a
		INNER JOIN mtrlines b ON (
				a.findoc = b.findoc
				AND a.sosource = b.sosource
				AND a.company = b.company
				AND A.FPRMS = 4059
				AND A.SERIES = 4059
				AND A.ISCANCEL = 0
				)
		)
GO

/****** Object:  View [dbo].[CCCDEVIZEDECONVV]    Script Date: 20.07.2022 11:55:43 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[CCCDEVIZEDECONVV]
AS
(
		SELECT f.cccsumaagreata
			,f.findoc
			,f.fincode
			,f.trndate
			,f.prjc
			,f.ccctablouri sursa
			,f.int01 circuit
			,m.sodtype
			,m.cccmtrlgen
			,m.mtrl
			,m.qty1
			,m.ccccladire
			,m.cccprimaryspace
			,m.cccsecondaryspace
			,m.cccincapere
			,m.cccspecialitatesf
			,m.cccsf
			,m.ccccolectiesf
			,m.cccspecializare
			,m.ccccolectie
			,m.ccccapitol
			,m.cccgrupalucrari
			,m.cccactivitate
		FROM findoc f
		INNER JOIN mtrlines m ON (
				f.findoc = m.findoc
				AND f.sosource = f.sosource
				AND f.company = m.company
				)
		WHERE isnull(f.CCCSUMAAGREATA, 0) = 1
			AND f.iscancel = 0
			AND f.fprms = 4068
			AND f.series = 4068
		)
GO

/****** Object:  View [dbo].[CCCSUBANTRPRJCV]    Script Date: 20.07.2022 11:56:16 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[CCCSUBANTRPRJCV]
AS
SELECT A.SUBANTREPRENOR AS CCCSUBANTREPRENOR
	,B.NAME
	,A.PRJC
FROM CCCSUBANTRPRJC A
INNER JOIN UTBL02 B ON (
		A.SUBANTREPRENOR = B.UTBL02
		AND B.SODTYPE = 20
		)
GO

/****** Object:  View [dbo].[CCCVABC1]    Script Date: 20.07.2022 11:57:19 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[CCCVABC1]
AS
(
		SELECT b.abctrnlines
			,b.findoc
			,b.trndate
			,h.name
			,doc.fiscprd
			,doc.period
			,doc.sosource
			,doc.fprms
			,doc.series
			,doc.fincode
			,f.trdr
			,c.name mtrl
			,d.nume catcom
			,e.nume catcon
			,c.acnmsk chelt
			,c.acnmsk1 venit
			,a1.name prjc
			,a2.name zonageo
			,a3.name suc
			,a4.name partener
			,a5.name angajat
			,a6.name mijlfix
			,b.coef
			,b.amnt
			,b.ABCST1
			,isnull(p.cccdiv, 8) cccdiv
			,p.cccsuc
			,pe.utbl03
			,a.CCCCOMMENTS2
			,p.prjc idprjc
		FROM mtrlines a
		INNER JOIN findoc doc ON (
				doc.findoc = a.findoc
				AND doc.sosource = a.sosource
				AND doc.company = a.company
				)
		INNER JOIN abctrnlines b ON (
				a.findoc = b.findoc
				AND A.CCCABCTRNLINES = B.ABCTRNLINES
				AND a.company = b.company
				)
		INNER JOIN mtrl c ON (
				a.mtrl = c.mtrl
				AND a.sodtype = c.sodtype
				)
		LEFT JOIN ccctip d ON (a.ccctip = d.ccctip)
		LEFT JOIN cccsubtip e ON (a.cccsubtip = e.cccsubtip)
		LEFT JOIN trdr f ON (doc.trdr = f.trdr)
		LEFT JOIN abcst a1 ON (
				b.abcst1 = a1.abcst
				AND a1.dimension = 1
				)
		LEFT JOIN prjc p ON (a1.cccidcontextual = p.prjc)
		LEFT JOIN prjextra pe ON (pe.prjc = p.prjc)
		LEFT JOIN abcst a2 ON (
				b.abcst2 = a2.abcst
				AND a2.dimension = 2
				)
		LEFT JOIN abcst a3 ON (
				b.abcst3 = a3.abcst
				AND a3.dimension = 3
				)
		LEFT JOIN abcst a4 ON (
				b.abcst4 = a4.abcst
				AND a4.dimension = 4
				)
		LEFT JOIN abcst a5 ON (
				b.abcst5 = a5.abcst
				AND a5.dimension = 5
				)
		LEFT JOIN abcst a6 ON (
				b.abcst6 = a6.abcst
				AND a6.dimension = 6
				)
		LEFT JOIN tprms h ON (h.tprms = b.tprms)
		
		UNION ALL
		
		SELECT b.abctrnlines
			,b.findoc
			,b.trndate
			,h.name
			,a.fiscprd
			,a.period
			,a.sosource
			,a.fprms
			,a.series
			,a.fincode
			,NULL trdr
			,c.name mtrl
			,d.nume catcom
			,e.nume catcon
			,NULL chelt
			,NULL venit
			,a1.name prjc
			,a2.name zonageo
			,a3.name suc
			,a4.name partener
			,a5.name angajat
			,a6.name mijlfix
			,b.coef
			,b.amnt
			,b.ABCST1
			,isnull(p.cccdiv, 8) cccdiv
			,p.cccsuc
			,pe.utbl03
			,NULL CCCCOMMENTS2
			,p.prjc idprjc
		FROM acntrn a
		INNER JOIN abctrnlines b ON (
				a.acnheader = b.acnheader
				AND a.linenum = b.linenum
				AND a.acnedit = b.acnedit
				AND a.company = b.company
				)
		INNER JOIN acnt c ON (a.acnt = c.acnt)
		LEFT JOIN ccctip d ON (c.ccctip = d.ccctip)
		LEFT JOIN cccsubtip e ON (c.cccsubtip = e.cccsubtip)
		LEFT JOIN abcst a1 ON (
				b.abcst1 = a1.abcst
				AND a1.dimension = 1
				)
		LEFT JOIN prjc p ON (a1.cccidcontextual = p.prjc)
		LEFT JOIN prjextra pe ON (pe.prjc = p.prjc)
		LEFT JOIN abcst a2 ON (
				b.abcst2 = a2.abcst
				AND a2.dimension = 2
				)
		LEFT JOIN abcst a3 ON (
				b.abcst3 = a3.abcst
				AND a3.dimension = 3
				)
		LEFT JOIN abcst a4 ON (
				b.abcst4 = a4.abcst
				AND a4.dimension = 4
				)
		LEFT JOIN abcst a5 ON (
				b.abcst5 = a5.abcst
				AND a5.dimension = 5
				)
		LEFT JOIN abcst a6 ON (
				b.abcst6 = a6.abcst
				AND a6.dimension = 6
				)
		LEFT JOIN tprms h ON (h.tprms = b.tprms)
		)
GO

/****** Object:  View [dbo].[CCCVARIATIIFL]    Script Date: 20.07.2022 11:57:42 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[CCCVARIATIIFL]
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
GO


