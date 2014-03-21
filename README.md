RealOpInsight oneInsight
========================

Overview
--------
RealOpInsight oneInsight, or simply oneInsight, is a visualization add-on enables that allows 
to have an overview of the load of OpenNebula-managed hosts. oneInsight provides differents 
kinds of loads mapping, including for each host the mapping of:

* CPU used by virtual machines (VMs)
* Memory used by VMs
* Effective CPU usage (CPU used by all system processes, including 
  processes outside VM)
* Effective memory usage (memory used by all system processes, including 
  processes outside VMs)

Components
----------
oneInsight a fully HTML/Ajax/JJavascript stack built from modern Web libraries, 
such as, RaphaëlJs, jQuery, and Bootstrap.

A typical installation consist of the following components:
 
* A backend shell script ``curl-xml-rpc.sh`` to frequently pool host information
  via the OpenNebula's XML-RPC API. 
* A crontab entry to periodically run the pooling script. 
* A Web frontend served by a Web server, Apache or any other Web servers. 

Installation
============
oneInsight works almost out-of-box with any OpenNebula installation.
In a typical installation, oneInsight is deployed on the OpenNebula 
server but feel free to install it on any server that can communicate 
with OpenNebula via the network.

Requirements
------------
You need the following software on the installation:

* Unix/Linux operating
* curl command line interface
* Bash interpreter
* Cron time-based job scheduler
* A Web server

Get the Software
----------------
Go to the software home and download the latest tarball: 
http://realopinsight.com/oneinsight.

You can get the latest development versions via our Github repository: 
http://github.com/rchakode/realopinsight-oneinsight.

Choose the Installation Directory
---------------------------------

Installing the Pooling Script
-----------------------------

Installing the Web Frontend
---------------------------

Test It
-------


Securiry Considerations
-----------------------
oneInsight is fully Javascript/HTML based and doesn't provides any security mecanism.
However, there are options to improve the security of your deployment.

Authentication
~~~~~~~~~~~~~~
If you used Apache as Web server, htaccess can provide you with a basic authentication
mecanism.

Make basic authentication with Apache involves the following steps:
* To go the Web frontend installation directory
* Create a htaccess file
* Add a login/password to the htaccess file

Ciphering
---------
You can deploy the Web frontend in directory managed through TLS
by your Web server. Consult the documentation of your Web server for 
more details. 

