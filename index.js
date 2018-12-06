const axios = require("axios");
const fs = require("fs");
const XLSX = require("xlsx");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    (async () => {
        let d = await get_data();
        await write(d)
            .then(r => {
                res.download(`./${r}`, r, (err) => {
                    if(!err){
                        fs.unlinkSync(r)
                    }
                  });
            })
            .catch(e => {
                console.log(e)  
            })
    })();
});

const get_data = async () => {
    return new Promise(async (resolve, reject) => {
        try{
            let data = await axios.get("http://oxxogas.com/estaciones.php?a=1423679778&fbclid=IwAR2rjCh_meICRlR7HdgDy85XYOmLISWoId2PGa32hQ7SPZrT4p_qTaYHzXs")
            resolve(data.data)
        }catch(e){
            reject(new Error("Couldn't connect to oxxo endpoint"));
        }
    });
}

const write = async (stations) => {
    return new Promise((resolve, reject) => {
        let wn = "Sheet 1";
        let dd = new Date();
        let hd = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
        let fy = `./oxxo_${dd.getDate()}-${dd.getMonth()+1}-${dd.getFullYear()}.xlsx`;
        let op = {
            A:"ID",
            B:"Latitud",
            C:"Longitud",
            D:"Grupo",
            E:"Nombre",
            F:"Tipo",
            G:"Dirección",
            H: "Municipio_ID",
            I: "Municipio_Nombre",
            J: "ID_Plaza",
            K: "Logo",
            L: "¿Diesel?"
        };
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.json_to_sheet([op], {header: hd, skipHeader: true});
        
        try{
            XLSX.utils.sheet_add_json(ws, stations.markers, {skipHeader: true, origin: `A2`});
            XLSX.utils.book_append_sheet(wb, ws, wn);
            XLSX.writeFile(wb, fy);
            
            resolve(fy)
        }catch(e){
            reject(new Error(`Error aca: ${e}`));
        }    
    });
};


app.listen(process.env.PORT || 8082, () => {
    console.log("Working now...")
});