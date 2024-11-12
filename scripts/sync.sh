#!/bin/bash

# Get target path from arguments and append to url, otherwise just use url "https://www.bikeworcester.org.uk"
URL="https://www.bikeworcester.org.uk"
if [ $# -eq 1 ]; then
    URL="$URL/$1"
fi

# Get project directory path no matter where this script is called from
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

httrack "$URL" +squarespace.com/* +squarespace-cdn.com/* --quiet -O "$DIR/../html" -s0

exit 0
