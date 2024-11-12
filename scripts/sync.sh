#!/bin/bash

# Get project directory path no matter where this script is called from
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

httrack "https://www.bikeworcester.org.uk" +squarespace.com/* +squarespace-cdn.com/* --quiet -O "$DIR/../html" -s0

exit 0
