import fs from "fs";

import captureWebsite from 'capture-website';
import fetch from 'node-fetch';
import fsExtra from 'fs-extra';
import JSZip from "jszip";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'webscreenshot.sender@gmail.com',
        pass: 'johncube123'
    }
});

export default async function app(link = "https://www.youtube.com/", mailAdress = "marcin.complak@johncube.pl"){
    const zipName = "images";
    const dirPath = "public/images";
    const emailTitle = "promised images";

    //checking whether link is correct.
    try{
        await fetch(link);
    }
    catch{
        return false;
    }

    clearDirectory(dirPath);
    const imageNames = await createImages(link);
    await zipImages();
    emailWithFile(emailTitle, mailAdress, `public/images/${zipName}.zip`);
    return imageNames;
}

function clearDirectory(path){
    fsExtra.emptyDirSync(path);
}

async function createImages(link){
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
    const imageNames = [];
    let path;

    for(let i = 0; i < imagesResolutions.length; i++){
        path = `public/images/image${i+1}.jpg`;
        imageNames.push(`image${i+1}.jpg`);
        photoPromises.push(
            createImage(link, path, imagesResolutions[i]["width"], imagesResolutions[i]["height"])
        );
    }
    await Promise.all(photoPromises);
    return imageNames;
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
    while(fs.existsSync(`public/images/image${i}.jpg`)){
        zip.file(`image${i}.jpg`, fs.readFileSync(`public/images/image${i}.jpg`),{base64: true});
        i++;
    }
    if(i === 1){
        return;
    }

    const content = await zip.generateAsync({type: "nodebuffer"});
    fs.writeFileSync("public/images/images.zip",content);
}

function emailWithFile(emailTitle, mailAdress, path){
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