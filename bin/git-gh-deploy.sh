#!/bin/bash

if [ -z "$1" ]
then 
  echo "You didn't provide the directory. Correct use: sh ./bin/git-gh-deploy [directory]"
  exit 1
fi
git subtree push --prefix $1 origin gh-pages