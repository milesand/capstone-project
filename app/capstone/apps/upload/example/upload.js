function upload() {
    const f = document.getElementById("input").files[0];
    
    const fd = new FormData();
    fd.append('fileSize', f.size);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(event) {
        target = xhr.getResponseHeader('Location')
        var flow = new Flow({
            target: target,
            simultaneousUploads: 1,
        });
        flow.addFile(f);
        flow.upload();
        console.log("Done");
    });
    xhr.open('POST', '/api/upload/flow');
    xhr.send(fd);
}
