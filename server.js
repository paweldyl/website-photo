import path from "path";

import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';

import appp from "./app.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post("/take-pictures", (req,res,next) => {
    (async () => {
        const usersUrl = req.body.url;
        let imageNames;
        try{
            imageNames = await appp(usersUrl);
        }
        catch{
            res.redirect("/");
        }
        
        if(imageNames){
            res.render("index", {
                wrongUrl: false,
                showPhotos: true,
                photos: imageNames
            });
        }
        else{
            res.render("index", {
                wrongUrl: true,
                showPhotos: false,
                photos: []
            });
        }
    })();
});

app.use("/", (req,res,next) => {
    res.render("index", {
        wrongUrl: false,
        showPhotos: false,
        photos: []
    });
});

app.listen(3000);