"use strict";

let input           = document.querySelector("input[type=file]");
let container       = document.getElementsByClassName("container")[0];

input.addEventListener('change', addUploadSession)

async function addUploadSession() {
    let file = input.files[0];
    if (!file) return;
    input.files = null;
    //check the files

    let fileSize = file.size;
    let fileName = file.name;
    let nameArray = fileName.split('.');
    let extension = nameArray.pop();
    let hash = nameArray + fileSize +'.' + extension;
    //get hash

    let url = 'http://upload.yangxiao.site:8080/api/upload/' +hash+'/maomi';
    let response = await fetch(url,{
        method: 'GET',
        headers:{
            'Content-Type': "application/json"
        }
    }).catch(alert);
    let result = await response.json();
    let startPoint = result.startPoint;
    let uploadUrl = result.url;
    //get the url and where to start

    await addNewUploadBox(file.name);

/*    let accessToken = await getAccessToken();
    let uploadURL = await getUploadURl(fileName, fileSize, accessToken);*/


    await resumableUpload(startPoint, fileSize, uploadUrl, file)

}

async function resumableUpload(startPoint, fileSize, uploadURL, file){
    let chunkSize = 90 * 320 * 1024;
    let pointer = startPoint;


    let thisBox         = container.lastElementChild;
    let progress        = thisBox.firstElementChild.getElementsByClassName('percentage')[0];
    let progressBar     = thisBox.lastElementChild.firstElementChild;
    let textBox         = thisBox.firstElementChild.lastElementChild;

    if(startPoint === -1) pointer = fileSize;

    let percentage = (pointer / fileSize * 100).toFixed(2);
    percentage += "%";
    progressBar.style.width = percentage;
    progress.innerHTML = percentage.toString();

    if(startPoint === -1){
        textBox.innerHTML = "完成";
        return;
    }

    while(pointer<fileSize-1){
        let end = pointer + chunkSize-1;

        if(end+1 >= fileSize) end = fileSize-1;


        await fetch(uploadURL,{
            method:"PUT",
            headers:{
                'Content-Length': chunkSize,
                'Content-Range': 'bytes ' + pointer + '-' + end + '/' + fileSize
            },

            body:file.slice(pointer, end+1)
        })

        let percentage = (end / fileSize * 100).toFixed(2);
        percentage += "%";
        progressBar.style.width = percentage;
        progress.innerHTML = percentage.toString();
        if(end === fileSize - 1 ){
            textBox.innerHTML = "完成";
        }

        pointer += chunkSize;
    }
}

/*
async function getAccessToken(){
    let url = 'http://localhost:8080/accessToken';

    let response = await fetch(url);

    let result = await response.json();

    return result.content;
}

async function getUploadURl(fileName, fileSize, accessToken){
    let randomNumber = Math.floor(Math.random() * 10);
    let url = 'https://microsoftgraph.chinacloudapi.cn/v1.0/sites/b79cb437-4139-484d-b585-45f4e7c101fc/drive/root:/'+randomNumber+fileName+':/'+'createUploadSession';
    url = encodeURI(url);
    let response = await fetch(url,{
        method: 'POST',
        headers:{
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': "application/json",
            body: '{"item": {"@microsoft.graph.conflictBehavior": "rename", "name": "' +encodeURI(fileName) +  '"}}'
        }
    }).catch(alert);

    let result = await response.json();

    return result.uploadUrl;
}*/

function addNewUploadBox(name){
    container.insertAdjacentHTML("beforeend", '' +
        '       <div class="uploadBox">\n' +
        '            <div class="info">\n' +
        '                <p class="fileName">' + name + '</p>\n' +
        '                <p class="percentage">0%</p>\n' +
        '                <p class="toggleBtn">上传中</p>\n' +
        '\n' +
        '            </div>\n' +
        '            <div class="progressbar">\n' +
        '                <div class="completeBar"></div>\n' +
        '            </div>\n' +
        '        </div>');
}