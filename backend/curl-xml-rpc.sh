#!/bin/bash
#
# File: curl-xml-rpc.sh
#
# Copyright © 2014 by Rodrigue Chakode <rodrigue.chakode@gmail.com>
#
# This file is part of oneInsight, authored by Rodrigue Chakode as part of 
# RealOpInsight Labs (http://realopinsight.com).
#
# oneInsight is licensed under the Apache License, Version 2.0 (the "License"); 
# you may not use this file except in compliance with the License. You may obtain 
# a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software distributed 
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
# CONDITIONS OF ANY KIND, either express or implied. See the License for the 
# specific language governing permissions and limitations under the License.


# get the destination directory
DEST_DIR=$1

# Check environment variables
if [ -z "$ONE_AUTH" ] ; then
  if [ -z "$ONE_AUTH_STRING" ]; then
    echo "error: neither ONE_AUTH nor ONE_AUTH_STRING set"
    exit 1
  fi
else
  ONE_AUTH_STRING=$(tail -1 ${ONE_AUTH})
fi

if [ -z "$ONE_XMLRPC" ] ; then
  echo "error: ONE_XMLRPC not set"
  exit 1
fi


# Now all is ok perform XML-RPC request
curl -H "Content-Type: text/xml" -X POST \
  -d "<?xml version='1.0'?>
      <methodCall>
        <methodName>one.hostpool.info</methodName>
        <params>
          <param>
            <value><string>$ONE_AUTH_STRING</string></value>
          </param>
        </params>
      </methodCall>" $ONE_XMLRPC 1> $DEST_DIR/hostpool.xml

if [ $? -ne 0 ]; then
  echo "error: request terminated with error"
  exit 1
fi 

echo "completed"
