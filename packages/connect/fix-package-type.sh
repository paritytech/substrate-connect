#!/bin/bash
#
#   Add package.json files to cjs/mjs subtrees
#

cat >dist/cjs/package.json <<!EOF
{
    "type": "module"
}
!EOF

cat >dist/mjs/package.json <<!EOF
{
    "type": "module"
}
!EOF
