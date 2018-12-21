#!/bin/bash
# Ce script permet de realiser la construction et le packaging du frontend du module SIGA.Dossiers
echo '--- Demarrage de la construction du frontend'

# Arret sur erreur
set -e

# Recuperation du chemin d'execution du script
SCRIPT_HOME=`pwd`/$(dirname $0)

# Positionnement dans le repertoire "sources"
cd $SCRIPT_HOME/..
SOURCES_HOME=`pwd`

# Build du projet
echo 'Build du frontend'
docker run --rm --name siga -v "$PWD":/tmp -w /tmp node:8.9.4-alpine sh /tmp/build.sh

echo '--- Fin de la construction'

echo '--- Demarrage du packaging du frontend'

BINARIES_NAME=siga-dossiers-frontend-executables
mkdir -p $BINARIES_NAME

# Copie application web
cp -r $SOURCES_HOME/dist $BINARIES_NAME

# Creation archive du repertoire d'installation
tar -zcf $BINARIES_NAME.tgz ./$BINARIES_NAME

echo 'Fin de la construction et du packaging du frontend du module'
