#!/bin/bash
# Script para instalar modulo del repo y mandar a zip
# NO SE PUEDE CORRER DENTRO DEL DIRECTORIO DEL PROYECTO

cd nodejs/
npm install https://github.com/Juan-DeLeon/provident-originacion-apilogger
cd ..

rm provident-originacion-apilogger.zip

zip -r provident-originacion-apilogger.zip nodejs
