//// JSFileSys

function createPath(fldr) {
	var parts = fldr.split('\\'),
		c = parts[0],
		fso = new ActiveXObject("Scripting.FileSystemObject");
	for (var i = 1; i < parts.length - 1; i++) {
		c += '\\' + parts[i];
		if (!fso.FolderExists(c))
			fso.CreateFolder(c);
	}
}

function delFile(file) {
	var fso = new ActiveXObject("Scripting.FileSystemObject"),
		f2 = fso.GetFile(file);
	//f2.Copy ("c:\\Somth\\Bak");
	f2.Delete();
}