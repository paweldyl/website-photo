import fs, { link } from "fs";

import captureWebsite from 'capture-website';
import fetch from 'node-fetch';
import fsExtra from 'fs-extra';
import JSZip from "jszip";
import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: "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"
    }
}));

async function app(link = "https://pawel-dyl.netlify.app/", mailAdress = "hakiros54@gmail.com"){
    const zipName = "images";
    const dirPath = "images";
    const emailTitle = "promised images";

    //checking whether link is correct.
    try{
        await fetch(link);
    }
    catch{
        console.log("wrong link");
        return false;
    }

    clearDirectory(dirPath);
    await createImages(link);
    await zipImages();
    emailWithFile(emailTitle, mailAdress, `images/${zipName}.zip`);
}

function clearDirectory(path){
    fsExtra.emptyDirSync(path);
}

function createImages(link){
    const imagesResolutions = [
        {
            width: 1920,
            height: 1080
        },
        {
            width: 768,
            height: 1024
        },
        {
            width: 320,
            height: 480
        }
    ]
    const photoPromises = [];
    let path;

    for(let i = 0; i < imagesResolutions.length; i++){
        path = `images/image${i+1}.jpg`;
        photoPromises.push(
            createImage(link, path, imagesResolutions[i]["width"], imagesResolutions[i]["height"])
        );
    }
    return Promise.all(photoPromises);
}

async function createImage(link, path, width, height){
    await captureWebsite.file(link, path,{
        width: width,
        height: height,
        delay:3, // delay to make sure that starting animations ended if page have any of these.
        type: "jpeg"
    });
}

async function zipImages(){
    const zip = new JSZip();
    let i = 1;
    while(fs.existsSync(`images/image${i}.jpg`)){
        zip.file(`image${i}.jpg`, fs.readFileSync(`images/image${i}.jpg`),{base64: true});
        i++;
    }
    if(i === 1){
        return;
    }
    const content = await zip.generateAsync({type: "nodebuffer"});

    fs.writeFileSync("images/images.zip",content);
}

function emailWithFile(emailTitle, mailAdress, path){
    console.log("sending email");
    transporter.sendMail({
        from: "webscreenshot.sender@gmail.com",
        to: mailAdress,
        subject: emailTitle,
        text: "photos of page",
        attachments: [
            {
                path: path
            }
        ]
    })
}


app();

//createImage("asdd", "images/image.jpg",720,480);


/*
server - obsługuje 
/ - zwraca strone z inputem który prowadzi do create-photos, do tego warunkowo wyświetla zdjęcia (lub jest tam js który pyta o te zdjęcia)
/create-photos wywołuje funkcję która tworzy zdjęcia i przekierowuje użytkownika do / jeśli nie udało się stworzyć zdjęć to zwraca informacje z błędem



app(link = "asddsada") robi zdjęcia, pakuje je do zipa, wysyła pocztą

createImage(link, width, height) - tworzy zdjęcie, zwraca promisa, jak się udało stworzyć zdjęcie to resolve - inaczej reject. 
*/